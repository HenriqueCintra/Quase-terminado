import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import {
  ArrowLeft,
  Home,
  Trophy,
  Clock,
  Users,
  Truck,
  Car,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import { GameService } from "@/api/gameService";
import { Map as Desafio } from "@/types";
import { useGame } from "@/contexts/GameContext";

export const ApresentacaoDesafioPage = () => {
  const navigate = useNavigate();
  const { setSelectedRoute, setPlayerBalance } = useGame();

  // 1. BUSCA A LISTA DE TODOS OS DESAFIOS (MAPAS) DA API
  const {
    data: desafios,
    isLoading,
    isError,
  } = useQuery<Desafio[]>({
    queryKey: ["desafios"], // Uma chave de query para buscar a lista
    queryFn: GameService.getMaps, // Usa a função que busca todos
  });

  // 2. PEGA O PRIMEIRO DESAFIO DA LISTA (já que por enquanto só temos um)
  const desafio = desafios?.[0];

  const [carregando, setCarregando] = useState(false);

  const handleAceitarDesafio = () => {
    if (!desafio) return; // Proteção para caso o desafio não tenha carregado

    // Salvar o desafio no contexto do jogo
    setSelectedRoute(desafio);
    
    // Definir saldo inicial do jogo
    setPlayerBalance(20000);

    setCarregando(true);
    setTimeout(() => {
      setCarregando(false);
      // Navegar sem passar estado - dados estão no contexto
      navigate("/select-vehicle");
    }, 1500);
  };

  const getVehicleIcon = (tipo: string) => {
    switch (tipo) {
      case "CARRO":
        return <Car size={18} className="text-[#e3922a] mr-2 flex-shrink-0" />;
      default:
        return (
          <Truck size={18} className="text-[#e3922a] mr-2 flex-shrink-0" />
        );
    }
  };

  // 3. ESTADO DE CARREGAMENTO
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-sky-300 to-purple-400">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto h-12 w-12 text-white" />
          <p className="[font-family:'Silkscreen',Helvetica] text-white text-lg mt-4">
            CARREGANDO DESAFIOS...
          </p>
        </div>
      </div>
    );
  }

  // 4. ESTADO DE ERRO (ou se não encontrar nenhum desafio)
  if (isError || !desafio) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-red-400 to-red-600 text-center p-4">
        <div>
          <AlertTriangle className="mx-auto h-12 w-12 text-white mb-4" />
          <h1 className="[font-family:'Silkscreen',Helvetica] text-white text-xl mb-4">
            {isError
              ? "Erro ao carregar os desafios."
              : "Nenhum desafio encontrado."}
          </h1>
          <Button
            onClick={() => navigate("/game-selection")}
            className="bg-white text-black"
          >
            Voltar para Seleção de Jogos
          </Button>
        </div>
      </div>
    );
  }

  // 5. RENDERIZAÇÃO COM DADOS VINDOS DA API
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden z-10">
        <div className="flex gap-5 absolute top-4 left-4 z-10">
          <ButtonHomeBack onClick={() => navigate(-1)}>
            <ArrowLeft />
          </ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}>
            <Home />
          </ButtonHomeBack>
        </div>

        <div className="pt-16 pb-8 px-4 flex justify-center items-center min-h-screen z-10">
          <div className="bg-white rounded-[18px] border-2 border-solid border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b-2 border-black bg-gray-50">
              <h1 className="text-center text-[22px] [font-family:'Silkscreen',Helvetica] font-bold text-[#e3922a]">
                {desafio.nome}
              </h1>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <div className="border-2 border-black rounded-lg overflow-hidden h-[200px] mb-4">
                <img
                  src={desafio.imagem}
                  alt="Imagem do desafio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">
                  DESCRIÇÃO:
                </h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[12px]">
                  {desafio.descricao}
                </p>
              </div>
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">
                  DETALHES:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Trophy
                      size={16}
                      className="text-[#e3922a] mr-2 flex-shrink-0"
                    />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">
                      DIFICULDADE: {desafio.dificuldade}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock
                      size={16}
                      className="text-[#e3922a] mr-2 flex-shrink-0"
                    />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">
                      TEMPO: {desafio.tempo_limite}
                    </span>
                  </div>
                  <div className="flex items-center col-span-2">
                    <Users
                      size={16}
                      className="text-[#e3922a] mr-2 flex-shrink-0"
                    />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">
                      JOGADORES: {desafio.min_jogadores}-{desafio.max_jogadores}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2 text-green-600">
                  OBJETIVO:
                </h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[12px] font-bold text-green-600">
                  {desafio.objetivo}
                </p>
              </div>
              <div className="border-2 border-dashed border-[#e3922a] rounded-lg p-3 bg-yellow-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">
                  SUAS FERRAMENTAS:
                </h3>
                <div className="space-y-3">
                  {desafio.ferramentas.map((ferramenta: any, index: number) => (
                    <div key={index} className="flex items-start">
                      {getVehicleIcon(ferramenta.tipo)}
                      <div>
                        <span className="[font-family:'Silkscreen',Helvetica] text-[11px] font-bold block">
                          {ferramenta.tipo}
                        </span>
                        <span className="[font-family:'Silkscreen',Helvetica] text-[10px] text-gray-700">
                          {ferramenta.descricao}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t-2 flex justify-center border-black bg-gray-50">
              <Button
                onClick={handleAceitarDesafio}
                disabled={carregando}
                className="w-1/2 py-3 bg-[#29D8FF] border-2 border-black rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[16px] hover:bg-[#20B4D2] transform transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-black mr-2"></div>
                    CARREGANDO...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2" size={20} />
                    ACEITAR DESAFIO
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApresentacaoDesafioPage;
