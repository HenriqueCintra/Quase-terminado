import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { VehicleSelectionPage } from "./pages/escolherVeiculo";
import { RoutesPage } from "./pages/RoutesPage/RoutesPage";
import { FuelPage } from "./pages/fuel/FuelPage";
import { RefuelScreen, MinigameScreen } from "./pages/RefuelScreen";
import { MapComponent } from "./pages/mapaRota/MapComponent";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/select-vehicle" element={<VehicleSelectionPage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/fuel" element={<FuelPage />} />
        <Route path="/refuel" element={<RefuelScreen />} />
        <Route path="/minigame" element={<MinigameScreen />} />
        <Route path="/map" element={<MapComponent />} />
        <Route path="/mapa-rota" element={<MapComponent />} />
        {/* Redirecionar para a página inicial por padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
