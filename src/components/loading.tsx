export default function Loading() {
  const spinnerStyle = {
    display: "inline-block",
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
    </div>
  );
}
