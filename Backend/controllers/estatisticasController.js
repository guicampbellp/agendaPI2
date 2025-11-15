// controllers/estatisticasController.js
const Agenda = require('../models/Agenda');

class EstatisticasController {
    static async getPresencas(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            
            // Se não fornecer datas, usa o último mês
            const dataInicioPadrao = dataInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const dataFimPadrao = dataFim || new Date().toISOString().split('T')[0];

            const estatisticas = await Agenda.getEstatisticasPresenca(dataInicioPadrao, dataFimPadrao);
            const estatisticasGerais = await Agenda.getEstatisticasGerais();

            res.json({
                estatisticasPorData: estatisticas,
                estatisticasGerais: estatisticasGerais
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    }

    static async getAgendamentosDoDia(req, res) {
        try {
            const { data } = req.query;
            const dataConsulta = data || new Date().toISOString().split('T')[0];
            
            const agendamentos = await Agenda.findAgendamentosDoDia(dataConsulta);
            res.json(agendamentos);
        } catch (error) {
            console.error('Erro ao buscar agendamentos do dia:', error);
            res.status(500).json({ error: 'Erro ao buscar agendamentos do dia' });
        }
    }
}

module.exports = EstatisticasController;