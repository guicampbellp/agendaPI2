import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ConfigAgenda() {
    const [configuracoes, setConfiguracoes] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [tiposConsulta, setTiposConsulta] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalTipo, setShowModalTipo] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        profissional_id: '',
        dia_semana: 'segunda',
        hora_inicio: '08:00',
        hora_fim: '17:00',
        intervalo_minutos: 30,
        max_pacientes_dia: 10,
        tipo_consulta_id: '',
        ativo: true
    });
    const [tipoConsultaData, setTipoConsultaData] = useState({
        nome: '',
        descricao: '',
        duracao_minutos: 30
    });

    const navigate = useNavigate();

    const diasSemana = [
        { value: 'segunda', label: 'Segunda-feira' },
        { value: 'terca', label: 'Terça-feira' },
        { value: 'quarta', label: 'Quarta-feira' },
        { value: 'quinta', label: 'Quinta-feira' },
        { value: 'sexta', label: 'Sexta-feira' },
        { value: 'sabado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' }
    ];

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [configsRes, profsRes, tiposRes] = await Promise.all([
                api.get('/config-agenda'),
                api.get('/profissionais'),
                api.get('/config-agenda/tipos-consulta')
            ]);
            setConfiguracoes(configsRes.data);
            setProfissionais(profsRes.data);
            setTiposConsulta(tiposRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingConfig) {
                await api.put(`/config-agenda/${editingConfig.id}`, formData);
                alert('Configuração atualizada com sucesso!');
            } else {
                await api.post('/config-agenda', formData);
                alert('Configuração criada com sucesso!');
            }
            setShowModal(false);
            setEditingConfig(null);
            resetForm();
            carregarDados();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao salvar configuração');
        }
    };

    const handleSubmitTipoConsulta = async (e) => {
        e.preventDefault();
        try {
            await api.post('/config-agenda/tipos-consulta', tipoConsultaData);
            alert('Tipo de consulta criado com sucesso!');
            setShowModalTipo(false);
            setTipoConsultaData({ nome: '', descricao: '', duracao_minutos: 30 });
            carregarDados();
        } catch (error) {
            alert('Erro ao criar tipo de consulta');
        }
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        setFormData({
            profissional_id: config.profissional_id,
            dia_semana: config.dia_semana,
            hora_inicio: config.hora_inicio,
            hora_fim: config.hora_fim,
            intervalo_minutos: config.intervalo_minutos,
            max_pacientes_dia: config.max_pacientes_dia,
            tipo_consulta_id: config.tipo_consulta_id || '',
            ativo: config.ativo
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta configuração?')) {
            try {
                await api.delete(`/config-agenda/${id}`);
                carregarDados();
                alert('Configuração excluída com sucesso!');
            } catch (error) {
                alert('Erro ao excluir configuração');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            profissional_id: '',
            dia_semana: 'segunda',
            hora_inicio: '08:00',
            hora_fim: '17:00',
            intervalo_minutos: 30,
            max_pacientes_dia: 10,
            tipo_consulta_id: '',
            ativo: true
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const getDiaSemanaLabel = (value) => {
        const dia = diasSemana.find(d => d.value === value);
        return dia ? dia.label : value;
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="page-container">
            <header>
                <h1>⚙️ Configurar Agenda</h1>
                <nav>
                    <Link to="/Dashboard">🏠 Dashboard</Link>
                    <Link to="/Agendas">📅 Agendas</Link>
                    <Link to="/Clientes">👥 Clientes</Link>
                    <Link to="/Profissionais">👨‍⚕️ Profissionais</Link>
                    <button onClick={handleLogout} className="btn-logout">Sair</button>
                </nav>
            </header>

            <main>
                <div className="page-header">
                    <h2>Configurações de Agenda dos Profissionais</h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => setShowModalTipo(true)}
                            className="btn-primary"
                            style={{ backgroundColor: '#6f42c1' }}
                        >
                            + Tipo de Consulta
                        </button>
                        <button 
                            onClick={() => {
                                setEditingConfig(null);
                                resetForm();
                                setShowModal(true);
                            }} 
                            className="btn-primary"
                        >
                            + Nova Configuração
                        </button>
                    </div>
                </div>

                {/* Tabela de Configurações */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Profissional</th>
                                <th>Dia da Semana</th>
                                <th>Horário</th>
                                <th>Intervalo</th>
                                <th>Máx. Pacientes</th>
                                <th>Tipo Consulta</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configuracoes.map(config => (
                                <tr key={config.id}>
                                    <td>{config.profissional_nome}</td>
                                    <td>{getDiaSemanaLabel(config.dia_semana)}</td>
                                    <td>{config.hora_inicio} - {config.hora_fim}</td>
                                    <td>{config.intervalo_minutos} min</td>
                                    <td>{config.max_pacientes_dia}</td>
                                    <td>{config.tipo_consulta_nome || 'Padrão'}</td>
                                    <td>
                                        <span style={{
                                            color: config.ativo ? 'green' : 'red',
                                            fontWeight: 'bold'
                                        }}>
                                            {config.ativo ? '✅ Ativo' : '❌ Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleEdit(config)}
                                            className="btn-edit"
                                            style={{ marginRight: '5px' }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(config.id)}
                                            className="btn-danger"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {configuracoes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            Nenhuma configuração encontrada. Clique em "Nova Configuração" para começar.
                        </div>
                    )}
                </div>

                {/* Modal de Configuração */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: '600px' }}>
                            <h3>{editingConfig ? 'Editar' : 'Nova'} Configuração de Agenda</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Profissional:</label>
                                    <select
                                        value={formData.profissional_id}
                                        onChange={(e) => setFormData({...formData, profissional_id: e.target.value})}
                                        required
                                    >
                                        <option value="">Selecione o profissional...</option>
                                        {profissionais.map(prof => (
                                            <option key={prof.id} value={prof.id}>
                                                {prof.nome} - {prof.especialidade}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Dia da Semana:</label>
                                    <select
                                        value={formData.dia_semana}
                                        onChange={(e) => setFormData({...formData, dia_semana: e.target.value})}
                                        required
                                    >
                                        {diasSemana.map(dia => (
                                            <option key={dia.value} value={dia.value}>
                                                {dia.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Hora Início:</label>
                                        <input
                                            type="time"
                                            value={formData.hora_inicio}
                                            onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Hora Fim:</label>
                                        <input
                                            type="time"
                                            value={formData.hora_fim}
                                            onChange={(e) => setFormData({...formData, hora_fim: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Intervalo (minutos):</label>
                                        <input
                                            type="number"
                                            value={formData.intervalo_minutos}
                                            onChange={(e) => setFormData({...formData, intervalo_minutos: e.target.value})}
                                            min="15"
                                            max="120"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Máx. Pacientes/Dia:</label>
                                        <input
                                            type="number"
                                            value={formData.max_pacientes_dia}
                                            onChange={(e) => setFormData({...formData, max_pacientes_dia: e.target.value})}
                                            min="1"
                                            max="50"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Tipo de Consulta:</label>
                                    <select
                                        value={formData.tipo_consulta_id}
                                        onChange={(e) => setFormData({...formData, tipo_consulta_id: e.target.value})}
                                    >
                                        <option value="">Consulta Padrão</option>
                                        {tiposConsulta.map(tipo => (
                                            <option key={tipo.id} value={tipo.id}>
                                                {tipo.nome} ({tipo.duracao_minutos} min)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.ativo}
                                            onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                                        />
                                        Configuração Ativa
                                    </label>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => {
                                        setShowModal(false);
                                        setEditingConfig(null);
                                        resetForm();
                                    }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingConfig ? 'Atualizar' : 'Salvar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de Tipo de Consulta */}
                {showModalTipo && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: '500px' }}>
                            <h3>Novo Tipo de Consulta</h3>
                            <form onSubmit={handleSubmitTipoConsulta}>
                                <div className="form-group">
                                    <label>Nome do Tipo:</label>
                                    <input
                                        type="text"
                                        value={tipoConsultaData.nome}
                                        onChange={(e) => setTipoConsultaData({...tipoConsultaData, nome: e.target.value})}
                                        placeholder="Ex: Pediatria, Cardiologia..."
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Descrição:</label>
                                    <textarea
                                        value={tipoConsultaData.descricao}
                                        onChange={(e) => setTipoConsultaData({...tipoConsultaData, descricao: e.target.value})}
                                        placeholder="Descrição do tipo de consulta..."
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Duração (minutos):</label>
                                    <input
                                        type="number"
                                        value={tipoConsultaData.duracao_minutos}
                                        onChange={(e) => setTipoConsultaData({...tipoConsultaData, duracao_minutos: e.target.value})}
                                        min="15"
                                        max="120"
                                        required
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModalTipo(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Criar Tipo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ConfigAgenda;