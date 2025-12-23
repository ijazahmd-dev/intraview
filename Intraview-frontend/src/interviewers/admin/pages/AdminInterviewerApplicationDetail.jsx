import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { clearSelected, getApplicationDetail, reviewApplication } from "../adminInterviewerSlice";
import ReviewModal from "../components/ReviewModal";
import StatusBadge from "../components/StatusBadge";


export default function AdminInterviewerApplicationDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selected, detailLoading, reviewLoading } = useSelector((s) => s.adminInterviewer);
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    dispatch(getApplicationDetail(id));

    return () => {
    dispatch(clearSelected());
     };
  }, [dispatch, id]);


  const handleApprove = async () => {
      await dispatch(reviewApplication({ id, action: "approve" }));
      dispatch(getApplicationDetail(id)); 
    };


  const handleReject = async (reason) => {
        await dispatch(
          reviewApplication({
            id,
            action: "reject",
            rejection_reason: reason,
          })
        );

        setShowReject(false);
        dispatch(getApplicationDetail(id));
      };
        




  if (detailLoading || !selected) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-sm mb-4">
        ← Back
      </button>

      <h1 className="text-xl font-semibold mb-2">
        Interviewer Application
      </h1>

      <StatusBadge status={selected.status} />

      <section className="mt-6 space-y-2 text-sm">
        <p><b>Name:</b> {selected.first_name} {selected.last_name}</p>
        <p><b>Email:</b> {selected.user_email}</p>
        <p><b>Experience:</b> {selected.years_of_experience} years</p>
        <p><b>Specializations:</b> {selected.specializations.join(", ")}</p>
      </section>

      {selected.status === "PENDING" && (
        <div className="mt-6 flex gap-3">
                  <button
          disabled={reviewLoading}
          onClick={handleApprove}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {reviewLoading ? "Approving..." : "Approve"}
        </button>

          <button
            disabled={reviewLoading}
            onClick={() => setShowReject(true)}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Reject
          </button>
        </div>
      )}

      {showReject && (
        <ReviewModal
          onClose={() => setShowReject(false)}
          onSubmit={handleReject}
          loading={reviewLoading}
        />
      )}
    </div>
  );
}