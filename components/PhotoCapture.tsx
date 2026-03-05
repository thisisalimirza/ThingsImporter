"use client";

import { useRef } from "react";

interface PhotoCaptureProps {
  onImageSelected: (base64: string, mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp") => void;
}

export default function PhotoCapture({ onImageSelected }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
    const mediaType = file.type as (typeof validTypes)[number];
    if (!validTypes.includes(mediaType)) {
      alert("Please select a JPEG, PNG, GIF, or WebP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Strip the data URL prefix — API wants raw base64
      const base64 = result.split(",")[1];
      onImageSelected(base64, mediaType);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {/* Camera button */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-5 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all text-white text-xl font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
          <path
            fillRule="evenodd"
            d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
            clipRule="evenodd"
          />
        </svg>
        Take Photo
      </button>

      {/* Upload button */}
      <button
        onClick={() => uploadRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-5 bg-gray-700 hover:bg-gray-600 active:scale-95 transition-all text-white text-xl font-semibold rounded-2xl"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7"
        >
          <path
            fillRule="evenodd"
            d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
            clipRule="evenodd"
          />
        </svg>
        Choose from Library
      </button>
    </div>
  );
}
