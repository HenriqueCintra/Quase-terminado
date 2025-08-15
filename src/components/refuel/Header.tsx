import React from "react";
import { useGame } from "../../contexts/GameContext";

interface HeaderProps {
  finalBalance: number;
}

const Header: React.FC<HeaderProps> = ({ finalBalance }) => {
  const { playerBalance, formatCurrency, selectedRoute } = useGame();
  
  return (
    <header className="main-header">
      <div className="header-title">
        TELA DE ABASTECIMENTO
        {selectedRoute && (
          <div className="text-sm mt-1">
            🗺️ {selectedRoute.nome}
          </div>
        )}
      </div>
      <div className="balance-info">
        <span>{formatCurrency(playerBalance)}</span>
        <span className="final-balance-display">
          SALDO FINAL: {formatCurrency(finalBalance)}
        </span>
      </div>
    </header>
  );
};

export default Header;
