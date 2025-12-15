function MachineCard({ machine, onStart, onStop }) {
  const getColor = () => {
    if (machine.status === "available") return "#16a34a";
    if (machine.status === "in_session") return "#dc2626";
    return "#6b7280";
  };

  return (
    <div
      style={{
        border: "2px solid " + getColor(),
        borderRadius: "8px",
        padding: "16px",
        width: "220px",
        margin: "10px",
      }}
    >
      <h3>{machine.name}</h3>
      <p>Status: <strong>{machine.status}</strong></p>

      {machine.status === "available" && (
        <button onClick={onStart}>Start Session</button>
      )}

      {machine.status === "in_session" && machine.active_session && (
        <button onClick={() => onStop(machine.active_session.id)}>
          Stop Session
        </button>
      )}
    </div>
  );
}

export default MachineCard;
