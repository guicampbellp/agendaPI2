const request = require('supertest');
const bcrypt = require('bcryptjs');

// Mock do banco de dados para não precisar de MySQL nos testes
jest.mock('../config/database', () => ({
    execute: jest.fn(),
    query: jest.fn(),
}));

// Mock do SMSService para não iniciar o agendador
jest.mock('../services/smsService', () => ({
    iniciarAgendador: jest.fn(),
}));

const app = require('../server');
const db = require('../config/database');

describe('POST /api/auth/login', () => {
    const senhaHash = bcrypt.hashSync('123456', 10);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('retorna token com credenciais válidas', async () => {
        db.execute.mockResolvedValueOnce([[{
            id: 1,
            nome: 'Administrador',
            email: 'admin@clinica.com',
            senha: senhaHash,
        }]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@clinica.com', senha: '123456' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.usuario.email).toBe('admin@clinica.com');
    });

    test('retorna 401 com senha incorreta', async () => {
        db.execute.mockResolvedValueOnce([[{
            id: 1,
            nome: 'Administrador',
            email: 'admin@clinica.com',
            senha: senhaHash,
        }]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@clinica.com', senha: 'senha_errada' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    test('retorna 401 com e-mail inexistente', async () => {
        db.execute.mockResolvedValueOnce([[]]);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'naoexiste@clinica.com', senha: '123456' });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/agendas (rota protegida)', () => {
    test('retorna 401 sem token de autenticação', async () => {
        const res = await request(app).get('/api/agendas');
        expect(res.status).toBe(401);
    });
});
