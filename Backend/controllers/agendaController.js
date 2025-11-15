// controllers/agendaController.js
const Agenda = require('../models/Agenda');

class AgendaController {
    static async listar(req, res) {
        try {
            const agendas = await Agenda.findAll();
            res.json(agendas);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar agendas' });
        }
    }

    static async listarFiltrado(req, res) {
        try {
            const { data, profissionalId } = req.query;
            const agendas = await Agenda.findByFilters(data, profissionalId);
            res.json(agendas);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar agendas com filtro' });
        }
    }

    static async criar(req, res) {
        try {
            const { data_consulta, profissional_id, cliente_id, observacao } = req.body;
            
            if (!data_consulta || !profissional_id || !cliente_id) {
                return res.status(400).json({ error: 'Data, profissional e cliente são obrigatórios' });
            }

            const agendaId = await Agenda.create({
                data_consulta,
                profissional_id,
                cliente_id,
                observacao
            });

            res.status(201).json({ id: agendaId, message: 'Agendamento criado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar agendamento' });
        }
    }

    static async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            await Agenda.atualizarStatus(id, status);
            res.json({ message: 'Status atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar status' });
        }
    }

    // NOVO MÉTODO: Atualizar status do lembrete
    static async atualizarLembrete(req, res) {
        try {
            const { id } = req.params;
            const { lembrete_enviado } = req.body;

            await Agenda.atualizarLembrete(id, lembrete_enviado);
            res.json({ message: 'Status do lembrete atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar lembrete' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            await Agenda.delete(id);
            res.json({ message: 'Agendamento excluído com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao excluir agendamento' });
        }
    }

    static async testarWhatsApp(req, res) {
        try {
            const WhatsAppService = require('../services/whatsappService');
            await WhatsAppService.enviarLembretes();
            res.json({ message: 'Teste de WhatsApp executado com sucesso' });
        } catch (error) {
            console.error('Erro no teste WhatsApp:', error);
            res.status(500).json({ error: 'Erro ao testar WhatsApp' });
        }
    }

    
    static async atualizarPresenca(req, res) {
        try {
            const { id } = req.params;
            const { compareceu } = req.body;

            await Agenda.atualizarPresenca(id, compareceu);
            res.json({ message: 'Presença atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar presença:', error);
            res.status(500).json({ error: 'Erro ao atualizar presença' });
        }
    }
}

module.exports = AgendaController;
