import React from "react";
import { useGame } from "../../contexts/GameContext";
import { useNavigate } from "react-router-dom";

const VehiclePanel = () => {
  const { vehicle, selectedRoute, getGameSummary } = useGame();
  const navigate = useNavigate();

  // Se não há veículo, não renderizar
  if (!vehicle) {
    return (
      <section className="panel left-panel">
        <div className="text-center">
          <p>Carregando dados do veículo...</p>
          <button 
            className="btn btn-top-left" 
            onClick={() => navigate("/select-vehicle")}
          >
            ← VOLTAR
          </button>
        </div>
      </section>
    );
  }

  const fuelPercentage = (vehicle.currentFuel / vehicle.maxCapacity) * 100;

  const handleGoBack = () => {
    console.log('🔙 Voltando para seleção de veículo');
    navigate("/select-vehicle");
  };

  const handleSkipRefuel = () => {
    console.log('⏭️ Pulando abastecimento - indo para o mapa');
    console.log('📊 Estado atual:', getGameSummary());
    navigate("/mapa-rota");
  };

  return (
    <section className="panel left-panel">
      <button className="btn btn-top-left" onClick={handleGoBack}>
        ← VOLTAR
      </button>
      <div className="panel-title">ABASTECER VEÍCULO?</div>
      
      {/* Debug info - mostrar rota selecionada */}
      {selectedRoute && (
        <div className="bg-blue-500 bg-opacity-20 p-2 rounded-lg mb-2 border border-blue-600">
          <h4 className="font-['Silkscreen'] text-sm font-bold text-blue-100 mb-1">🗺️ ROTA SELECIONADA</h4>
          <p className="text-xs text-blue-200">{selectedRoute.nome}</p>
        </div>
      )}
      
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
          <img src={vehicle.image} alt={vehicle.name} className="truck-image" />
        </div>
      </div>
      <button className="btn btn-bottom-left" onClick={handleSkipRefuel}>
        PULAR ABASTECIMENTO
      </button>
    </section>
  );
};

export default VehiclePanel;