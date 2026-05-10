// src/features/aiInterview/components/results/ScoreRing.jsx

/**
 * Circular score indicator.
 * score: 0–10
 */
export function ScoreRing({ score, size = 80, label }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = score !== null && score !== undefined ? score : 0;
  const fraction = normalizedScore / 10;
  const dashOffset = circumference * (1 - fraction);

  const scoreColor =
    normalizedScore >= 7.5
      ? "#34d399"   // emerald
      : normalizedScore >= 5
      ? "#fbbf24"   // amber
      : "#f87171";  // red

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={6}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        {/* Score label inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-gray-50 leading-none"
            style={{ fontSize: size * 0.22 }}
          >
            {score !== null && score !== undefined
              ? Number(score).toFixed(1)
              : "—"}
          </span>
          <span
            className="text-gray-400 leading-none mt-0.5"
            style={{ fontSize: size * 0.11 }}
          >
            / 10
          </span>
        </div>
      </div>
      {label && (
        <p className="text-10px text-gray-400 font-medium">{label}</p>
      )}
    </div>
  );
}