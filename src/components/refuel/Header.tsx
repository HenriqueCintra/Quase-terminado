import React from "react";
import { useGame } from "../../contexts/GameContext.tsx";

interface HeaderProps {
  finalBalance: number;
}

const Header: React.FC<HeaderProps> = ({ finalBalance }) => {
  const { playerBalance, formatCurrency } = useGame();
  return (
    <header className="main-header">
      <div className="header-title">TELA DE ABASTECIMENTO</div>
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
