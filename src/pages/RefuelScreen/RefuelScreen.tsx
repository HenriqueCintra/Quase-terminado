import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame, GameProvider } from "../../contexts/GameContext.tsx";
import Header from "../../components/refuel/Header.tsx";
import VehiclePanel from "../../components/refuel/VehiclePanel.tsx";
import FuelPanel from "../../components/refuel/FuelPanel.tsx";
import Modal from "../../components/refuel/Modal.tsx";
import "../../styles/refuel.css";

const FUEL_PRICES = { diesel: 5.5, gasolina: 7.29, alcool: 5.49 };
const WRONG_FUEL_PENALTY = 500.0;

export function RefuelScreen() {
  const navigate = useNavigate();
  const {
    vehicle,
    playerBalance,
    setPlayerBalance,
    formatCurrency,
    selectVehicle,
  } = useGame();

  React.useEffect(() => {
    if (!vehicle) {
      navigate("/select-vehicle");
    }
  }, [vehicle, navigate]);

  const vehicleFuelType = vehicle?.fuelType || "diesel";

  const [selectedFuel, setSelectedFuel] = useState("diesel");
  const [selectedFraction, setSelectedFraction] = useState(0.5);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const totalCost = useMemo(() => {
    return FUEL_PRICES[selectedFuel] * (vehicle.maxCapacity * selectedFraction);
  }, [selectedFuel, selectedFraction, vehicle.maxCapacity]);

  const finalBalance = playerBalance - totalCost;
  const canAfford = finalBalance >= 0;

  const handleRefuel = () => {
    if (selectedFuel !== vehicleFuelType) {
      setPlayerBalance(playerBalance - WRONG_FUEL_PENALTY);
      setShowPenaltyModal(true);
    } else {
      navigate("/mapa");
    }
  };

  const veiculoEscolhido = vehicle; // Supondo que você queira selecionar o veículo atual

  return (
    <div className="refuel-container">
      <Modal
        show={showPenaltyModal}
        onClose={() => setShowPenaltyModal(false)}
        title="COMBUSTÍVEL ERRADO!"
        message={`Multa de ${formatCurrency(
          WRONG_FUEL_PENALTY
        )} aplicada por usar ${selectedFuel.toUpperCase()} em um veículo a ${vehicleFuelType?.toUpperCase()}.`}
      />
      <Header finalBalance={finalBalance} />
      <main className="main-container">
        <VehiclePanel />
        <FuelPanel
          fuelPrices={FUEL_PRICES}
          selectedFuel={selectedFuel}
          onFuelSelect={setSelectedFuel}
          selectedFraction={selectedFraction}
          onQuantitySelect={setSelectedFraction}
          totalCost={totalCost}
          onRefuel={handleRefuel}
          canRefuel={canAfford}
          formatCurrency={formatCurrency}
        />
      </main>
      <button
        className="btn btn-refuel"
        style={{ marginTop: 24, background: "#888", color: "#fff" }}
        onClick={() => navigate("/mapa")}
      >
        Pular Abastecimento
      </button>
    </div>
  );
}

export default RefuelScreen;
