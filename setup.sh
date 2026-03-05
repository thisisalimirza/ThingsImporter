#!/usr/bin/env bash
# BetterTasks — one-shot setup: Stripe product + Vercel deploy + env vars
#
# Usage (keys passed as environment variables, never stored in the file):
#   VERCEL_TOKEN="..." STRIPE_KEY="..." PAYMENT_TOKEN_SECRET="..." ./setup.sh
#
set -euo pipefail

: "${VERCEL_TOKEN:?  Set VERCEL_TOKEN before running}"
: "${STRIPE_KEY:?    Set STRIPE_KEY before running}"
: "${PAYMENT_TOKEN_SECRET:?  Set PAYMENT_TOKEN_SECRET before running}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  BetterTasks Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Install Vercel CLI if needed ────────────────────────────────────────
if ! command -v vercel &>/dev/null; then
  echo "▸ Installing Vercel CLI..."
  npm install -g vercel@latest --silent
fi

# ── 2. Initial deploy (gets us the project domain) ────────────────────────
echo "▸ Deploying to Vercel (preview build to capture domain)..."
DEPLOY_OUT=$(vercel deploy --token "$VERCEL_TOKEN" --yes 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUT" | grep -E "^https://" | tail -1)

if [[ -z "$DEPLOY_URL" ]]; then
  echo "✗ Could not capture deploy URL. Full output:"
  echo "$DEPLOY_OUT"
  exit 1
fi
DEPLOY_DOMAIN=$(echo "$DEPLOY_URL" | sed 's|https://||' | sed 's|/.*||')
echo "  Preview URL: https://$DEPLOY_DOMAIN"

# Try to find the canonical production domain (*.vercel.app)
echo "▸ Fetching production domain..."
PROJECT_JSON=$(curl -sf "https://api.vercel.com/v9/projects?search=bettertasks&limit=5" \
  -H "Authorization: Bearer $VERCEL_TOKEN" || echo "{}")
PROD_DOMAIN=$(echo "$PROJECT_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for p in data.get('projects', []):
    for a in p.get('alias', []):
        d = a.get('domain','')
        if 'vercel.app' in d and not any(x in d for x in ['--','preview']):
            print(d); break
" 2>/dev/null || echo "")

if [[ -z "$PROD_DOMAIN" ]]; then
  PROD_DOMAIN="$DEPLOY_DOMAIN"
fi
echo "  Domain: $PROD_DOMAIN"

SUCCESS_URL="https://${PROD_DOMAIN}/app?session_id={CHECKOUT_SESSION_ID}"
echo "  Stripe success URL: $SUCCESS_URL"
echo ""

# ── 3. Stripe: create product ──────────────────────────────────────────────
echo "▸ Creating Stripe product..."
PRODUCT=$(curl -sf https://api.stripe.com/v1/products \
  -u "${STRIPE_KEY}:" \
  -d name="BetterTasks" \
  -d "description=Capture tasks from anywhere and send them to Things 3, Reminders, or Todoist.")
PRODUCT_ID=$(echo "$PRODUCT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "  Product: $PRODUCT_ID"

# ── 4. Stripe: create price ($10 one-time) ─────────────────────────────────
echo "▸ Creating Stripe price (\$10 one-time)..."
PRICE=$(curl -sf https://api.stripe.com/v1/prices \
  -u "${STRIPE_KEY}:" \
  -d product="$PRODUCT_ID" \
  -d unit_amount=1000 \
  -d currency=usd)
PRICE_ID=$(echo "$PRICE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "  Price: $PRICE_ID"

# ── 5. Stripe: create payment link ─────────────────────────────────────────
echo "▸ Creating Stripe payment link..."
PAYMENT_LINK_RESP=$(curl -sf https://api.stripe.com/v1/payment_links \
  -u "${STRIPE_KEY}:" \
  -d "line_items[0][price]=${PRICE_ID}" \
  -d "line_items[0][quantity]=1" \
  --data-urlencode "after_completion[type]=redirect" \
  --data-urlencode "after_completion[redirect][url]=${SUCCESS_URL}")
PAYMENT_LINK_URL=$(echo "$PAYMENT_LINK_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['url'])")
echo "  Payment link: $PAYMENT_LINK_URL"
echo ""

# ── 6. Set env vars on Vercel ──────────────────────────────────────────────
echo "▸ Setting Vercel environment variables..."

set_env() {
  local KEY="$1" VALUE="$2"
  for ENV in production preview development; do
    printf '%s' "$VALUE" | vercel env add "$KEY" "$ENV" --token "$VERCEL_TOKEN" --yes 2>/dev/null || true
  done
  echo "  ✓ $KEY"
}

set_env "STRIPE_SECRET_KEY"               "$STRIPE_KEY"
set_env "PAYMENT_TOKEN_SECRET"            "$PAYMENT_TOKEN_SECRET"
set_env "NEXT_PUBLIC_STRIPE_PAYMENT_LINK" "$PAYMENT_LINK_URL"

# ANTHROPIC_API_KEY — prompt if not already set
EXISTING=$(vercel env ls --token "$VERCEL_TOKEN" 2>/dev/null | grep "ANTHROPIC_API_KEY" || true)
if [[ -z "$EXISTING" ]]; then
  echo ""
  echo "  ⚠  ANTHROPIC_API_KEY not found — this is required for task extraction."
  read -r -p "  Paste your Anthropic API key (sk-ant-...): " ANTHROPIC_KEY
  if [[ -n "$ANTHROPIC_KEY" ]]; then
    set_env "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY"
  else
    echo "  Skipped — add it in vercel.com → Project → Settings → Environment Variables"
  fi
else
  echo "  ✓ ANTHROPIC_API_KEY (already set)"
fi
echo ""

# ── 7. Production deploy ───────────────────────────────────────────────────
echo "▸ Deploying to production (with env vars)..."
PROD_URL=$(vercel deploy --prod --token "$VERCEL_TOKEN" --yes 2>&1 | grep -E "^https://" | tail -1)
echo ""

# ── Done ───────────────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓  All done!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Site:         https://$PROD_DOMAIN"
echo "  App (gated):  https://$PROD_DOMAIN/app"
echo "  Payment link: $PAYMENT_LINK_URL"
echo ""
echo "  Flow: user pays → Stripe redirects to /app?session_id=xxx"
echo "        → server verifies → signed token → localStorage → app opens"
echo ""
echo "  Keep this token safe (it signs all access tokens):"
echo "  PAYMENT_TOKEN_SECRET=$PAYMENT_TOKEN_SECRET"
echo ""
