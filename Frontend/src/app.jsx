// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agendas from "./pages/Agendas";
import Clientes from "./pages/Clientes";
import Profissionais from "./pages/Profissionais";
import Estatisticas from "./pages/Estatisticas";
import ConfigAgenda from "./pages/ConfigAgenda";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Começa como null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Verifica se existe token e se não está expirado
    if (token) {
      // Verificação básica do token (você pode adicionar validação JWT aqui)
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  // Aguarda a verificação da autenticação
  if (loading || isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        <div className="loading-spinner"></div>
        Verificando autenticação...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/estatisticas"
          element={
            isAuthenticated ? (
              <Estatisticas />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/agendas"
          element={
            isAuthenticated ? <Agendas /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/clientes"
          element={
            isAuthenticated ? <Clientes /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/profissionais"
          element={
            isAuthenticated ? (
              <Profissionais />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
    path="/config-agenda" 
    element={
        isAuthenticated ? 
        <ConfigAgenda /> : 
        <Navigate to="/login" replace />
    } 
/>
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
