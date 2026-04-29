// // src/user/components/RescheduleRequestModal.jsx

// import React, { useEffect, useState } from 'react';
// import { X, Clock, Calendar, AlertCircle, CheckCircle, Loader } from 'lucide-react';
// import { toast } from 'sonner';
// import { candidateBookingsApi } from '../../candidateBookingsApi';
// import CalendarComponent from './CalendarComponent';

// const RescheduleRequestModal = ({ isOpen, booking, onClose, onRequestSent }) => {
//   const [step, setStep] = useState('loading'); 
//   // steps: loading | has_slots | no_slots | confirm | submitting | done
//   const [hasSlots, setHasSlots] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [note, setNote] = useState('');
//   const [error, setError] = useState('');

//   // Fetch availability options when modal opens
//   useEffect(() => {
//     if (!isOpen || !booking) return;
//     setStep('loading');
//     setSelectedSlot(null);
//     setNote('');
//     setError('');

//     candidateBookingsApi
//       .getRescheduleOptions(booking.id)
//       .then((res) => {
//         setHasSlots(res.data.has_slots);
//         setStep(res.data.has_slots ? 'has_slots' : 'no_slots');
//       })
//       .catch((err) => {
//         const msg =
//           err.response?.data?.detail || 'Failed to load available slots.';
//         setError(msg);
//         setStep('no_slots');
//       });
//   }, [isOpen, booking]);

//   if (!isOpen || !booking) return null;

//   const handleSubmit = async () => {
//     setStep('submitting');
//     try {
//       await candidateBookingsApi.submitRescheduleRequest(booking.id, {
//         proposed_availability_id: selectedSlot?.id ?? null,
//         note: note.trim(),
//       });
//       setStep('done');
//       onRequestSent?.();
//     } catch (err) {
//       const msg =
//         err.response?.data?.detail ||
//         Object.values(err.response?.data || {})?.[0] ||
//         'Failed to send request.';
//       toast.error(msg);
//       setStep(hasSlots ? 'has_slots' : 'no_slots');
//     }
//   };

//   // ── Helpers ────────────────────────────────────────────────────

//   const CurrentSlotCard = () => (
//     <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
//       <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
//         Current slot
//       </p>
//       <p className="font-bold text-slate-900 text-lg line-through">
//         {booking.start_time} – {booking.end_time}
//       </p>
//       <p className="text-sm text-rose-700 mt-0.5">{booking.date}</p>
//     </div>
//   );

//   const SelectedSlotCard = () =>
//     selectedSlot ? (
//       <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300">
//         <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
//           Proposed slot
//         </p>
//         <p className="font-bold text-slate-900 text-lg">
//           {selectedSlot.start_time} – {selectedSlot.end_time}
//         </p>
//         <p className="text-sm text-emerald-700 mt-0.5">{selectedSlot.date}</p>
//       </div>
//     ) : null;

//   // ── Render by step ─────────────────────────────────────────────

//   const renderBody = () => {
//     if (step === 'loading') {
//       return (
//         <div className="flex flex-col items-center justify-center py-16 gap-4">
//           <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
//           <p className="text-slate-500 font-medium">
//             Checking available slots…
//           </p>
//         </div>
//       );
//     }

//     if (step === 'done') {
//       return (
//         <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
//           <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
//             <CheckCircle className="w-9 h-9 text-emerald-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-slate-900">
//             Request Sent!
//           </h3>
//           <p className="text-slate-600 max-w-xs">
//             Your reschedule request has been sent to the interviewer. You'll be
//             notified once they respond.
//           </p>
//           <div className="w-full mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left">
//             <p className="text-sm font-semibold text-amber-800">
//               What happens next?
//             </p>
//             <ul className="mt-2 space-y-1 text-sm text-amber-700 list-disc list-inside">
//               <li>Interviewer reviews your request</li>
//               <li>If accepted, your session time updates automatically</li>
//               <li>If rejected, your original time is kept</li>
//             </ul>
//           </div>
//         </div>
//       );
//     }

//     if (step === 'submitting') {
//       return (
//         <div className="flex flex-col items-center justify-center py-16 gap-4">
//           <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
//           <p className="text-slate-500 font-medium">Sending request…</p>
//         </div>
//       );
//     }

//     if (step === 'no_slots') {
//       return (
//         <div className="space-y-6">
//           {error && (
//             <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
//               <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-rose-700">{error}</p>
//             </div>
//           )}

//           <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="font-semibold text-amber-800">
//                 No slots currently available
//               </p>
//               <p className="text-sm text-amber-700 mt-1">
//                 You can still send a request — let the interviewer know your
//                 preference and they'll find a new time.
//               </p>
//             </div>
//           </div>

//           <CurrentSlotCard />

//           <div>
//             <label className="block text-sm font-semibold text-slate-900 mb-2">
//               Preference / reason{' '}
//               <span className="text-slate-400 font-normal">(optional)</span>
//             </label>
//             <textarea
//               value={note}
//               onChange={(e) => setNote(e.target.value)}
//               placeholder="e.g. I'm available any evening this week, prefer after 5 PM…"
//               rows={4}
//               maxLength={500}
//               className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 resize-none text-sm"
//             />
//             <p className="text-xs text-slate-400 mt-1 text-right">
//               {note.length}/500
//             </p>
//           </div>
//         </div>
//       );
//     }

//     // step === 'has_slots'
//     return (
//       <div className="space-y-6">
//         <div className="grid md:grid-cols-2 gap-4">
//           <CurrentSlotCard />
//           {selectedSlot ? (
//             <SelectedSlotCard />
//           ) : (
//             <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
//               <p className="text-sm text-slate-400 text-center">
//                 Select a new slot from the calendar below
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Calendar */}
//         <div className="border border-slate-200 rounded-2xl p-4 bg-white">
//           <CalendarComponent
//             interviewerId={booking.interviewer_id}
//             excludeSlotId={booking.availability_id}
//             minDate={
//               new Date(Date.now() + 24 * 60 * 60 * 1000)
//                 .toISOString()
//                 .split('T')[0]
//             }
//             onSlotSelect={setSelectedSlot}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-semibold text-slate-900 mb-2">
//             Note to interviewer{' '}
//             <span className="text-slate-400 font-normal">(optional)</span>
//           </label>
//           <textarea
//             value={note}
//             onChange={(e) => setNote(e.target.value)}
//             placeholder="e.g. Need to reschedule due to a conflict…"
//             rows={3}
//             maxLength={500}
//             className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 resize-none text-sm"
//           />
//           <p className="text-xs text-slate-400 mt-1 text-right">
//             {note.length}/500
//           </p>
//         </div>
//       </div>
//     );
//   };

//   // ── Footer buttons ─────────────────────────────────────────────

//   const renderFooter = () => {
//     if (['loading', 'submitting'].includes(step)) return null;

//     if (step === 'done') {
//       return (
//         <button
//           onClick={onClose}
//           className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
//         >
//           Close
//         </button>
//       );
//     }

//     const isNoSlot = step === 'no_slots';
//     const canSubmit = isNoSlot || selectedSlot !== null;

//     return (
//       <div className="flex gap-3">
//         <button
//           onClick={onClose}
//           className="flex-1 py-4 border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleSubmit}
//           disabled={!canSubmit}
//           className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//           {selectedSlot ? (
//             <>
//               <CheckCircle className="w-5 h-5" />
//               Send Request
//             </>
//           ) : (
//             <>
//               <Clock className="w-5 h-5" />
//               {isNoSlot ? 'Send Request Anyway' : 'Select a slot first'}
//             </>
//           )}
//         </button>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
//       <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
//           <div>
//             <h2 className="text-2xl font-black text-slate-900">
//               Request Reschedule
//             </h2>
//             <p className="text-sm text-slate-500 mt-0.5">
//               Booking #{booking.id} — interviewer must approve
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             disabled={step === 'submitting'}
//             className="p-2 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
//           >
//             <X className="w-6 h-6 text-slate-500" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto p-6">{renderBody()}</div>

//         {/* Footer */}
//         {renderFooter() && (
//           <div className="p-6 border-t border-slate-200 flex-shrink-0">
//             {renderFooter()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RescheduleRequestModal;





































// src/user/components/RescheduleRequestModal.jsx

import React, { useEffect, useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { candidateBookingsApi } from '../../candidateBookingsApi';
import CalendarComponent from './CalendarComponent';

const RescheduleRequestModal = ({ isOpen, booking, onClose, onRequestSent }) => {
  const [step, setStep] = useState('loading');
  // steps: loading | has_slots | no_slots | submitting | done
  const [hasSlots, setHasSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Fetch availability options when modal opens
  useEffect(() => {
    if (!isOpen || !booking) return;
    setStep('loading');
    setSelectedSlot(null);
    setNote('');
    setError('');

    candidateBookingsApi
      .getRescheduleOptions(booking.id)
      .then((res) => {
        const data = res.data || res; // support both Axios full response or data
        const hasSlotsFlag = data.has_slots;
        setHasSlots(hasSlotsFlag);
        setStep(hasSlotsFlag ? 'has_slots' : 'no_slots');
      })
      .catch((err) => {
        const msg =
          err.response?.data?.detail || 'Failed to load available slots.';
        setError(msg);
        // If we cannot load options, fall back to "no_slots" view so user can at least notify
        setStep('no_slots');
      });
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    if (step === 'has_slots') {
      // Must have a selected slot to send a reschedule request
      if (!selectedSlot) {
        toast.error('Please select a new time slot.');
        return;
      }

      setStep('submitting');
      try {
        await candidateBookingsApi.submitRescheduleRequest(booking.id, {
          proposed_availability_id: selectedSlot.id,
          note: note.trim(),
        });
        setStep('done');
        onRequestSent?.();
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          Object.values(err.response?.data || {})?.[0] ||
          'Failed to send request.';
        toast.error(msg);
        setStep(hasSlots ? 'has_slots' : 'no_slots');
      }
      return;
    }

    if (step === 'no_slots') {
      // Notify interviewer to open new slots with preferred window text
      if (!note.trim()) {
        toast.error(
          'Please describe your preferred time (e.g. "tomorrow evening", "after 5 PM").'
        );
        return;
      }

      setStep('submitting');
      try {
        await candidateBookingsApi.notifyInterviewerForNewSlot(booking.id, {
          preferred_window: note.trim(),
        });
        setStep('done');
        onRequestSent?.();
      } catch (err) {
        const msg =
          err.response?.data?.detail ||
          Object.values(err.response?.data || {})?.[0] ||
          'Failed to notify the interviewer.';
        toast.error(msg);
        setStep('no_slots');
      }
    }
  };

  // ── Helpers ────────────────────────────────────────────────────

  const CurrentSlotCard = () => (
    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
      <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1">
        Current slot
      </p>
      <p className="font-bold text-slate-900 text-lg line-through">
        {booking.start_time} – {booking.end_time}
      </p>
      <p className="text-sm text-rose-700 mt-0.5">{booking.date}</p>
    </div>
  );

  const SelectedSlotCard = () =>
    selectedSlot ? (
      <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
          Proposed slot
        </p>
        <p className="font-bold text-slate-900 text-lg">
          {selectedSlot.start_time} – {selectedSlot.end_time}
        </p>
        <p className="text-sm text-emerald-700 mt-0.5">{selectedSlot.date}</p>
      </div>
    ) : null;

  // ── Render by step ─────────────────────────────────────────────

  const renderBody = () => {
    if (step === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-medium">
            Checking available slots…
          </p>
        </div>
      );
    }

    if (step === 'done') {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            Request Sent!
          </h3>
          <p className="text-slate-600 max-w-xs">
            Your request has been sent. You&apos;ll be notified once the interviewer
            responds.
          </p>
          <div className="w-full mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left">
            <p className="text-sm font-semibold text-amber-800">
              What happens next?
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-700 list-disc list-inside">
              <li>Interviewer reviews your request</li>
              <li>If accepted, your session time updates automatically</li>
              <li>If rejected, your original time is kept</li>
            </ul>
          </div>
        </div>
      );
    }

    if (step === 'submitting') {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-medium">Sending request…</p>
        </div>
      );
    }

    if (step === 'no_slots') {
      return (
        <div className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">
                No slots currently available
              </p>
              <p className="text-sm text-amber-700 mt-1">
                You can notify the interviewer to open new time slots. Let them
                know which times work best for you.
              </p>
            </div>
          </div>

          <CurrentSlotCard />

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Preferred time / reason{' '}
              <span className="text-slate-400 font-normal">(required)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='e.g. "Any weekday after 5 PM", "tomorrow evening", etc.'
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 resize-none text-sm"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {note.length}/500
            </p>
          </div>
        </div>
      );
    }

    // step === 'has_slots'
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <CurrentSlotCard />
          {selectedSlot ? (
            <SelectedSlotCard />
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
              <p className="text-sm text-slate-400 text-center">
                Select a new slot from the calendar below
              </p>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <CalendarComponent
            interviewerId={booking.interviewer_id}
            excludeSlotId={booking.availability_id}
            minDate={
              new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            }
            onSlotSelect={setSelectedSlot}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Note to interviewer{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Need to reschedule due to a conflict…"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 resize-none text-sm"
          />
          <p className="text-xs text-slate-400 mt-1 text-right">
            {note.length}/500
          </p>
        </div>
      </div>
    );
  };

  // ── Footer buttons ─────────────────────────────────────────────

  const renderFooter = () => {
    if (['loading', 'submitting'].includes(step)) return null;

    if (step === 'done') {
      return (
        <button
          onClick={onClose}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors"
        >
          Close
        </button>
      );
    }

    const isNoSlot = step === 'no_slots';
    const canSubmit = isNoSlot
      ? note.trim().length > 0
      : selectedSlot !== null;

    return (
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-4 border-2 border-slate-200 rounded-2xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isNoSlot ? (
            <>
              <Clock className="w-5 h-5" />
              Notify interviewer
            </>
          ) : selectedSlot ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Send Request
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              Select a slot first
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Request Reschedule
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Booking #{booking.id} — interviewer must approve
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={step === 'submitting'}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{renderBody()}</div>

        {/* Footer */}
        {renderFooter() && (
          <div className="p-6 border-t border-slate-200 flex-shrink-0">
            {renderFooter()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RescheduleRequestModal;