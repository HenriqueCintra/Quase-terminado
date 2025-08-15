import React from "react";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

const VehiclePanel = () => {
  const { vehicle } = useGame();
  const navigate = useNavigate();

  // Se não há veículo, não renderizar
  if (!vehicle) {
    return (
      <section className="panel left-panel">
        <div className="text-center">
          <p>Carregando dados do veículo...</p>
        </div>
      </section>
    );
  }

  const fuelPercentage = (vehicle.currentFuel / vehicle.maxCapacity) * 100;

  const handleGoBack = () => {
    navigate("/select-vehicle");
  };

  const handleSkipRefuel = () => {
    navigate("/mapa-rota");
  };

  return (
    <section className="panel left-panel">
      <button className="btn btn-top-left" onClick={handleGoBack}>
        &lt; VOLTAR
      </button>
      <div className="panel-title">ABASTECER VEÍCULO?</div>
      <div className="vehicle-card">
        <div className="vehicle-info">
          <div className="vehicle-name">
            <p>{vehicle.name}</p>
          </div>
          <div className="vehicle-stats">
            <p>
              CONSUMO
              <br />
              <span>{vehicle.consumption.asphalt.toFixed(1)} KM/L</span>
            </p>
            <p>
              C. TANQUE
              <br />
              <span>
                {vehicle.currentFuel.toFixed(0)}L / {vehicle.maxCapacity}L
              </span>
            </p>
          </div>
          <div className="fuel-level">
            <p>NÍVEL DO TANQUE</p>
            <div className="fuel-level-bar">
              <div
                className="fuel-level-progress"
                style={{ width: `${fuelPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="vehicle-image-container">
          <img src="/caminhao.png" alt="Caminhão" className="truck-image" />
        </div>
      </div>
      <button className="btn btn-bottom-left" onClick={handleSkipRefuel}>
        PULAR ABASTECIMENTO
      </button>
    </section>
  );
};

export default VehiclePanel;