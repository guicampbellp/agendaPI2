const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Funcionario = require('../models/Funcionario');

class AuthController {
    static async login(req, res) {
        try {
            const { email, senha } = req.body;
            console.log('Tentativa de login:', email);

            const funcionario = await Funcionario.findByEmail(email);
            console.log('Funcionário encontrado:', funcionario);

            if (!funcionario) {
                console.log('Funcionário não encontrado');
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Verificar a senha
            const senhaValida = await bcrypt.compare(senha, funcionario.senha);
            console.log('Senha válida:', senhaValida);

            if (!senhaValida) {
                console.log('Senha inválida');
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const token = jwt.sign(
                { id: funcionario.id, email: funcionario.email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.json({
                token,
                usuario: {
                    id: funcionario.id,
                    nome: funcionario.nome,
                    email: funcionario.email
                }
            });
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    static async verificarToken(req, res) {
        try {
            const funcionario = await Funcionario.findById(req.usuarioId);
            if (!funcionario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json({ usuario: funcionario });
        } catch (error) {
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}

module.exports = AuthController;