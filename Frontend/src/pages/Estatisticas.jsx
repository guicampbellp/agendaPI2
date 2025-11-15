// src/pages/Estatisticas.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Estatisticas() {
  const [estatisticas, setEstatisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarEstatisticas();
  }, [dataInicio, dataFim]);

  const carregarEstatisticas = async () => {
    try {
      const response = await api.get(`/estatisticas/presencas?dataInicio=${dataInicio}&dataFim=${dataFim}`);
      setEstatisticas(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // Dados para o gráfico de barras (presenças por data)
  const dadosGraficoBarras = {
    labels: estatisticas.estatisticasPorData?.map(item => new Date(item.data).toLocaleDateString('pt-BR')) || [],
    datasets: [
      {
        label: 'Compareceram',
        data: estatisticas.estatisticasPorData?.map(item => item.compareceram) || [],
        backgroundColor: '#28a745',
      },
      {
        label: 'Faltaram',
        data: estatisticas.estatisticasPorData?.map(item => item.faltaram) || [],
        backgroundColor: '#dc3545',
      }
    ],
  };

  // Dados para o gráfico de pizza (distribuição geral)
  const dadosGraficoPizza = {
    labels: ['Compareceram', 'Faltaram'],
    datasets: [
      {
        data: [
          estatisticas.estatisticasGerais?.total_compareceram || 0,
          estatisticas.estatisticasGerais?.total_faltaram || 0
        ],
        backgroundColor: ['#28a745', '#dc3545'],
        hoverBackgroundColor: ['#218838', '#c82333'],
      },
    ],
  };

  const opcoesGraficoBarras = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Presenças e Faltas por Data',
      },
    },
  };

  const opcoesGraficoPizza = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribuição Geral de Presenças',
      },
    },
  };

  if (loading) return <div>Carregando estatísticas...</div>;

  return (
    <div className="page-container">
      <header>
        <h1>📊 Estatísticas de Presença</h1>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/agendas">📅 Agendas</Link>
          <Link to="/clientes">👥 Clientes</Link>
          <Link to="/profissionais">👨‍⚕️ Profissionais</Link>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </nav>
      </header>

      <main>
        <div className="page-header">
          <h2>Relatórios de Presença</h2>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label style={{ marginRight: '0.5rem' }}>De:</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            
            <div>
              <label style={{ marginRight: '0.5rem' }}>Até:</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>
            
            <button onClick={carregarEstatisticas} className="btn-primary">
              Atualizar
            </button>
          </div>
        </div>

        {/* Cartões com estatísticas gerais */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#007bff', margin: '0 0 0.5rem 0' }}>Total Agendados</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {estatisticas.estatisticasGerais?.total_agendados || 0}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#28a745', margin: '0 0 0.5rem 0' }}>Compareceram</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {estatisticas.estatisticasGerais?.total_compareceram || 0}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#dc3545', margin: '0 0 0.5rem 0' }}>Faltaram</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {estatisticas.estatisticasGerais?.total_faltaram || 0}
            </p>
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ffc107', margin: '0 0 0.5rem 0' }}>Taxa de Presença</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {estatisticas.estatisticasGerais?.taxa_presenca || 0}%
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Bar data={dadosGraficoBarras} options={opcoesGraficoBarras} />
          </div>

          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '10px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Pie data={dadosGraficoPizza} options={opcoesGraficoPizza} />
          </div>
        </div>

        {/* Tabela detalhada */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Detalhamento por Data</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Data</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total Agendados</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#28a745' }}>Compareceram</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#dc3545' }}>Faltaram</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#ffc107' }}>Pendentes</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Taxa de Presença</th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.estatisticasPorData?.map((item, index) => {
                const taxaPresenca = item.compareceram > 0 ? 
                  ((item.compareceram / (item.compareceram + item.faltaram)) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {item.total_agendados}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#28a745' }}>
                      {item.compareceram}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#dc3545' }}>
                      {item.faltaram}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#ffc107' }}>
                      {item.pendentes}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {taxaPresenca}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Estatisticas;