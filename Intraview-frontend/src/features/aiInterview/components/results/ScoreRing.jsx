// src/features/aiInterview/components/results/ScoreRing.jsx

/**
 * Circular score indicator.
 * score: 0–10
 */
export function ScoreRing({ score, size = 80, label }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = score !== null && score !== undefined ? score : 0;
  const fraction = normalizedScore / 10;
  const dashOffset = circumference * (1 - fraction);

  // Colors aligned with Home.jsx palette
  const scoreColor =
    normalizedScore >= 7.5
      ? "#14b8a6"   // teal-500
      : normalizedScore >= 5
      ? "#eab308"   // yellow-500
      : "#f97316";  // orange-500

  const trackColor = "#e5e7eb"; // gray-200

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        {/* Score text inside */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-black text-gray-900 leading-none"
            style={{ fontSize: size * 0.24 }}
          >
            {score !== null && score !== undefined
              ? Number(score).toFixed(1)
              : "—"}
          </span>
          <span
            className="text-gray-400 leading-none mt-0.5"
            style={{ fontSize: size * 0.12 }}
          >
            / 10
          </span>
        </div>
      </div>
      {label && (
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      )}
    </div>
  );
}