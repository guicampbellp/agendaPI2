const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const agendaRoutes = require('./routes/agendas');
const clienteRoutes = require('./routes/clientes');
const profissionalRoutes = require('./routes/profissionais');
const SMSService = require('./services/smsService');
const estatisticasRoutes = require('./routes/estatisticas');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/agendas', agendaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/estatisticas', estatisticasRoutes);

// Iniciar agendador de lembretes
SMSService.iniciarAgendador();


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});