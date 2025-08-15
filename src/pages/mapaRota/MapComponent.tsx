import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Route } from "./routesData";
import { useLocation, useNavigate } from "react-router-dom";
import { Vehicle } from "../../types/vehicle";
import { ArrowLeft, Fuel } from "lucide-react";
import { useGame } from "../../contexts/GameContext";
import { GameService } from "../../api/gameService";
import {
  calculatePositionFromProgress,
  calculatePathFromProgress,
} from "../../utils/mapUtils";
import defaultIcon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: defaultIcon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface StaticTruckMarkerProps {
  routePath: [number, number][];
  totalProgress: number;
  vehicle: Vehicle;
}

// --- Ícones (sem alterações) ---
const tollIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2297/2297592.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const dangerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1008/1008928.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const restStopIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/6807/6807796.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const constructionIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4725/4725077.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const gasStationIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/465/465090.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const lowRiskIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/6276/6276686.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const mediumRiskIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4751/4751259.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const highRiskIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/900/900532.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon20 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1670/1670172.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon40 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/5124/5124881.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon50 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/752/752738.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon60 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/15674/15674424.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon80 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3897/3897785.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon100 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/10392/10392769.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const getSpeedLimitIcon = (speed: number): L.Icon => {
  /* ... (código inalterado) ... */ return speedLimitIcon60;
};

// --- Outros componentes (sem alterações) ---
interface RenderSegment {
  /* ... */
}
interface TruckAnimationProps {
  /* ... */
}
const TruckAnimation: React.FC<TruckAnimationProps> = (props) => {
  /* ... (código inalterado) ... */ return null;
};
const StaticTruckMarker: React.FC<StaticTruckMarkerProps> = (props) => {
  /* ... (código inalterado) ... */ return null;
};

interface MapComponentProps {
  preSelectedRoute?: Route | null;
  preSelectedVehicle?: Vehicle | null;
  preAvailableMoney?: number;
  showControls?: boolean;
  externalProgress?: {
    currentPathIndex: number;
    pathProgress: number;
    totalProgress: number;
  };
}

export const MapComponent: React.FC<MapComponentProps> = ({
  preSelectedRoute = null,
  preSelectedVehicle = null,
  preAvailableMoney = null,
  showControls = true,
  externalProgress = null,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    vehicle: contextVehicle, 
    selectedRoute: contextSelectedRoute, 
    playerBalance: contextPlayerBalance,
    selectedRouteDetails: contextRouteDetails,
    setSelectedRouteDetails
  } = useGame();
  
  const juazeiroCoordinates: [number, number] = [
    -9.44977115369502, -40.52422616182216,
  ];
  const salvadorCoordinates: [number, number] = [
    -12.954121960174133, -38.47128319030249,
  ];

  // Priorizar dados do contexto sobre props ou location.state
  const selectedRoute = useMemo(() => {
    return preSelectedRoute ?? contextRouteDetails ?? contextSelectedRoute ?? location.state?.selectedRoute ?? null;
  }, [preSelectedRoute, contextRouteDetails, contextSelectedRoute, location.state?.selectedRoute]);

  const [isPlaying, setIsPlaying] = useState(false);
  
  // Usar veículo do contexto como prioridade
  const vehicle = useMemo(() => {
    return preSelectedVehicle ?? contextVehicle ?? location.state?.selectedVehicle ?? null;
  }, [preSelectedVehicle, contextVehicle, location.state?.selectedVehicle]);

  // Usar saldo do contexto como prioridade
  const availableMoney = useMemo(() => {
    return preAvailableMoney ?? contextPlayerBalance ?? location.state?.availableMoney ?? 5500;
  }, [preAvailableMoney, contextPlayerBalance, location.state?.availableMoney]);

  // Guardas de segurança - redirecionar se dados essenciais estiverem ausentes
  useEffect(() => {
    if (showControls) {
      if (!contextSelectedRoute) {
        console.error("Nenhuma rota selecionada. Redirecionando para tela de desafio.");
        navigate("/desafio");
        return;
      }
      
      if (!vehicle) {
        console.error("Nenhum veículo selecionado. Redirecionando para seleção de veículo.");
        navigate("/select-vehicle");
        return;
      }
    }
  }, [showControls, contextSelectedRoute, vehicle, navigate]);

  // Buscar detalhes da rota se ainda não temos
  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (contextSelectedRoute && !contextRouteDetails && showControls) {
        try {
          console.log("Buscando detalhes da rota:", contextSelectedRoute.id);
          const routeDetails = await GameService.getMapById(contextSelectedRoute.id);
          setSelectedRouteDetails(routeDetails);
        } catch (error) {
          console.error("Erro ao buscar detalhes da rota:", error);
        }
      }
    };

    fetchRouteDetails();
  }, [contextSelectedRoute, contextRouteDetails, setSelectedRouteDetails, showControls]);

  const [availableBalance] = useState(availableMoney);
      navigate("/select-vehicle");
    }
  }, [vehicle, showControls, navigate]);

  const [availableMoney] = useState<number>(() => {
    return preAvailableMoney ?? location.state?.availableMoney ?? 5500;
  });

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [initialMapViewSet, setInitialMapViewSet] = useState(false);
  const [renderedSegments, setRenderedSegments] = useState<RenderSegment[]>([]);

  // Se ainda estamos carregando dados essenciais, mostrar tela de carregamento
  if (showControls && !vehicle) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#200259] text-white font-['Silkscreen'] text-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Carregando dados do jogo...
        </div>
      </div>
    );
  }

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [initialMapViewSet, setInitialMapViewSet] = useState(false);
  const [renderedSegments, setRenderedSegments] = useState<any[]>([]);

  const handleGoToFuelStation = () => {
    navigate("/fuel");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 font-['Silkscreen'] bg-[#200259]">
      {/* Painel de controle lateral */}
      {showControls && (
        <div className="lg:w-1/4 bg-gradient-to-br from-[#E3922A] to-[#FFC06F] p-4 rounded-lg shadow-xl border-2 border-black mb-4 lg:mb-0 lg:mr-4">
          <div className="bg-black bg-opacity-20 rounded-lg p-3 h-full flex flex-col">
            
            {/* Informações do veículo */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-black text-center mb-2 bg-white bg-opacity-80 px-2 py-1 rounded border border-black">
                🚛 {vehicle.name.toUpperCase()}
              </h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-black">
                <div className="bg-white bg-opacity-60 p-2 rounded border border-black text-center">
                  <p className="font-bold">CAPACIDADE</p>
                  <p>{vehicle.capacity} Kg</p>
                </div>
                <div className="bg-white bg-opacity-60 p-2 rounded border border-black text-center">
                  <p className="font-bold">CONSUMO</p>
                  <p>{vehicle.consumption.asphalt} KM/L</p>
                </div>
              </div>
            </div>

            {/* Nível de combustível */}
            <div className="mb-4">
              <p className="text-black font-bold text-sm mb-2 text-center">⛽ NÍVEL DO TANQUE</p>
              <div className="w-full bg-gray-200 rounded-full h-6 border-2 border-black relative overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full transition-all duration-300 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    width: `${
                      (vehicle.currentFuel / vehicle.maxCapacity) * 100
                    }%`,
                  }}
                >
                  {vehicle.currentFuel > 0 && `${vehicle.currentFuel.toFixed(0)}L`}
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
                  {vehicle.currentFuel.toFixed(0)}/{vehicle.maxCapacity}L
                </div>
              </div>
            </div>

            {/* Saldo atual */}
            <div className="mb-4">
              <div className="bg-green-500 bg-opacity-80 p-3 rounded-lg border-2 border-green-700 text-center">
                <p className="text-green-900 font-bold text-sm">💰 SALDO ATUAL</p>
                <p className="text-green-900 font-bold text-lg">R$ {availableMoney.toFixed(2)}</p>
              </div>
            </div>

            {/* Botão para ir ao posto */}
            <div className="mt-auto">
              <button 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded-lg border-2 border-black shadow-lg transition-all duration-200 flex items-center justify-center"
                onClick={handleGoToFuelStation}
              >
              <Fuel className="mr-2" />
              IR PARA O POSTO
            </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Área do mapa */}
      <div className="flex-1 bg-gray-800 rounded-lg border-2 border-[#E3922A] overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold mb-2">MAPA EM DESENVOLVIMENTO</h2>
            <p className="text-lg">A visualização do mapa será implementada em breve</p>
            {selectedRoute && (
              <div className="mt-4 p-4 bg-blue-500 bg-opacity-20 rounded-lg">
                <p className="text-sm">Rota selecionada: {selectedRoute.nome}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
