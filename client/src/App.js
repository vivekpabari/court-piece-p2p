import { Routes, Route } from "react-router-dom";

import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'

function App() {
  return (
    <Routes>
      <Route>
        <Route index element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Route>
    </Routes>
  );
}

export default App;
