const express = require('express');
const authMiddleware = require('../middleware/auth');
const ConfigAgendaController = require('../controllers/configAgendaController');

const router = express.Router();

// Configurações de agenda
router.get('/', authMiddleware, ConfigAgendaController.listar);
router.get('/profissional/:profissionalId', authMiddleware, ConfigAgendaController.listarPorProfissional);
router.post('/', authMiddleware, ConfigAgendaController.criar);
router.put('/:id', authMiddleware, ConfigAgendaController.atualizar);
router.delete('/:id', authMiddleware, ConfigAgendaController.excluir);

// Tipos de consulta
router.get('/tipos-consulta', authMiddleware, ConfigAgendaController.listarTiposConsulta);
router.post('/tipos-consulta', authMiddleware, ConfigAgendaController.criarTipoConsulta);

// Utilitários
router.get('/horarios-disponiveis', authMiddleware, ConfigAgendaController.gerarHorarios);

module.exports = router;