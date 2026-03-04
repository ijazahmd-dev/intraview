// src/components/InterviewNotesModal.jsx

import React, { useEffect, useRef, useState, useCallback } from "react";

function InterviewNotesModal({
  isOpen,
  onClose,
  notesService,
  initialContent = "",
}) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [saveTimeout, setSaveTimeout] = useState(null);
  const textareaRef = useRef(null);

  // Debounced autosave - saves 1.5s after user stops typing
  const debouncedSave = useCallback(async (newContent) => {
    if (!notesService) return;

    setStatus("saving");
    
    try {
      await notesService.saveNotes(newContent);
      setStatus("saved");
    } catch (err) {
      console.error("Autosave failed:", err);
      setStatus("error");
    }

    // Clear "saved" status after 2s
    setTimeout(() => {
      if (status === "saved") setStatus("idle");
    }, 2000);
  }, [notesService, status]);

  // Handle content changes with debounced autosave
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Set new debounced save
    const timeout = setTimeout(() => {
      debouncedSave(newContent);
    }, 1500);

    setSaveTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, []);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
        style={{ minHeight: "300px", maxHeight: "500px" }}
      >
        {/* Header - draggable */}
        <div className="p-4 border-b flex items-center justify-between cursor-move select-none bg-gray-50 rounded-t-lg">
          <h3 className="font-semibold text-lg">Interview Notes</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Take notes about the candidate..."
            className="flex-1 w-full p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm leading-relaxed"
            rows="12"
          />
        </div>

        {/* Status bar */}
        <div className="p-3 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${
              status === "saving" ? "text-blue-600" :
              status === "saved" ? "text-green-600" :
              status === "error" ? "text-red-600" : "text-gray-500"
            }`}>
              {status === "saving" && "Saving..."}
              {status === "saved" && "Saved"}
              {status === "error" && "Save failed"}
              {status === "idle" && "Unsaved changes will autosave"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setStatus("saving");
                  try {
                    await debouncedSave(content);
                  } catch (err) {
                    setStatus("error");
                  }
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewNotesModal;
