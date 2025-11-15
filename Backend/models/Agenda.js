const db = require('../config/database');

class Agenda {

     static async findAgendamentosDoDia(data) {
        const [rows] = await db.execute(`
            SELECT a.*, 
                   c.nome as nome_cliente, 
                   c.telefone, 
                   p.nome as nome_profissional,
                   p.especialidade
            FROM agendas a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN profissionais p ON a.profissional_id = p.id
            WHERE DATE(a.data_consulta) = ?
            AND a.status = 'agendado'
            ORDER BY a.data_consulta
        `, [data]);
        return rows;
    }

    static async atualizarPresenca(id, compareceu) {
        await db.execute(
            'UPDATE agendas SET paciente_compareceu = ?, data_confirmacao_presenca = NOW() WHERE id = ?',
            [compareceu, id]
        );
    }

    static async getEstatisticasPresenca(dataInicio, dataFim) {
        const [rows] = await db.execute(`
            SELECT 
                DATE(data_consulta) as data,
                COUNT(*) as total_agendados,
                SUM(CASE WHEN paciente_compareceu = 'sim' THEN 1 ELSE 0 END) as compareceram,
                SUM(CASE WHEN paciente_compareceu = 'nao' THEN 1 ELSE 0 END) as faltaram,
                SUM(CASE WHEN paciente_compareceu = 'pendente' THEN 1 ELSE 0 END) as pendentes
            FROM agendas
            WHERE data_consulta BETWEEN ? AND ?
            AND status = 'agendado'
            GROUP BY DATE(data_consulta)
            ORDER BY data
        `, [dataInicio, dataFim]);
        return rows;
    }

    static async getEstatisticasGerais() {
        const [rows] = await db.execute(`
            SELECT 
                COUNT(*) as total_agendados,
                SUM(CASE WHEN paciente_compareceu = 'sim' THEN 1 ELSE 0 END) as total_compareceram,
                SUM(CASE WHEN paciente_compareceu = 'nao' THEN 1 ELSE 0 END) as total_faltaram,
                ROUND((SUM(CASE WHEN paciente_compareceu = 'sim' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as taxa_presenca
            FROM agendas
            WHERE paciente_compareceu IN ('sim', 'nao')
        `);
        return rows[0];
    }

    static async findAll() {
        const [rows] = await db.execute(`
            SELECT a.*, c.nome as cliente_nome, p.nome as profissional_nome, p.especialidade
            FROM agendas a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN profissionais p ON a.profissional_id = p.id
            ORDER BY a.data_consulta
        `);
        return rows;
    }

    static async findByFilters(data, profissionalId) {
        let sql = `
            SELECT a.*, c.nome as cliente_nome, p.nome as profissional_nome, p.especialidade
            FROM agendas a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN profissionais p ON a.profissional_id = p.id
        `;
        const params = [];

        // Adiciona as cláusulas WHERE dinamicamente
        const whereConditions = [];
        
        if (data) {
            whereConditions.push('DATE(a.data_consulta) = ?');
            params.push(data);
        }
        
        if (profissionalId) {
            whereConditions.push('a.profissional_id = ?');
            params.push(profissionalId);
        }

        if (whereConditions.length > 0) {
            sql += ` WHERE ` + whereConditions.join(' AND ');
        }
        
        sql += ` ORDER BY a.data_consulta`;
        
        const [rows] = await db.execute(sql, params);
        return rows;
    }

    static async create(agenda) {
        const { data_consulta, profissional_id, cliente_id, observacao } = agenda;
        const [result] = await db.execute(
            'INSERT INTO agendas (data_consulta, profissional_id, cliente_id, observacao) VALUES (?, ?, ?, ?)',
            [data_consulta, profissional_id, cliente_id, observacao]
        );
        return result.insertId;
    }

    static async atualizarStatus(id, status) {
        await db.execute(
            'UPDATE agendas SET status = ? WHERE id = ?',
            [status, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM agendas WHERE id = ?', [id]);
    }

    static async findProximos() {
        const [rows] = await db.execute(`
            SELECT a.*, 
                   c.nome as nome_cliente, 
                   c.telefone, 
                   p.nome as nome_profissional
            FROM agendas a
            JOIN clientes c ON a.cliente_id = c.id
            JOIN profissionais p ON a.profissional_id = p.id
            WHERE a.data_consulta BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 24 HOUR)
            AND a.status = 'agendado'
            AND a.lembrete_enviado = 0
        `);
        return rows;
    }

    static async marcarLembreteEnviado(id) {
        await db.execute(
            'UPDATE agendas SET lembrete_enviado = 1 WHERE id = ?',
            [id]
        );
    }

    // NOVO MÉTODO: Atualizar status do lembrete
    static async atualizarLembrete(id, lembrete_enviado) {
        await db.execute(
            'UPDATE agendas SET lembrete_enviado = ? WHERE id = ?',
            [lembrete_enviado, id]
        );
    }
    
}

module.exports = Agenda;