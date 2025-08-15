import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useGame } from "../../contexts/GameContext";
import { GameService } from "../../api/gameService";
import { MapComponent } from "../mapaRota/MapComponent";
import { routes as staticRoutesData } from "../mapaRota/routesData";

interface ApiRoute {
  id: number;
  nome: string;
  descricao: string;
  distancia_km: number;
  tempo_estimado_horas: number;
  tipo_estrada: string;
  velocidade_media_kmh: number;
  danger_zones_data: any[];
  dirt_segments_data: any[];
  mapaId: number;
  routeId: number;
  name: string;
  distance: number;
  estimatedTime: string;
  estimatedTimeHours: number;
  dirtRoad: boolean;
  safety: { robberyRisk: "Baixo" | "Médio" | "Alto" };
  tollBooths: any[];
  speedLimits: any[];
  roadConditions: string;
  pathCoordinates?: [number, number][];
  actualDistance?: number;
  actualDuration?: number;
  dirtSegments?: any[];
  dangerZones?: any[];
}

export const RoutesPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    vehicle, 
    playerBalance: availableMoney, 
    selectedRoute,
    setSelectedRouteDetails,
    getGameSummary,
    hasRequiredGameData
  } = useGame();

  // Verificar se temos dados necessários
  React.useEffect(() => {
    console.log('🛣️ RoutesPage carregada - verificando dados...');
    console.log('📊 Estado do jogo:', getGameSummary());
    console.log('🔍 Dados necessários:', hasRequiredGameData());
    
    if (!selectedRoute) {
      console.error("Nenhuma rota selecionada. Redirecionando para tela de desafio.");
      navigate("/desafio");
      return;
    }
    
    if (!vehicle) {
      console.error("Nenhum veículo selecionado. Redirecionando para seleção de veículo.");
      navigate("/select-vehicle");
      return;
    }
    
    console.log('✅ RoutesPage carregada com sucesso');
  }, [selectedRoute, vehicle, navigate]);

  // Se não temos dados, mostrar carregamento
  if (!vehicle || !selectedRoute) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#200259] text-white font-['Silkscreen'] text-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Carregando dados do jogo...
        </div>
      </div>
    );
  }
  const [selectedRouteDetails, setSelectedRouteDetailsLocal] = useState<ApiRoute | null>(null);

  // ✅ CORREÇÃO: Configuração de cache balanceada (sem loop infinito)
  const {
    data: mapsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["maps"], // ✅ CORRIGIDO: QueryKey estável
    queryFn: GameService.getMaps,
    retry: 3,
    staleTime: 30 * 1000, // ✅ 30 segundos - dados frescos mas não excessivo
    cacheTime: 5 * 60 * 1000, // ✅ 5 minutos no cache
    refetchOnMount: "always", // ✅ Sempre refetch na montagem
    refetchOnWindowFocus: false, // Evita refetch desnecessário
  });

  // 🔧 MAPEAMENTO CORRIGIDO - USANDO NOME COMO CHAVE
  const allRoutes = useMemo(() => {
    if (!mapsData) return [];

    console.log(
      "🗺️ Processando dados dos mapas:",
      mapsData.length,
      "mapas encontrados"
    );
    console.log(
      "📍 Rotas estáticas disponíveis:",
      staticRoutesData.map((r) => r.name)
    );

    // Focar apenas no mapa principal de entregas
    const mapaPrincipal = mapsData[0];
    if (!mapaPrincipal) {
      console.warn("⚠️ Mapa principal 'ENTREGA EFICIENTE' não encontrado");
      console.log(
        "🔍 Mapas disponíveis:",
        mapsData.map((m) => `"${m.nome}" (ID: ${m.id})`)
      );
      return [];
    }

    console.log(
      `✅ Mapa principal encontrado: "${mapaPrincipal.nome}" (ID: ${mapaPrincipal.id})`
    );
    console.log(`📍 Rotas do mapa: ${mapaPrincipal.rotas.length}`);

    return mapaPrincipal.rotas.map((apiRoute) => {
      // 🎯 CORREÇÃO CRÍTICA: Correspondência pelo NOME
      const staticRoute = staticRoutesData.find((staticR) => {
        // Normalizar os nomes removendo espaços extras e comparando
        const staticName = staticR.name.trim().toLowerCase();
        const apiName = apiRoute.nome.trim().toLowerCase();

        // Log para debug
        console.log(`🔍 Comparando: "${staticName}" com "${apiName}"`);

        return (
          staticName === apiName ||
          staticName.includes(apiName) ||
          apiName.includes(staticName)
        );
      });

      if (!staticRoute) {
        console.warn(
          `⚠️ Rota estática NÃO encontrada para: "${apiRoute.nome}" (ID: ${apiRoute.id})`
        );
      } else {
        console.log(
          `✅ Rota mapeada com sucesso: "${apiRoute.nome}" -> ${
            staticRoute.pathCoordinates?.length || 0
          } coordenadas`
        );
      }

      const mappedRoute: ApiRoute = {
        ...apiRoute,
        mapaId: mapaPrincipal.id,
        routeId: apiRoute.id,
        name: apiRoute.nome,
        distance: apiRoute.distancia_km,
        estimatedTime: `${Math.floor(
          apiRoute.tempo_estimado_horas
        )}h${Math.round((apiRoute.tempo_estimado_horas % 1) * 60)}min`,
        estimatedTimeHours: apiRoute.tempo_estimado_horas,
        dirtRoad:
          apiRoute.tipo_estrada.includes("terra") ||
          apiRoute.dirt_segments_data.length > 0,
        safety: {
          robberyRisk:
            apiRoute.danger_zones_data.length > 2
              ? "Alto"
              : apiRoute.danger_zones_data.length > 0
              ? "Médio"
              : "Baixo",
        },
        // 🎯 DADOS CRÍTICOS DO MAPA - VINDOS DA ROTA ESTÁTICA
        pathCoordinates: staticRoute?.pathCoordinates || undefined,
        tollBooths: staticRoute?.tollBooths || [],
        speedLimits: staticRoute?.speedLimits || [],
        dangerZones: staticRoute?.dangerZones || [],
        dirtSegments: staticRoute?.dirtSegments || [],
        actualDistance: staticRoute?.actualDistance || apiRoute.distancia_km,
        actualDuration:
          staticRoute?.actualDuration || apiRoute.tempo_estimado_horas * 3600,
        roadConditions: apiRoute.tipo_estrada.includes("boa")
          ? "Boa"
          : "Regular",
      };

      return mappedRoute;
    });
  }, [mapsData]);

  const handleSelectRoute = (routeId: number) => {
    const routeToSelect = allRoutes.find((r) => r.id === routeId);
    if (routeToSelect) {
      console.log("🗺️ Rota selecionada:", routeToSelect.name);
      console.log(
        "📍 PathCoordinates disponíveis:",
        !!routeToSelect.pathCoordinates
      );
      console.log("📊 Dados completos da rota:", {
        id: routeToSelect.id,
        nome: routeToSelect.name,
        pathCoordinates: routeToSelect.pathCoordinates?.length || 0,
        dirtSegments: routeToSelect.dirtSegments?.length || 0,
        tollBooths: routeToSelect.tollBooths?.length || 0,
        dangerZones: routeToSelect.dangerZones?.length || 0,
      });
      setSelectedRouteDetailsLocal(routeToSelect);
      
      // Salvar também no contexto global
      setSelectedRouteDetails(routeToSelect);
    }
  };

  const handleContinue = () => {
    if (selectedRouteDetails) {
      // VALIDAÇÃO CRÍTICA: Verificar se temos pathCoordinates
      if (
        !selectedRouteDetails.pathCoordinates ||
        selectedRouteDetails.pathCoordinates.length === 0
      ) {
        console.error("❌ Rota sem coordenadas! Dados da rota:", selectedRouteDetails);
        alert(
          "Erro: Esta rota não possui dados de mapa. Por favor, escolha outra rota."
        );
        return;
      }

      // ✅ CORREÇÃO: Logs detalhados antes de navegar
      console.log("✅ Continuando com a rota:", selectedRouteDetails.name);
      console.log("📋 Dados completos enviados:", {
        vehicle: vehicle.name,
        money: availableMoney,
        route: {
          id: selectedRouteDetails.id,
          routeId: selectedRouteDetails.routeId,
          mapaId: selectedRouteDetails.mapaId,
          name: selectedRouteDetails.name,
          pathCoordinatesLength: selectedRouteDetails.pathCoordinates.length,
        },
      });

      console.log('⛽ Navegando para tela de abastecimento');
      // Navegar para abastecimento usando a rota correta
      navigate("/refuel");
    }
  };

  const goBack = () => {
    navigate("/select-vehicle");
  };

  // ✅ CORREÇÃO: Melhor tratamento de estados de loading/erro
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#200259] font-['Silkscreen'] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#E3922A] text-2xl mb-4">
            🚛 Carregando rotas...
          </div>
          <div className="text-white">
            Buscando dados atualizados do servidor
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-[#E3922A] text-black font-bold px-4 py-2 rounded-md hover:bg-[#FFC06F]"
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#200259] font-['Silkscreen'] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">
            ❌ Erro ao carregar rotas
          </div>
          <div className="text-white mb-4">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => refetch()}
              className="bg-[#E3922A] text-black font-bold px-6 py-3 rounded-md hover:bg-[#FFC06F]"
            >
              🔄 Recarregar Dados
            </button>
            <button
              onClick={() => navigate("/select-vehicle")}
              className="bg-gray-600 text-white font-bold px-6 py-3 rounded-md hover:bg-gray-700"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#200259] font-['Silkscreen']">
      {/* Header */}
      <div className="bg-[#200259] border-b-2 border-[#E3922A] px-3 py-2">
        <div className="flex items-center justify-between mx-auto">
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[#E3922A] text-black font-bold text-sm rounded-md shadow-lg
                     hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
            onClick={goBack}
          >
            <ArrowLeft size={16} /> VOLTAR
          </button>

          <h1 className="text-lg lg:text-xl font-bold text-[#E3922A] text-center">
            ESCOLHA SUA ROTA
          </h1>

          <div className="bg-[#E3922A] text-black text-sm lg:text-base font-bold px-3 py-1.5 rounded-md shadow-lg border-2 border-black">
            R$ {availableMoney.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col lg:flex-row gap-3 p-3 h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] overflow-hidden">
        {/* 🗺️ MAPA */}
        <div className="lg:w-2/3 h-full lg:h-full flex flex-col min-h-[300px] lg:min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden rounded-lg border-2 border-gray-300">
            {selectedRoute ? (
              <div className="w-full h-full max-h-full overflow-hidden">
                <div className="w-full h-full">
                  <MapComponent
                    preSelectedRoute={selectedRouteDetails}
                    preSelectedVehicle={vehicle}
                    preAvailableMoney={playerBalance}
                    showControls={false}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center text-gray-600 font-['Silkscreen'] p-4">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-lg font-bold mb-1 text-gray-700">
                    Selecione uma rota
                  </p>
                  <p className="text-sm text-gray-500">
                    para visualizar no mapa
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Rotas */}
        <div className="lg:w-2/5 flex flex-col h-full lg:h-full min-h-[400px] lg:min-h-0">
          <div className="bg-[#E3922A] text-black p-2 rounded-t-lg border-2 border-black mb-0 flex-shrink-0">
            <h2 className="text-lg font-['Silkscreen'] font-bold text-center">
              ROTAS DISPONÍVEIS ({allRoutes.length})
            </h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-100 border-x-2 border-black p-2 space-y-2">
            {allRoutes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-2xl mb-2">🚫</div>
                <p>Nenhuma rota encontrada</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 bg-[#E3922A] text-black font-bold px-4 py-2 rounded-md hover:bg-[#FFC06F] text-sm"
                >
                  🔄 Recarregar
                </button>
              </div>
            ) : (
              allRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border-2
                    ${
                      selectedRouteDetails?.id === route.id
                        ? "bg-yellow-300 border-yellow-600 shadow-lg"
                        : "bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }
                    `}
                  onClick={() => handleSelectRoute(route.id)}
                >
                  <h3 className="font-['Silkscreen'] font-bold text-sm text-black mb-2 border-b border-gray-300 pb-1">
                    {route.nome}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <p className="font-['Silkscreen'] text-black text-xs">
                        <span>⏱️ TEMPO:</span> {route.estimatedTime}
                      </p>
                      <p className="font-['Silkscreen'] text-black text-xs">
                        <span>📏 DISTÂNCIA:</span> {route.distance.toFixed(0)}{" "}
                        km
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="font-['Silkscreen'] text-black text-xs flex items-center">
                        <span>🛡️ RISCO:</span>
                        <span
                          className={`${
                            route.safety.robberyRisk === "Baixo"
                              ? "text-green-700"
                              : "text-red-700"
                          } ml-1`}
                        >
                          {route.safety.robberyRisk}{" "}
                          {route.safety.robberyRisk === "Baixo" ? "✅" : "⚠️"}
                        </span>
                      </p>
                      {route.dirtRoad && (
                        <p className="font-['Silkscreen'] text-black text-xs flex items-center">
                          <span>🛤️ TERRENO:</span>
                          <span className="text-yellow-700 ml-1">
                            Estrada de Terra
                          </span>
                        </p>
                      )}
                      {/* 🔍 INDICADOR DE MAPA */}
                      {route.pathCoordinates &&
                      route.pathCoordinates.length > 0 ? (
                        <p className="font-['Silkscreen'] text-green-600 text-xs">
                          🗺️ Mapa disponível ({route.pathCoordinates.length}{" "}
                          pontos)
                        </p>
                      ) : (
                        <p className="font-['Silkscreen'] text-red-600 text-xs">
                          ⚠️ Mapa indisponível
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedRouteDetails?.id === route.id && (
                    <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                      <h4 className="font-bold text-blue-800 mb-1 text-xs">
                        📋 DETALHES:
                      </h4>
                      <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                        <p>🗺️ Mapa: {route.mapaId}</p>
                        <p>🆔 Rota: {route.id}</p>
                        {route.danger_zones_data.length > 0 && (
                          <p>⚠️ Perigos: {route.danger_zones_data.length}</p>
                        )}
                        {route.dirt_segments_data.length > 0 && (
                          <p>🌄 Terra: {route.dirt_segments_data.length}</p>
                        )}
                        <p>🚦 Velocidade: {route.velocidade_media_kmh} km/h</p>
                        <p>🛣️ Tipo: {route.tipo_estrada}</p>
                        {route.pathCoordinates ? (
                          <p className="text-green-700">
                            📍 Coordenadas: {route.pathCoordinates.length}{" "}
                            pontos
                          </p>
                        ) : (
                          <p className="text-red-700">📍 Sem coordenadas!</p>
                        )}
                        {route.dirtSegments &&
                          route.dirtSegments.length > 0 && (
                            <p>🏜️ Trechos terra: {route.dirtSegments.length}</p>
                          )}
                      </div>
                      {route.descricao && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          {route.descricao}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-[#E3922A] border-2 border-black rounded-b-lg p-2 flex-shrink-0">
            {selectedRouteDetails ? (
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 text-sm rounded-md 
                         shadow-lg border-2 border-green-800 transition-all duration-200"
              >
                🚛 CONTINUAR COM ESTA ROTA
              </button>
            ) : (
              <div className="text-center text-black font-bold py-2 text-sm">
                👆 Selecione uma rota para continuar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
