import { useEffect, useState } from "react";
import api from "../services/api";
import MachineCard from "../components/MachineCard";

function Dashboard() {
  const [machines, setMachines] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedPricing, setSelectedPricing] = useState("");

  // 🔄 Load machines
  const loadMachines = async () => {
    const res = await api.get("/machines");
    setMachines(res.data);
  };

  // 🎮 Load games
  const loadGames = async () => {
    const res = await api.get("/games");
    setGames(res.data);
  };

  // 🔁 Load all
  const loadAll = async () => {
    await loadMachines();
  };

  useEffect(() => {
    loadAll();
    loadGames();
  }, []);

  // ▶ Start session
  const startSession = async () => {
    if (!selectedMachine || !selectedGame || !selectedPricing) {
      alert("Select game and duration");
      return;
    }

    await api.post("/sessions/start", {
      machine_id: selectedMachine.id,
      game_id: selectedGame,
      pricing_reference_id: selectedPricing,
      pricing_mode_id: 1,
      customer_id: null,
    });

    setSelectedMachine(null);
    setSelectedGame("");
    setSelectedPricing("");
    await loadAll();
  };

  // ⏹ Stop session
  const stopSession = async (sessionId) => {
  console.log("STOP SESSION ID FROM REACT:", sessionId);

  await api.post(`/sessions/stop/${sessionId}`);
  await loadMachines();
  };

  return (
    <div>
      <h2>PS5 Machines</h2>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onStart={() => setSelectedMachine(machine)}
            onStop={stopSession}
          />
        ))}
      </div>

      {/* START SESSION */}
      {selectedMachine && (
        <div style={{ marginTop: "30px", borderTop: "2px solid #333" }}>
          <h3>Start Session — {selectedMachine.name}</h3>

          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="">Select Game</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <br /><br />

          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
          >
            <option value="">Select Duration</option>
            <option value="1">6 min - 6 DH</option>
            <option value="2">30 min - 10 DH</option>
            <option value="3">1h - 20 DH</option>
          </select>

          <br /><br />

          <button onClick={startSession}>Confirm Start</button>
          <button onClick={() => setSelectedMachine(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
