// src/features/interview/components/VideoPlayer.jsx

export default function VideoPlayer({
  videoRef,
  muted = false,
  isLocal = false,        // if true → mirror the video
  label,                  // optional label overlay (e.g., "You", "Interviewer")
  showControls = false,   // for debugging if needed
  className = "",
  style = {},
}) {
  const baseStyle = {
    width: "100%",
    height: "100%",
    maxHeight: "400px",
    borderRadius: "12px",
    backgroundColor: "black",
    objectFit: "cover",
    // Mirror local video for natural “self view”
    transform: isLocal ? "scaleX(-1)" : "none",
    ...style,
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
      className={className}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        controls={showControls}
        style={baseStyle}
      />

      {label && (
        <div
          style={{
            position: "absolute",
            left: "12px",
            bottom: "12px",
            padding: "4px 8px",
            borderRadius: "8px",
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "white",
            fontSize: "12px",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
