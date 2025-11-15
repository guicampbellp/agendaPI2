const express = require('express');
const authMiddleware = require('../middleware/auth');
const ProfissionalController = require('../controllers/profissionalController');

const router = express.Router();

router.get('/', authMiddleware, ProfissionalController.listar);
router.post('/', authMiddleware, ProfissionalController.criar);
router.put('/:id', authMiddleware, ProfissionalController.atualizar);
router.delete('/:id', authMiddleware, ProfissionalController.excluir);

module.exports = router;