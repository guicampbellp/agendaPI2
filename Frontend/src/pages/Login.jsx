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
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Agenda Médica - Login</h2>
                {erro && <div className="erro">{erro}</div>}
                
                <div style={{ marginBottom: '1rem' }}>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={carregando}
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        disabled={carregando}
                    />
                </div>
                
                <button type="submit" disabled={carregando}>
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