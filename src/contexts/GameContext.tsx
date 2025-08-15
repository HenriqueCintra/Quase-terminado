import React, { createContext, useContext, useState, ReactNode } from "react";
import { Vehicle } from "../types/vehicle"; // Reutilizando a tipagem de veículo do seu projeto

// Definindo um estado inicial para o veículo e o jogador
const initialVehicle: Vehicle = {
  id: "caminhao_inicial",
  name: "VAN",
  capacity: 20, // Assumindo capacidade de carga, não de tanque
  consumption: { asphalt: 9, dirt: 7 },
  image: "/caminhao.png", // Usando o caminho a partir da pasta public
  maxCapacity: 100, // Capacidade máxima do tanque em Litros
  currentFuel: 50, // Combustível atual em Litros
  cost: 10000,

  // CORREÇÃO APLICADA AQUI: Adicionamos a propriedade 'spriteSheet' que estava faltando.
  // Coloquei um valor padrão vazio. Se necessário, você pode alterar para o caminho correto.
  spriteSheet: "",
};

// O resto do arquivo permanece o mesmo...

const initialGameState = {
  playerBalance: 20000.0,
  vehicle: initialVehicle,
};

interface GameContextType {
  playerBalance: number;
  vehicle: Vehicle;
  setPlayerBalance: (balance: number) => void;
  setVehicle: (vehicle: Vehicle) => void;
  formatCurrency: (value: number) => string;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined
);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame deve ser usado dentro de um GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playerBalance, setPlayerBalance] = useState(
    initialGameState.playerBalance
  );
  const [vehicle, setVehicle] = useState<Vehicle>(initialGameState.vehicle);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const value = {
    playerBalance,
    vehicle,
    setPlayerBalance,
    setVehicle,
    formatCurrency,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
