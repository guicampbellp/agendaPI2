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

      <main id="main-content" style={{ padding: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Pacientes do Dia</h2>
            <label htmlFor="data-pacientes" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '14px', color: '#666' }}>
              Data:
              <input
                id="data-pacientes"
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                aria-label="Selecionar data dos pacientes"
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </label>
          </div>

          {loading ? (
            <div role="status" aria-live="polite">Carregando...</div>
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
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }} role="group" aria-label={`Presença de ${agendamento.nome_cliente}`}>
                    <button
                      onClick={() => atualizarPresenca(agendamento.id, 'sim')}
                      aria-label={`Confirmar presença de ${agendamento.nome_cliente}`}
                      aria-pressed={agendamento.paciente_compareceu === 'sim'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: agendamento.paciente_compareceu === 'sim' ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Compareceu
                    </button>
                    <button
                      onClick={() => atualizarPresenca(agendamento.id, 'nao')}
                      aria-label={`Registrar falta de ${agendamento.nome_cliente}`}
                      aria-pressed={agendamento.paciente_compareceu === 'nao'}
                      style={{
                        padding: '0.5rem 1rem',
                        background: agendamento.paciente_compareceu === 'nao' ? '#dc3545' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Faltou
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Módulos do sistema" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { to: '/agendas', icon: '📅', label: 'Agendamentos', desc: 'Gerencie os agendamentos de consultas', bg: '#e8f4fd', border: '#90c5f0' },
            { to: '/clientes', icon: '👥', label: 'Clientes', desc: 'Cadastre e gerencie pacientes', bg: '#f0f8f0', border: '#90d490' },
            { to: '/profissionais', icon: '👨‍⚕️', label: 'Profissionais', desc: 'Gerencie a equipe médica', bg: '#fef7e0', border: '#f0d060' },
            { to: '/estatisticas', icon: '📊', label: 'Estatísticas', desc: 'Relatórios e gráficos', bg: '#ffeef0', border: '#f0a0b0' },
          ].map(({ to, icon, label, desc, bg, border }) => (
            <Link
              key={to}
              to={to}
              aria-label={label}
              style={{
                display: 'block',
                padding: '1.25rem',
                background: bg,
                borderRadius: '10px',
                border: `1px solid ${border}`,
                textDecoration: 'none',
                color: '#333',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{label}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{desc}</p>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}

export default Dashboard;