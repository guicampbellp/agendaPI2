const express = require('express');
const authMiddleware = require('../middleware/auth');
const ClienteController = require('../controllers/clienteController');

const router = express.Router();

router.get('/', authMiddleware, ClienteController.listar);
router.get('/:id/historico', authMiddleware, ClienteController.buscarHistorico);
router.get('/:id/consultas', authMiddleware, ClienteController.verificarConsultas); // NOVA ROTA
router.get('/:id', authMiddleware, ClienteController.buscarPorId);
router.post('/', authMiddleware, ClienteController.criar);
router.put('/:id', authMiddleware, ClienteController.atualizar);
router.delete('/:id', authMiddleware, ClienteController.excluir);

module.exports = router;