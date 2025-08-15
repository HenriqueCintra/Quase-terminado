import React, { createContext, useContext, useState, ReactNode } from "react";
import { Vehicle } from "../types/vehicle";
import { Map as Desafio } from "../types";

// Interface expandida para incluir todos os dados do jogo
interface GameState {
  playerBalance: number;
  vehicle: Vehicle | null;
  selectedRoute: Desafio | null;
  selectedRouteDetails: any | null; // Para dados específicos da rota escolhida
  gameInProgress: boolean;
  gameProgress?: {
    currentFuel: number;
    progress: number;
    currentPathIndex: number;
    pathProgress: number;
    gameTime: number;
    activeGameId?: number;
  };
}

interface GameContextType extends GameState {
  setPlayerBalance: (balance: number) => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  setSelectedRoute: (route: Desafio | null) => void;
  setSelectedRouteDetails: (routeDetails: any | null) => void;
  setGameInProgress: (inProgress: boolean) => void;
  setGameProgress: (progress: GameState['gameProgress']) => void;
  formatCurrency: (value: number) => string;
  resetGameState: () => void;
  updateVehicleFuel: (newFuel: number) => void;
  deductBalance: (amount: number) => void;
  // Novas funções para gerenciar o estado de forma mais robusta
  hasRequiredGameData: () => boolean;
  getGameSummary: () => string;
}

// Estado inicial do jogo
const initialGameState: GameState = {
  playerBalance: 20000.0,
  vehicle: null,
  selectedRoute: null,
  selectedRouteDetails: null,
  gameInProgress: false,
  gameProgress: undefined,
};

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame deve ser usado dentro de um GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const setPlayerBalance = (balance: number) => {
    console.log('💰 Atualizando saldo do jogador:', balance);
    setGameState(prev => ({ ...prev, playerBalance: balance }));
  };

  const setVehicle = (vehicle: Vehicle | null) => {
    console.log('🚛 Atualizando veículo selecionado:', vehicle?.name || 'null');
    setGameState(prev => ({ ...prev, vehicle }));
  };

  const setSelectedRoute = (route: Desafio | null) => {
    console.log('🗺️ Atualizando rota selecionada:', route?.nome || 'null');
    setGameState(prev => ({ ...prev, selectedRoute: route }));
  };

  const setSelectedRouteDetails = (routeDetails: any | null) => {
    console.log('📋 Atualizando detalhes da rota:', routeDetails?.name || 'null');
    setGameState(prev => ({ ...prev, selectedRouteDetails: routeDetails }));
  };

  const setGameInProgress = (inProgress: boolean) => {
    console.log('🎮 Atualizando status do jogo:', inProgress ? 'em progresso' : 'parado');
    setGameState(prev => ({ ...prev, gameInProgress: inProgress }));
  };

  const setGameProgress = (progress: GameState['gameProgress']) => {
    console.log('📊 Atualizando progresso do jogo:', progress);
    setGameState(prev => ({ ...prev, gameProgress: progress }));
  };

  const updateVehicleFuel = (newFuel: number) => {
    console.log('⛽ Atualizando combustível do veículo:', newFuel);
    setGameState(prev => ({
      ...prev,
      vehicle: prev.vehicle ? { ...prev.vehicle, currentFuel: newFuel } : null
    }));
  };

  const deductBalance = (amount: number) => {
    console.log('💸 Deduzindo do saldo:', amount);
    setGameState(prev => ({ ...prev, playerBalance: prev.playerBalance - amount }));
  };

  const resetGameState = () => {
    console.log('🔄 Resetando estado do jogo');
    setGameState(initialGameState);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Nova função para verificar se temos todos os dados necessários
  const hasRequiredGameData = () => {
    return !!(gameState.vehicle && gameState.selectedRoute);
  };

  // Nova função para debug - resumo do estado atual
  const getGameSummary = () => {
    return `Saldo: ${formatCurrency(gameState.playerBalance)} | Veículo: ${gameState.vehicle?.name || 'Nenhum'} | Rota: ${gameState.selectedRoute?.nome || 'Nenhuma'}`;
  };

  const value: GameContextType = {
    ...gameState,
    setPlayerBalance,
    setVehicle,
    setSelectedRoute,
    setSelectedRouteDetails,
    setGameInProgress,
    setGameProgress,
    updateVehicleFuel,
    deductBalance,
    resetGameState,
    formatCurrency,
    hasRequiredGameData,
    getGameSummary,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};