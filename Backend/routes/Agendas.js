// routes/Agendas.js
const express = require('express');
const authMiddleware = require('../middleware/auth');
const AgendaController = require('../controllers/agendaController');

const router = express.Router();

router.get('/', authMiddleware, AgendaController.listarFiltrado); 
router.post('/', authMiddleware, AgendaController.criar);
router.put('/:id/status', authMiddleware, AgendaController.atualizarStatus);
router.put('/:id/lembrete', authMiddleware, AgendaController.atualizarLembrete); // NOVA ROTA
router.delete('/:id', authMiddleware, AgendaController.excluir);
router.post('/testar-whatsapp', AgendaController.testarWhatsApp);

module.exports = router;