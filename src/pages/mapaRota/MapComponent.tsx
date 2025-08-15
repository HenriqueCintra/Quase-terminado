import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';
import { FuelModal } from './FuelModal';
import { routesData } from './routesData';

interface LocationState {
  vehicle?: any;
  selectedRoute?: any;
  availableMoney?: number;
}

const MapComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    vehicle, 
    selectedRoute, 
    playerBalance, 
    setPlayerBalance,
    setVehicle,
    getGameSummary 
  } = useGame();

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get data from location.state as fallback
  const locationState = location.state as LocationState;
  
  // Use context data first, fallback to location.state
  const currentVehicle = vehicle || locationState?.vehicle;
  const currentRoute = selectedRoute || locationState?.selectedRoute;
  const currentBalance = playerBalance !== undefined ? playerBalance : locationState?.availableMoney;

  useEffect(() => {
    console.log('MapComponent - Estado atual:', getGameSummary());
    
    // Check if we have the required data
    if (!currentVehicle || !currentRoute) {
      console.log('MapComponent - Dados faltando, redirecionando...');
      
      if (!currentRoute) {
        navigate('/routes');
        return;
      }
      
      if (!currentVehicle) {
        navigate('/select-vehicle');
        return;
      }
    }

    // If we have location.state data but not in context, update context
    if (locationState?.vehicle && !vehicle) {
      setVehicle(locationState.vehicle);
    }
    
    if (locationState?.availableMoney !== undefined && playerBalance === undefined) {
      setPlayerBalance(locationState.availableMoney);
    }

    setIsLoading(false);
  }, [currentVehicle, currentRoute, navigate, vehicle, selectedRoute, playerBalance, locationState, setVehicle, setPlayerBalance, getGameSummary]);

  const handleFuelClick = () => {
    setShowFuelModal(true);
  };

  const handleCloseFuelModal = () => {
    setShowFuelModal(false);
  };

  const handleRefuel = () => {
    navigate('/fuel');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando mapa...</div>
      </div>
    );
  }

  if (!currentVehicle || !currentRoute) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecionando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/game-selection')}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Voltar ao Menu
          </button>
          <h1 className="text-xl font-bold">Mapa da Rota</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-green-400 font-bold">
            Saldo: R$ {currentBalance?.toFixed(2) || '0.00'}
          </div>
          <button
            onClick={handleFuelClick}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Abastecer
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Route Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-2">Rota Atual</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="text-gray-400">Origem:</span> {currentRoute.origem}</p>
              <p><span className="text-gray-400">Destino:</span> {currentRoute.destino}</p>
            </div>
            <div>
              <p><span className="text-gray-400">Distância:</span> {currentRoute.distancia} km</p>
              <p><span className="text-gray-400">Recompensa:</span> R$ {currentRoute.recompensa}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-bold mb-2">Veículo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="text-gray-400">Modelo:</span> {currentVehicle.name}</p>
              <p><span className="text-gray-400">Combustível:</span> {currentVehicle.fuel}L / {currentVehicle.fuelCapacity}L</p>
            </div>
            <div>
              <p><span className="text-gray-400">Consumo:</span> {currentVehicle.fuelConsumption} km/L</p>
              <p><span className="text-gray-400">Autonomia:</span> {(currentVehicle.fuel * currentVehicle.fuelConsumption).toFixed(0)} km</p>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg mb-4">Mapa da Rota</div>
          <div className="bg-gray-700 h-64 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">
              Mapa interativo será implementado aqui
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/game-truck')}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-lg font-bold transition-colors"
          >
            Iniciar Viagem
          </button>
        </div>
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <FuelModal
          vehicle={currentVehicle}
          onClose={handleCloseFuelModal}
          onRefuel={handleRefuel}
        />
      )}
    </div>
  );
};

export default MapComponent;