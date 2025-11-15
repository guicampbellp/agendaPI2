// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard({ setIsAuthenticated }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navigate = useNavigate();
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    carregarAgendamentosDoDia();
  }, [dataSelecionada]);

  const carregarAgendamentosDoDia = async () => {
    try {
      const response = await api.get(`/estatisticas/agendamentos-dia?data=${dataSelecionada}`);
      setAgendamentosHoje(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarPresenca = async (agendamentoId, compareceu) => {
    try {
      await api.put(`/estatisticas/agendas/${agendamentoId}/presenca`, { compareceu });
      carregarAgendamentosDoDia(); // Recarrega a lista
      alert('Presença atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar presença:', error);
      alert('Erro ao atualizar presença');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const formatarHora = (dataHora) => {
    return new Date(dataHora).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="dashboard">
      <header>
        <h1>🏥 Agenda Médica</h1>
        <p>
          Bem-vindo, <strong>{usuario?.nome}</strong> ({usuario?.email})
        </p>
        <nav>
          <Link to="/agendas">📅 Agendas</Link>
          <Link to="/clientes">👥 Clientes</Link>
          <Link to="/profissionais">👨‍⚕️ Profissionais</Link>
          <Link to="/estatisticas">📊 Estatísticas</Link>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </nav>
      </header>

      <main style={{ padding: '2rem' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '10px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Pacientes do Dia</h2>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          {loading ? (
            <div>Carregando...</div>
          ) : agendamentosHoje.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Nenhum agendamento para esta data
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {agendamentosHoje.map(agendamento => (
                <div
                  key={agendamento.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{agendamento.nome_cliente}</h4>
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>
                      <strong>Horário:</strong> {formatarHora(agendamento.data_consulta)}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>
                      <strong>Profissional:</strong> {agendamento.nome_profissional} - {agendamento.especialidade}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#666' }}>
                      <strong>Status:</strong> 
                      <span style={{ 
                        color: agendamento.paciente_compareceu === 'sim' ? '#28a745' : 
                               agendamento.paciente_compareceu === 'nao' ? '#dc3545' : '#ffc107',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        {agendamento.paciente_compareceu === 'sim' ? '✅ Compareceu' : 
                         agendamento.paciente_compareceu === 'nao' ? '❌ Faltou' : '⏳ Pendente'}
                      </span>
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => atualizarPresenca(agendamento.id, 'sim')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: agendamento.paciente_compareceu === 'sim' ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Sim
                    </button>
                    <button
                      onClick={() => atualizarPresenca(agendamento.id, 'nao')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: agendamento.paciente_compareceu === 'nao' ? '#dc3545' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Não
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
        }}>
          <div style={{ padding: '1rem', background: '#e8f4fd', borderRadius: '5px' }}>
            <h3>📅 Agendamentos</h3>
            <p>Gerencie os agendamentos de consultas</p>
          </div>

          <div style={{ padding: '1rem', background: '#f0f8f0', borderRadius: '5px' }}>
            <h3>👥 Clientes</h3>
            <p>Cadastre e gerencie pacientes</p>
          </div>

          <div style={{ padding: '1rem', background: '#fef7e0', borderRadius: '5px' }}>
            <h3>👨‍⚕️ Profissionais</h3>
            <p>Gerencie a equipe médica</p>
          </div>

          <div style={{ padding: '1rem', background: '#ffeef0', borderRadius: '5px' }}>
            <h3>📊 Estatísticas</h3>
            <p>Relatórios e gráficos</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;