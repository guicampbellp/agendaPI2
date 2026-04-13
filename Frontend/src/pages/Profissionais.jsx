// src/pages/Profissionais.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

function Profissionais() {
    const [profissionais, setProfissionais] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProfissional, setEditingProfissional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploadando, setUploadando] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        especialidade: '',
        foto_url: ''
    });
    const navigate = useNavigate();

    const abrirWidgetCloudinary = () => {
        if (!window.cloudinary) {
            alert('Widget do Cloudinary não carregado. Verifique a conexão.');
            return;
        }
        setUploadando(true);
        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: CLOUDINARY_CLOUD_NAME,
                uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                sources: ['local', 'camera'],
                multiple: false,
                cropping: true,
                croppingAspectRatio: 1,
                folder: 'profissionais',
                language: 'pt',
                text: { pt: { or: 'ou', menu: { files: 'Meus Arquivos', camera: 'Câmera' } } },
            },
            (error, result) => {
                if (error) {
                    console.error('Erro no upload:', error);
                    setUploadando(false);
                }
                if (result.event === 'success') {
                    setFormData(prev => ({ ...prev, foto_url: result.info.secure_url }));
                    setUploadando(false);
                }
                if (result.event === 'close') {
                    setUploadando(false);
                }
            }
        );
        widget.open();
    };

    useEffect(() => {
        carregarProfissionais();
    }, []);

    const carregarProfissionais = async () => {
        try {
            const response = await api.get('/profissionais');
            setProfissionais(response.data);
        } catch (error) {
            console.error('Erro ao carregar profissionais:', error);
            alert('Erro ao carregar profissionais');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProfissional) {
                // Editar profissional existente
                await api.put(`/profissionais/${editingProfissional.id}`, formData);
                alert('Profissional atualizado com sucesso!');
            } else {
                // Criar novo profissional
                await api.post('/profissionais', formData);
                alert('Profissional criado com sucesso!');
            }
            setShowModal(false);
            setEditingProfissional(null);
            setFormData({ nome: '', especialidade: '', foto_url: '' });
            carregarProfissionais(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao salvar profissional:', error);
            alert(error.response?.data?.error || 'Erro ao salvar profissional');
        }
    };

    const handleEdit = (profissional) => {
        setEditingProfissional(profissional);
        setFormData({
            nome: profissional.nome,
            especialidade: profissional.especialidade,
            foto_url: profissional.foto_url || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
            try {
                await api.delete(`/profissionais/${id}`);
                carregarProfissionais();
                alert('Profissional excluído com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir profissional:', error);
                alert('Erro ao excluir profissional');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    const resetForm = () => {
        setFormData({ nome: '', especialidade: '', foto_url: '' });
        setEditingProfissional(null);
        setShowModal(false);
    };

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="page-container">
            <header>
                <h1>👨‍⚕️ Profissionais</h1>
                <nav>
                    <Link to="/dashboard">🏠 Dashboard</Link>
                    <Link to="/agendas">📅 Agendas</Link>
                    <Link to="/clientes">👥 Clientes</Link>
                    <Link to="/estatisticas">📊 Estatísticas</Link>
                    <button onClick={handleLogout} className="btn-logout">Sair</button>
                </nav>
            </header>

            <main>
                <div className="page-header">
                    <h2>Gerenciar Profissionais</h2>
                    <button 
                        onClick={() => {
                            setEditingProfissional(null);
                            setFormData({ nome: '', especialidade: '', foto_url: '' });
                            setShowModal(true);
                        }} 
                        className="btn-primary"
                    >
                        + Novo Profissional
                    </button>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Nome</th>
                                <th>Especialidade</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profissionais.map(profissional => (
                                <tr key={profissional.id}>
                                    <td>
                                        {profissional.foto_url ? (
                                            <img 
                                                src={profissional.foto_url} 
                                                alt={profissional.nome}
                                                style={{ 
                                                    width: '50px', 
                                                    height: '50px', 
                                                    borderRadius: '50%', 
                                                    objectFit: 'cover' 
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                background: '#ddd',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#666',
                                                fontSize: '12px'
                                            }}>
                                                Sem foto
                                            </div>
                                        )}
                                    </td>
                                    <td>{profissional.nome}</td>
                                    <td>{profissional.especialidade}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleEdit(profissional)}
                                            className="btn-edit"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(profissional.id)}
                                            className="btn-danger"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {profissionais.length === 0 && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '2rem', 
                            color: '#666' 
                        }}>
                            Nenhum profissional cadastrado
                        </div>
                    )}
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>{editingProfissional ? 'Editar' : 'Novo'} Profissional</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Nome:</label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                                        required
                                        placeholder="Digite o nome do profissional"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Especialidade:</label>
                                    <input
                                        type="text"
                                        value={formData.especialidade}
                                        onChange={(e) => setFormData({...formData, especialidade: e.target.value})}
                                        required
                                        placeholder="Digite a especialidade"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Foto do Profissional (opcional):</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                        {formData.foto_url ? (
                                            <img
                                                src={formData.foto_url}
                                                alt="Foto do profissional"
                                                style={{
                                                    width: '70px',
                                                    height: '70px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '2px solid #667eea'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '50%',
                                                background: '#e9ecef',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '24px'
                                            }}>
                                                👤
                                            </div>
                                        )}
                                        <div>
                                            <button
                                                type="button"
                                                onClick={abrirWidgetCloudinary}
                                                disabled={uploadando}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#667eea',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: uploadando ? 'not-allowed' : 'pointer',
                                                    opacity: uploadando ? 0.7 : 1,
                                                    fontSize: '14px'
                                                }}
                                                aria-label="Enviar foto para a nuvem"
                                            >
                                                {uploadando ? 'Enviando...' : '☁️ Enviar foto'}
                                            </button>
                                            <small style={{ display: 'block', color: '#666', fontSize: '11px', marginTop: '4px' }}>
                                                Armazenado no Cloudinary
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="modal-actions">
                                    <button type="button" onClick={resetForm}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        {editingProfissional ? 'Atualizar' : 'Salvar'}
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

export default Profissionais;