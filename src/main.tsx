import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { GameProvider } from "./contexts/GameContext.tsx"; // Importa o nosso novo contexto
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { HomePage } from "./pages/Home/HomePage.tsx";
import { VehicleSelectionPage } from "./pages/escolherVeiculo/index.ts";
import { Login } from "./pages/auth/Login/Login.tsx";
import { Cadastro } from "./pages/auth/Cadastro/Cadastro.tsx";
import { ForgotPassword } from "./pages/auth/ForgotPassword/ForgotPassword.tsx";
import { ChangePassword } from "./pages/Perfil/ChangePassword.tsx";
import { TutorialPage } from "./pages/Tutorial/TutorialPage.tsx";
import { PerfilPage } from "./pages/Perfil/PerfilPage.tsx";
import { EditarPerfilPage } from "./pages/Perfil/EditarPerfil.tsx";
import { ExcluirEquipePage } from "./pages/Perfil/ExcluirEquipe.tsx";
import { MapComponent } from "./pages/mapaRota/MapComponent.tsx";
import { EditarEquipePage } from "./pages/Perfil/EditarEquipe.tsx";
import { CriarEquipePage } from "./pages/Perfil/CriarEquipe.tsx";
import GameSelectionPage from "./pages/GameSelection/GameSelectionPage.tsx";
import { ApresentacaoDesafioPage } from "./pages/Desafio/ApresentacaoDesafio.tsx";
import { RankingPage } from "./pages/Ranking/RankingPage.tsx";
import { ChooseTeam } from "./pages/ChooseTeam/ChooseTeam.tsx";
import { RefuelScreen, MinigameScreen } from "./pages/RefuelScreen/index.ts"; // Importa as novas páginas
import { RoutesPage } from "./pages/RoutesPage/RoutesPage.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5, retry: 1 } },
});

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <GameProvider>
            {" "}
            {/* Envolvemos as rotas com o GameProvider */}
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:uidb64/:token"
                element={<ForgotPassword />}
              />
              <Route path="/tutorial" element={<TutorialPage />} />

              {/* ROTAS DO JOGO DE ABASTECIMENTO */}

              {/* Rota para a nova tela de abastecimento */}
              <Route
                path="/refuel"
                element={
                  <ProtectedRoute>
                    <RefuelScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/minigame"
                element={
                  <ProtectedRoute>
                    <MinigameScreen />
                  </ProtectedRoute>
                }
              />
              
              {/* Rota legacy para compatibilidade */}
              <Route
                path="/fuel"
                element={
                  <ProtectedRoute>
                    <RefuelScreen />
                  </ProtectedRoute>
                }
              />

              {/* Rotas protegidas existentes */}
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <PerfilPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/editar"
                element={
                  <ProtectedRoute>
                    <EditarPerfilPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/excluir-equipe"
                element={
                  <ProtectedRoute>
                    <ExcluirEquipePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/editar-equipe"
                element={
                  <ProtectedRoute>
                    <EditarEquipePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil/criar-equipe"
                element={
                  <ProtectedRoute>
                    <CriarEquipePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mudar-senha"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ranking"
                element={
                  <ProtectedRoute>
                    <RankingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/select-vehicle"
                element={
                  <ProtectedRoute>
                    <VehicleSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mapa-rota"
                element={
                  <ProtectedRoute>
                    <MapComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mapa"
                element={
                  <ProtectedRoute>
                    <MapComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/choose-team"
                element={
                  <ProtectedRoute>
                    <ChooseTeam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/desafio"
                element={
                  <ProtectedRoute>
                    <ApresentacaoDesafioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/game-selection"
                element={
                  <ProtectedRoute>
                    <GameSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/routes"
                element={
                  <ProtectedRoute>
                    <RoutesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
