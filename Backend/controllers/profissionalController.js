// controllers/profissionalController.js
const Profissional = require('../models/Profissional');

class ProfissionalController {
    static async listar(req, res) {
        try {
            const profissionais = await Profissional.findAll();
            res.json(profissionais);
        } catch (error) {
            console.error('Erro ao listar profissionais:', error);
            res.status(500).json({ error: 'Erro ao listar profissionais' });
        }
    }

    static async criar(req, res) {
        try {
            const { nome, especialidade, foto_url } = req.body;
            
            if (!nome || !especialidade) {
                return res.status(400).json({ error: 'Nome e especialidade são obrigatórios' });
            }

            const profissionalId = await Profissional.create({ 
                nome, 
                especialidade, 
                foto_url 
            });
            res.status(201).json({ 
                id: profissionalId, 
                message: 'Profissional criado com sucesso' 
            });
        } catch (error) {
            console.error('Erro ao criar profissional:', error);
            res.status(500).json({ error: 'Erro ao criar profissional' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, especialidade, foto_url } = req.body;

            await Profissional.update(id, { 
                nome, 
                especialidade, 
                foto_url 
            });
            res.json({ message: 'Profissional atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar profissional:', error);
            res.status(500).json({ error: 'Erro ao atualizar profissional' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            await Profissional.delete(id);
            res.json({ message: 'Profissional excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir profissional:', error);
            res.status(500).json({ error: 'Erro ao excluir profissional' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const profissional = await Profissional.findById(id);
            
            if (!profissional) {
                return res.status(404).json({ error: 'Profissional não encontrado' });
            }
            
            res.json(profissional);
        } catch (error) {
            console.error('Erro ao buscar profissional:', error);
            res.status(500).json({ error: 'Erro ao buscar profissional' });
        }
    }
}

module.exports = ProfissionalController;