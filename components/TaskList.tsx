"use client";

import { useState } from "react";

interface TaskListProps {
  tasks: string[];
  onTasksChange: (tasks: string[]) => void;
  onReset: () => void;
}

export default function TaskList({ tasks, onTasksChange, onReset }: TaskListProps) {
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const deleteTask = (index: number) => {
    onTasksChange(tasks.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(tasks[index]);
  };

  const commitEdit = (index: number) => {
    if (editValue.trim()) {
      const updated = [...tasks];
      updated[index] = editValue.trim();
      onTasksChange(updated);
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const addToThings = async () => {
    for (let i = 0; i < tasks.length; i++) {
      const url = `things:///add?title=${encodeURIComponent(tasks[i])}`;
      window.location.href = url;
      // Small delay so Things 3 can process each task
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-6">No tasks found in the image.</p>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-700 text-white rounded-2xl font-medium active:scale-95 transition-transform"
        >
          Try Another Photo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
        </h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-400 underline underline-offset-2"
        >
          Start over
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {tasks.map((task, i) => (
          <li
            key={i}
            className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            {editingIndex === i ? (
              <input
                autoFocus
                className="flex-1 bg-transparent text-white text-base outline-none border-b border-blue-400"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(i);
                  if (e.key === "Escape") {
                    setEditingIndex(null);
                    setEditValue("");
                  }
                }}
              />
            ) : (
              <span
                className="flex-1 text-white text-base cursor-pointer"
                onClick={() => startEdit(i)}
              >
                {task}
              </span>
            )}
            <button
              onClick={() => deleteTask(i)}
              className="text-gray-500 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0"
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {adding && (
        <div className="flex items-center gap-3 bg-gray-800 rounded-2xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-white text-base outline-none border-b border-blue-400"
            placeholder="New task..."
            onBlur={(e) => {
              if (e.target.value.trim()) {
                onTasksChange([...tasks, e.target.value.trim()]);
              }
              setAdding(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) onTasksChange([...tasks, val]);
                setAdding(false);
              }
              if (e.key === "Escape") setAdding(false);
            }}
          />
        </div>
      )}

      <button
        onClick={() => setAdding(true)}
        className="text-sm text-gray-400 text-left pl-2"
      >
        + Add task
      </button>

      <button
        onClick={addToThings}
        className="mt-2 w-full py-4 bg-blue-500 hover:bg-blue-400 active:scale-95 transition-all text-white text-lg font-semibold rounded-2xl shadow-lg shadow-blue-500/20"
      >
        Add All to Things 3
      </button>
    </div>
  );
}
