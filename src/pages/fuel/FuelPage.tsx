import React, { useState } from 'react';
import { Vehicle } from '../../types/vehicle';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';

export const FuelPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    vehicle: contextVehicle, 
    selectedRoute: contextSelectedRoute, 
    playerBalance: contextPlayerBalance,
    setPlayerBalance,
    updateVehicleFuel
  } = useGame();

  // Verificar se temos todos os dados necessários
  React.useEffect(() => {
    if (!contextSelectedRoute) {
      console.error("Nenhuma rota selecionada. Redirecionando para tela de desafio.");
      navigate("/desafio");
      return;
    }
    
    if (!contextVehicle) {
      console.error("Nenhum veículo selecionado. Redirecionando para seleção de veículo.");
      navigate("/select-vehicle");
      return;
    }
  }, [contextSelectedRoute, contextVehicle, navigate]);

  // Se não temos dados, mostrar carregamento
  if (!contextVehicle || !contextSelectedRoute) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#200259] text-white font-['Silkscreen'] text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Carregando dados do jogo...
        </div>
      </div>
    );
  }

  // Garantir que o veículo sempre comece com tanque vazio na página de combustível
  const vehicle = {
    ...contextVehicle,
    currentFuel: 0 // Tanque sempre vazio para forçar decisão do usuário
  };

  const availableMoney = contextPlayerBalance;
  const selectedRoute = contextSelectedRoute;

  // Debug dos dados recebidos
  console.log("=== DEBUG FUEL PAGE ===");
  console.log("Vehicle received:", vehicle);
  console.log("Available money:", availableMoney);
  console.log("Selected route:", selectedRoute);
  console.log("======================");

  const [selectedVehicle] = useState<Vehicle>({ ...vehicle });
  const [fuelAmount, setFuelAmount] = useState<'full' | 'half' | 'quarter'>('full');
  const [availableBalance] = useState(availableMoney);
  const [previewFuel, setPreviewFuel] = useState<number>(vehicle.maxCapacity); // Preview inicia com a opção 'full' selecionada

  const fuelCostPerLiter = 5.5;

  const calculateFuelCost = (option: 'full' | 'half' | 'quarter') => {
    const maxCapacity = selectedVehicle.maxCapacity;
    let fuelToAdd = 0;

    // Como o tanque sempre começa vazio, calculamos a quantidade total desejada
    switch (option) {
      case 'full':
        fuelToAdd = maxCapacity;
        break;
      case 'half':
        fuelToAdd = maxCapacity / 2;
        break;
      case 'quarter':
        fuelToAdd = maxCapacity / 4;
        break;
    }

    return fuelToAdd * fuelCostPerLiter;
  };

  const handleRefuel = () => {
    const cost = calculateFuelCost(fuelAmount);

    if (cost <= availableBalance) {
      // Calcular o novo combustível baseado na opção selecionada
      const newCurrentFuel = fuelAmount === 'full'
        ? vehicle.maxCapacity
        : fuelAmount === 'half'
          ? vehicle.maxCapacity / 2
          : vehicle.maxCapacity / 4;

      // Atualizar dados no contexto
      updateVehicleFuel(newCurrentFuel);
      setPlayerBalance(availableMoney - cost);

      // Navegar para o mapa - dados estão no contexto
      navigate('/mapa-rota');
    } else {
      alert('Saldo insuficiente para abastecer!');
    }
  };

  const handleSkipFuel = () => {
    // Navegar para o mapa sem abastecer - dados estão no contexto
    navigate('/mapa-rota');
  };

  const calculatePreviewFuel = (option: 'full' | 'half' | 'quarter'): number => {
    const max = selectedVehicle.maxCapacity;

    switch (option) {
      case 'full':
        return max;
      case 'half':
        return max / 2;
      case 'quarter':
        return max / 4;
      default:
        return 0; // Tanque vazio por padrão
    }
  };

  const goBack = () => {
    navigate('/select-vehicle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#200259] to-[#300369] font-['Silkscreen']">
      {/* Header compacto */}
      <div className="bg-[#200259] border-b-4 border-[#E3922A] px-3 py-2 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[#E3922A] text-black font-bold text-sm rounded-md shadow-lg
                     hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
            onClick={goBack}
          >
            <ArrowLeft size={16} /> VOLTAR
          </button>

          <h1 className="text-lg lg:text-xl font-bold text-[#E3922A] text-center flex items-center gap-2">
            ⛽ ABASTECIMENTO
          </h1>

          <div className="bg-gradient-to-r from-[#E3922A] to-[#FFC06F] text-black text-sm lg:text-base font-bold px-3 py-1.5 rounded-md shadow-lg border-2 border-black">
            R$ {availableBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] overflow-hidden p-2">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl border-2 border-[#E3922A] w-full h-full p-3 backdrop-blur-sm flex flex-col">

          {/* Debug Info - mostrar rota selecionada */}
          <div className="bg-blue-500 bg-opacity-20 p-2 rounded-lg mb-2 border border-blue-600">
            <h4 className="font-['Silkscreen'] text-sm font-bold text-blue-100 mb-1">🗺️ ROTA SELECIONADA</h4>
            <p className="text-xs text-blue-200">{selectedRoute?.name || 'Rota não identificada'}</p>
            <p className="text-xs text-blue-200">ID: {selectedRoute?.routeId || 'N/A'} | Distância: {selectedRoute?.distance || 'N/A'}km</p>
          </div>

          {/* Header compacto da seção */}
          <div className="bg-gradient-to-r from-[#E3922A] to-[#FFC06F] text-black p-2 rounded-lg mb-2 border border-black flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-['Silkscreen'] font-bold flex items-center gap-1">
                🚛 ABASTECER VEÍCULO?
              </h2>
              <p className="font-['Silkscreen'] text-xs font-bold flex items-center gap-1">
                💰 Saldo final: <span className="text-green-800">R$ {(availableBalance - calculateFuelCost(fuelAmount)).toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Layout otimizado sem scroll */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Seção principal em uma linha */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

              {/* Card do veículo elegante */}
              <div className="lg:w-3/5 bg-gradient-to-br from-[#FFC06F] via-[#FFD700] to-[#FFA500] p-4 rounded-xl shadow-xl border-2 border-[#E3922A]">
                <div className="bg-black bg-opacity-10 rounded-lg p-3 h-full flex flex-col">

                  {/* Header do veículo */}
                  <div className="flex items-center justify-center mb-3">
                    <h3 className="text-lg font-['Silkscreen'] font-bold text-black bg-white bg-opacity-80 px-4 py-2 rounded-full border-2 border-black shadow-md">
                      🚛 {selectedVehicle.name.toUpperCase()}
                    </h3>
                  </div>

                  {/* Layout horizontal com imagem e informações */}
                  <div className="flex gap-4 flex-1">
                    {/* Imagem do veículo */}
                    <div className="w-2/5 flex items-center justify-center bg-white bg-opacity-30 rounded-lg p-3 shadow-inner">
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        className="max-h-20 lg:max-h-24 object-contain filter drop-shadow-lg"
                      />
                    </div>

                    {/* Informações técnicas */}
                    <div className="w-3/5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Consumo */}
                        <div className="bg-green-500 bg-opacity-20 p-2 rounded-lg border border-green-600">
                          <h4 className="font-['Silkscreen'] text-sm font-bold text-green-900 mb-1 text-center">⛽ CONSUMO</h4>
                          <p className="text-xs text-green-800 text-center">🛣️ {selectedVehicle.consumption.asphalt} KM/L</p>
                          <p className="text-xs text-green-800 text-center">🌄 {selectedVehicle.consumption.dirt} KM/L</p>
                        </div>

                        {/* Capacidade */}
                        <div className="bg-blue-500 bg-opacity-20 p-2 rounded-lg border border-blue-600">
                          <h4 className="font-['Silkscreen'] text-sm font-bold text-blue-900 mb-1 text-center">🗜️ TANQUE</h4>
                          <p className="text-xs text-blue-800 text-center">📊 0L</p>
                          <p className="text-xs text-blue-800 text-center">🏁 {selectedVehicle.maxCapacity}L</p>
                        </div>
                      </div>

                      {/* Barra de combustível melhorada */}
                      <div className="bg-white bg-opacity-40 p-2 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-['Silkscreen'] text-black text-sm font-bold">⛽ NÍVEL DO TANQUE</p>
                          <p className="text-sm font-bold text-black">0L → {previewFuel.toFixed(0)}L / {selectedVehicle.maxCapacity}L</p>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-5 border-2 border-black relative overflow-hidden shadow-inner">
                          {/* Barra vazia (fundo branco quando não há combustível) */}
                          <div className="w-full h-full bg-white rounded-full"></div>

                          {/* Barra de preview - quantidade que será abastecida (verde) */}
                          <div
                            className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full absolute top-0 left-0 transition-all duration-700 ease-out"
                            style={{ width: `${(previewFuel / selectedVehicle.maxCapacity) * 100}%` }}
                          ></div>

                          {/* Marcadores de divisão */}
                          <div className="absolute inset-0 flex justify-between items-center px-2">
                            <div className="w-0.5 h-3 bg-gray-600 opacity-50"></div>
                            <div className="w-0.5 h-3 bg-gray-600 opacity-50"></div>
                            <div className="w-0.5 h-3 bg-gray-600 opacity-50"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Painel de abastecimento */}
              <div className="lg:w-2/5 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-4 rounded-xl shadow-xl border-2 border-orange-600">
                <div className="bg-white bg-opacity-10 rounded-lg p-3 h-full flex flex-col">

                  {/* Header */}
                  <div className="text-center mb-3">
                    <h4 className="font-['Silkscreen'] text-lg font-bold text-white bg-black bg-opacity-30 px-3 py-2 rounded-lg border border-white">
                      ⛽ POSTO DE COMBUSTÍVEL
                    </h4>
                  </div>

                  {/* Preço em destaque */}
                  <div className="bg-red-600 text-white p-3 rounded-lg mb-3 text-center border-2 border-red-800 shadow-md">
                    <p className="font-['Silkscreen'] text-sm font-bold">
                      💵 DIESEL: R$ {fuelCostPerLiter.toFixed(2)}/LITRO
                    </p>
                  </div>

                  {/* Opções de abastecimento */}
                  <div className="space-y-2 mb-3">
                    <p className="font-['Silkscreen'] text-white text-sm font-bold text-center">ESCOLHA A QUANTIDADE:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          const newPreview = calculatePreviewFuel('quarter');
                          setFuelAmount('quarter');
                          setPreviewFuel(newPreview);
                        }}
                        className={`py-2 px-2 border-2 rounded-lg font-bold text-sm transition-all duration-200 ${fuelAmount === 'quarter'
                          ? 'bg-[#E3922A] text-black border-black shadow-lg transform scale-105'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        1/4 TANQUE
                      </button>
                      <button
                        onClick={() => {
                          const newPreview = calculatePreviewFuel('half');
                          setFuelAmount('half');
                          setPreviewFuel(newPreview);
                        }}
                        className={`py-2 px-2 border-2 rounded-lg font-bold text-sm transition-all duration-200 ${fuelAmount === 'half'
                          ? 'bg-[#E3922A] text-black border-black shadow-lg transform scale-105'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        1/2 TANQUE
                      </button>
                      <button
                        onClick={() => {
                          const newPreview = calculatePreviewFuel('full');
                          setFuelAmount('full');
                          setPreviewFuel(newPreview);
                        }}
                        className={`py-2 px-2 border-2 rounded-lg font-bold text-sm transition-all duration-200 ${fuelAmount === 'full'
                          ? 'bg-[#E3922A] text-black border-black shadow-lg transform scale-105'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        TANQUE CHEIO
                      </button>
                    </div>
                  </div>

                  {/* Custo total em destaque */}
                  <div className="bg-green-600 text-white p-3 rounded-lg text-center border-2 border-green-800 shadow-md mt-auto">
                    <p className="font-['Silkscreen'] text-lg font-bold">
                      💰 TOTAL: R$ {calculateFuelCost(fuelAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de ação elegantes */}
            <div className="flex justify-center gap-4 mt-4 flex-shrink-0">
              <button
                onClick={handleSkipFuel}
                className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white font-bold py-3 px-8 rounded-xl shadow-xl border-2 border-gray-600 
                         hover:from-gray-600 hover:via-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                ⏭️ PULAR ABASTECIMENTO
              </button>
              <button
                onClick={handleRefuel}
                disabled={calculateFuelCost(fuelAmount) > availableBalance}
                className={`font-bold py-3 px-8 rounded-xl shadow-xl border-2 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 ${calculateFuelCost(fuelAmount) > availableBalance
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed border-gray-500'
                  : 'bg-gradient-to-r from-[#E3922A] via-[#FFC06F] to-[#FFD700] text-black border-[#E3922A] hover:from-[#FFC06F] hover:via-[#FFD700] hover:to-[#FFED4E]'
                  }`}
              >
                ⛽ ABASTECER AGORA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};