import { useState } from "react";

export default function ReviewModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-sm">
        <h3 className="font-semibold mb-2">Reject Application</h3>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          rows={4}
          placeholder="Reason for rejection"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => onSubmit(reason)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
