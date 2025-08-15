import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
// CORREÇÃO: A linha de importação da imagem foi REMOVIDA.
import "../../styles/refuel.css";

const FILL_RATE = 0.2;
const TOLERANCE = 3.5;
const FUEL_COLORS: Record<string, string> = {
  gasolina: "linear-gradient(to top, #ff9900, #ffcc80)",
  alcool: "linear-gradient(to top, #4d94ff, #adcffa)",
  diesel: "linear-gradient(to top, #fc4a1a, #f7b733)",
};

interface RefuelInfo {
  fuelType: string;
  fraction: number;
  cost: number;
}

const MinigameScreen = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    vehicle,
    updateVehicleFuel,
    playerBalance,
    deductBalance,
    formatCurrency,
  } = useGame();

  const refuelInfo = state?.refuelInfo as RefuelInfo | undefined;
  const targetLevel = refuelInfo ? refuelInfo.fraction * 100 : 0;

  const [currentLevel, setCurrentLevel] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    detail: string;
    style: React.CSSProperties;
  } | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!refuelInfo) {
      alert("Erro: Dados de abastecimento não encontrados.");
      navigate("/fuel");
    }
    
    if (!vehicle) {
      console.error("Nenhum veículo encontrado no contexto. Redirecionando.");
      navigate("/select-vehicle");
    }
  }, [refuelInfo, vehicle, navigate]);

  useEffect(() => {
    if (isPouring) {
      const gameLoop = () => {
        setCurrentLevel((prev) => {
          if (prev >= 100) {
            setIsPouring(false);
            return 100;
          }
          return prev + FILL_RATE;
        });
        animationFrameId.current = requestAnimationFrame(gameLoop);
      };
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      checkResult(currentLevel);
    }
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [isPouring, currentLevel]); // Adicionado currentLevel para checkResult ser chamado corretamente

  const checkResult = (finalLevel: number) => {
    if (!refuelInfo) return;
    if (!vehicle) return;
    
    const deviation = Math.abs(finalLevel - targetLevel);

    if (finalLevel > targetLevel + TOLERANCE) {
      setResult({
        message: "DERRAMOU!",
        style: { backgroundColor: "var(--fail-bg)" },
        detail: "Você passou do limite! Nada foi cobrado.",
      });
    } else {
      const successRatio = finalLevel / targetLevel;
      const finalCost = refuelInfo.cost * successRatio;
      const litersAdded = vehicle.maxCapacity * (finalLevel / 100);
      let newCurrentFuel = Math.min(
        vehicle.currentFuel + litersAdded,
        vehicle.maxCapacity
      );
      let res;

      if (deviation > TOLERANCE) {
        res = {
          message: "QUASE LÁ!",
          style: { backgroundColor: "var(--fail-bg)" },
          detail: `Você abasteceu ${finalLevel.toFixed(
            1
          )}%. Custo: ${formatCurrency(finalCost)}`,
        };
        // Deduzir custo proporcional
        deductBalance(finalCost);
      } else {
        res = {
          message: "PERFEITO!",
          style: { backgroundColor: "var(--success-bg)" },
          detail: `Abastecimento preciso! Custo final: ${formatCurrency(
            refuelInfo.cost
          )}.`,
        };
        // Deduzir custo total
        deductBalance(refuelInfo.cost);
      }
      setResult(res);
      
      // Atualizar combustível do veículo
      updateVehicleFuel(newCurrentFuel);
    }
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!result) setIsPouring(true);
  };
  const handleInteractionEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPouring(false);
  };

  if (!refuelInfo) return null;

  return (
    <div className="minigame-body">
      <div
        id="game-container"
        onMouseDown={handleInteractionStart}
        onMouseUp={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchEnd={handleInteractionEnd}
      >
        <h1 className="game-title">Segure para encher!</h1>
        <p className="game-subtitle">Solte o mais perto possível da meta!</p>
        <div id="fuel-nozzle-container">
          {/* CORREÇÃO: Usando caminho absoluto a partir da pasta public */}
          <img
            id="fuel-nozzle"
            src="/nozzle.png"
            alt="Mangueira"
            className={isPouring ? "pouring" : ""}
          />
        </div>
        <div id="fuel-tank">
          <div
            className="tolerance-zone"
            style={{
              bottom: `${targetLevel - TOLERANCE}%`,
              height: `${TOLERANCE * 2}%`,
            }}
          ></div>
          <div id="target-line" style={{ bottom: `${targetLevel}%` }}>
            <span>META {targetLevel.toFixed(0)}%</span>
          </div>
          <div
            id="current-fuel"
            style={{
              height: `${currentLevel}%`,
              background: FUEL_COLORS[refuelInfo.fuelType],
            }}
          ></div>
        </div>
        {result && (
          <div id="result-screen">
            <h2 id="result-message" style={result.style}>
              {result.message}
            </h2>
            <p id="result-detail">{result.detail}</p>
            <button id="return-button" onClick={() => navigate("/mapa-rota")}>
              VOLTAR AO MAPA
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinigameScreen;
