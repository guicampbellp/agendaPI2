const ConfigAgenda = require('../models/ConfigAgenda');

class ConfigAgendaController {
    // Listar todas as configurações
    static async listar(req, res) {
        try {
            const configs = await ConfigAgenda.findAll();
            res.json(configs);
        } catch (error) {
            console.error('Erro ao listar configurações:', error);
            res.status(500).json({ error: 'Erro ao listar configurações' });
        }
    }

    // Listar configurações por profissional
    static async listarPorProfissional(req, res) {
        try {
            const { profissionalId } = req.params;
            const configs = await ConfigAgenda.findByProfissional(profissionalId);
            res.json(configs);
        } catch (error) {
            console.error('Erro ao listar configurações do profissional:', error);
            res.status(500).json({ error: 'Erro ao listar configurações do profissional' });
        }
    }

    // Criar configuração
    static async criar(req, res) {
        try {
            const config = req.body;
            const configId = await ConfigAgenda.create(config);
            res.status(201).json({ id: configId, message: 'Configuração criada com sucesso' });
        } catch (error) {
            console.error('Erro ao criar configuração:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Já existe configuração para este profissional neste dia' });
            }
            res.status(500).json({ error: 'Erro ao criar configuração' });
        }
    }

    // Atualizar configuração
    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const config = req.body;
            await ConfigAgenda.update(id, config);
            res.json({ message: 'Configuração atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar configuração:', error);
            res.status(500).json({ error: 'Erro ao atualizar configuração' });
        }
    }

    // Excluir configuração
    static async excluir(req, res) {
        try {
            const { id } = req.params;
            await ConfigAgenda.delete(id);
            res.json({ message: 'Configuração excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir configuração:', error);
            res.status(500).json({ error: 'Erro ao excluir configuração' });
        }
    }

    // Listar tipos de consulta
    static async listarTiposConsulta(req, res) {
        try {
            const tipos = await ConfigAgenda.findTiposConsulta();
            res.json(tipos);
        } catch (error) {
            console.error('Erro ao listar tipos de consulta:', error);
            res.status(500).json({ error: 'Erro ao listar tipos de consulta' });
        }
    }

    // Criar tipo de consulta
    static async criarTipoConsulta(req, res) {
        try {
            const tipo = req.body;
            const tipoId = await ConfigAgenda.createTipoConsulta(tipo);
            res.status(201).json({ id: tipoId, message: 'Tipo de consulta criado com sucesso' });
        } catch (error) {
            console.error('Erro ao criar tipo de consulta:', error);
            res.status(500).json({ error: 'Erro ao criar tipo de consulta' });
        }
    }

    // Gerar horários disponíveis
    static async gerarHorarios(req, res) {
        try {
            const { profissionalId, data } = req.query;
            const horarios = await ConfigAgenda.gerarHorariosDisponiveis(profissionalId, data);
            res.json(horarios);
        } catch (error) {
            console.error('Erro ao gerar horários:', error);
            res.status(500).json({ error: 'Erro ao gerar horários' });
        }
    }
}

module.exports = ConfigAgendaController;