// routes/estatisticas.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const EstatisticasController = require('../controllers/estatisticasController');
const AgendaController = require('../controllers/agendaController');

const router = express.Router();

router.get('/presencas', authMiddleware, EstatisticasController.getPresencas);
router.get('/agendamentos-dia', authMiddleware, EstatisticasController.getAgendamentosDoDia);
router.put('/agendas/:id/presenca', authMiddleware, AgendaController.atualizarPresenca);

module.exports = router;