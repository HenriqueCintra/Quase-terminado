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
    setGameState(prev => ({ ...prev, playerBalance: balance }));
  };

  const setVehicle = (vehicle: Vehicle | null) => {
    setGameState(prev => ({ ...prev, vehicle }));
  };

  const setSelectedRoute = (route: Desafio | null) => {
    setGameState(prev => ({ ...prev, selectedRoute: route }));
  };

  const setSelectedRouteDetails = (routeDetails: any | null) => {
    setGameState(prev => ({ ...prev, selectedRouteDetails: routeDetails }));
  };

  const setGameInProgress = (inProgress: boolean) => {
    setGameState(prev => ({ ...prev, gameInProgress: inProgress }));
  };

  const setGameProgress = (progress: GameState['gameProgress']) => {
    setGameState(prev => ({ ...prev, gameProgress: progress }));
  };

  const updateVehicleFuel = (newFuel: number) => {
    setGameState(prev => ({
      ...prev,
      vehicle: prev.vehicle ? { ...prev.vehicle, currentFuel: newFuel } : null
    }));
  };

  const deductBalance = (amount: number) => {
    setGameState(prev => ({ ...prev, playerBalance: prev.playerBalance - amount }));
  };

  const resetGameState = () => {
    setGameState(initialGameState);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};