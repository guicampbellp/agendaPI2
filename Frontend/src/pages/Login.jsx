import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login({ setIsAuthenticated }) {
    const [email, setEmail] = useState('admin@clinica.com');
    const [senha, setSenha] = useState('123456');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);
        setErro('');

        try {
            const response = await api.post('/auth/login', { email, senha });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
            
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (error) {
            setErro('Credenciais inválidas. Use: admin@clinica.com / 123456');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form" aria-label="Formulário de login">
                <h2>Agenda Médica - Login</h2>
                {erro && (
                    <div className="erro" id="erro-login" role="alert" aria-live="polite">
                        {erro}
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" className="form-label">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="admin@clinica.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={carregando}
                        aria-describedby={erro ? 'erro-login' : undefined}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="senha" className="form-label">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        placeholder="••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={carregando}
                        aria-describedby={erro ? 'erro-login' : undefined}
                    />
                </div>

                <button type="submit" disabled={carregando} aria-busy={carregando}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </button>
                
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '1rem', 
                    background: '#f0f8ff', 
                    borderRadius: '5px',
                    fontSize: '14px'
                }}>
                    
                </div>
            </form>
        </div>
    );
}

export default Login;