// src/pages/Agendas.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ptBR } from 'date-fns/locale';

const locales = { 'pt-BR': ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Agendas() {
  const [agendas, setAgendas] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    data_consulta: '',
    profissional_id: '',
    cliente_id: '',
    observacao: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [agendasRes, profissionaisRes, clientesRes] = await Promise.all([
        api.get('/agendas'),
        api.get('/profissionais'),
        api.get('/clientes'),
      ]);
      setAgendas(agendasRes.data);
      setProfissionais(profissionaisRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o paciente já tem consulta marcada
  const verificarConsultaExistente = (clienteId, dataConsulta, agendamentoId = null) => {
    const consultaExistente = agendas.find(agenda => {
      // Ignora o próprio agendamento quando estiver editando
      if (agenda.id === agendamentoId) return false;
      
      // Verifica se é o mesmo cliente
      if (agenda.cliente_id !== clienteId) return false;
      
      // Verifica se a data é a mesma (ignorando horas/minutos para verificar mesmo dia)
      const dataExistente = new Date(agenda.data_consulta);
      const dataNova = new Date(dataConsulta);
      
      return (
        dataExistente.getFullYear() === dataNova.getFullYear() &&
        dataExistente.getMonth() === dataNova.getMonth() &&
        dataExistente.getDate() === dataNova.getDate()
      );
    });

    return consultaExistente;
  };

  // transformar agendamentos em eventos para o calendário
  const eventos = agendas
    .filter(a => !profissionalSelecionado || a.profissional_id == profissionalSelecionado)
    .map(a => ({
      id: a.id,
      title: `${a.cliente_nome}`,
      start: new Date(a.data_consulta),
      end: new Date(new Date(a.data_consulta).getTime() + 30 * 60000), // consulta = 30min
      resource: a
    }));

  const handleSelectEvent = (event) => {
    const agenda = event.resource;
    setFormData({
      id: agenda.id,
      data_consulta: agenda.data_consulta.slice(0, 16), // yyyy-MM-ddTHH:mm
      profissional_id: agenda.profissional_id,
      cliente_id: agenda.cliente_id,
      observacao: agenda.observacao || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se é um novo agendamento ou edição
    if (!formData.id) {
      // Para novos agendamentos, verificar se o paciente já tem consulta
      const consultaExistente = verificarConsultaExistente(formData.cliente_id, formData.data_consulta);
      
      if (consultaExistente) {
        const dataFormatada = new Date(consultaExistente.data_consulta).toLocaleDateString('pt-BR');
        const confirmar = window.confirm(
          `⚠️ ATENÇÃO: Este paciente já possui uma consulta agendada para ${dataFormatada}.\n\nDeseja continuar mesmo assim?`
        );
        
        if (!confirmar) {
          return; // Não prossegue se o usuário cancelar
        }
      }
    } else {
      // Para edições, verificar se a data ou cliente foram alterados
      const agendaOriginal = agendas.find(a => a.id === formData.id);
      if (agendaOriginal && 
          (agendaOriginal.cliente_id !== formData.cliente_id || 
           agendaOriginal.data_consulta !== formData.data_consulta)) {
        
        const consultaExistente = verificarConsultaExistente(formData.cliente_id, formData.data_consulta, formData.id);
        
        if (consultaExistente) {
          const dataFormatada = new Date(consultaExistente.data_consulta).toLocaleDateString('pt-BR');
          const confirmar = window.confirm(
            `⚠️ ATENÇÃO: Este paciente já possui uma consulta agendada para ${dataFormatada}.\n\nDeseja continuar mesmo assim?`
          );
          
          if (!confirmar) {
            return; // Não prossegue se o usuário cancelar
          }
        }
      }
    }

    try {
      if (formData.id) {
        // Editar
        await api.put(`/agendas/${formData.id}/status`, { status: 'agendado' });
        await api.put(`/agendas/${formData.id}`, formData);
        alert('Agendamento atualizado com sucesso!');
      } else {
        // Criar
        await api.post('/agendas', formData);
        alert('Agendamento criado com sucesso!');
      }
      setShowModal(false);
      setFormData({ id: null, data_consulta: '', profissional_id: '', cliente_id: '', observacao: '' });
      carregarDados();
    } catch (error) {
      alert('Erro ao salvar agendamento');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Deseja realmente excluir este agendamento?')) {
      try {
        await api.delete(`/agendas/${formData.id}`);
        alert('Agendamento excluído com sucesso!');
        setShowModal(false);
        carregarDados();
      } catch (error) {
        alert('Erro ao excluir agendamento');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="page-container">
      <header>
        <h1>📅 Agenda de Consultas</h1>
        <nav>
          <Link to="/dashboard">🏠 Dashboard</Link>
          <Link to="/clientes">👥 Clientes</Link>
          <Link to="/profissionais">👨‍⚕️ Profissionais</Link>
          <Link to="/estatisticas">📊 Estatísticas</Link>
          <button onClick={handleLogout} className="btn-logout">Sair</button>
        </nav>
      </header>

      <main>
        <div className="page-header">
          <h2>Agendamentos</h2>

          <select
            value={profissionalSelecionado}
            onChange={e => setProfissionalSelecionado(e.target.value)}
          >
            <option value="">Todos os profissionais</option>
            {profissionais.map(p => (
              <option key={p.id} value={p.id}>
                {p.nome} - {p.especialidade}
              </option>
            ))}
          </select>

          <button className="btn-primary" onClick={() => { 
            setShowModal(true); 
            setFormData({ 
              id: null, 
              data_consulta: '', 
              profissional_id: '', 
              cliente_id: '', 
              observacao: '' 
            }); 
          }}>
            + Novo Agendamento
          </button>
        </div>

        <div style={{ height: '80vh', background: 'white', padding: '1rem', borderRadius: '10px' }}>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            messages={{
              today: 'Hoje',
              previous: 'Anterior',
              next: 'Próximo',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{formData.id ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Data e Hora:</label>
                <input
                  type="datetime-local"
                  value={formData.data_consulta}
                  onChange={(e) => setFormData({ ...formData, data_consulta: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Profissional:</label>
                <select
                  value={formData.profissional_id}
                  onChange={(e) => setFormData({ ...formData, profissional_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um profissional...</option>
                  {profissionais.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome} - {prof.especialidade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cliente:</label>
                <select
                  value={formData.cliente_id}
                  onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Observações:</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  rows="3"
                  placeholder="Observações sobre a consulta..."
                />
              </div>

              <div className="modal-actions">
                {formData.id && (
                  <button type="button" onClick={handleDelete} className="btn-danger">
                    Excluir
                  </button>
                )}
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agendas;