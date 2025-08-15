import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import Header from "../../components/refuel/Header";
import VehiclePanel from "../../components/refuel/VehiclePanel";
import FuelPanel from "../../components/refuel/FuelPanel";
import Modal from "../../components/refuel/Modal";
import "../../styles/refuel.css";

const FUEL_PRICES = { diesel: 5.5, gasolina: 7.29, alcool: 5.49 };
const WRONG_FUEL_PENALTY = 500.0;

export function RefuelScreen() {
  const navigate = useNavigate();
  const {
    vehicle,
    playerBalance,
    selectedRoute,
    setPlayerBalance,
    updateVehicleFuel,
  } = useGame();

  const [selectedFuel, setSelectedFuel] = useState("diesel");
  const [selectedFraction, setSelectedFraction] = useState(0.5);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  // Guarda de segurança - verificar se temos todos os dados necessários
  useEffect(() => {
    if (!vehicle) {
      console.error("Nenhum veículo selecionado. Redirecionando para seleção de veículo.");
      navigate("/select-vehicle");
      return;
    }
    
    if (!selectedRoute) {
      console.error("Nenhuma rota selecionada. Redirecionando para tela de desafio.");
      navigate("/desafio");
      return;
    }
  }, [vehicle, selectedRoute, navigate]);

  // Se não temos dados, mostrar carregamento
  if (!vehicle || !selectedRoute) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-white font-['Silkscreen'] text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Carregando dados do jogo...
        </div>
      </div>
    );
  }

  const vehicleFuelType = vehicle?.fuelType || "diesel";

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
      // Navegar para o minigame passando as informações de abastecimento
      navigate("/minigame", {
        state: {
          refuelInfo: {
            fuelType: selectedFuel,
            fraction: selectedFraction,
            cost: totalCost,
          }
        }
      });
    }
  };

  const handleSkipFuel = () => {
    // Pular abastecimento e ir direto para o mapa
    navigate("/mapa-rota");
  };

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
          formatCurrency={(value: number) => value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        />
      </main>
      <button
        className="btn btn-refuel"
        style={{ marginTop: 24, background: "#888", color: "#fff" }}
        onClick={handleSkipFuel}
      >
        Pular Abastecimento
      </button>
    </div>
  );
}

export default RefuelScreen;