const db = require('../config/database');

class ConfigAgenda {
    // Buscar todas as configurações
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT cap.*, p.nome as profissional_nome, tc.nome as tipo_consulta_nome
            FROM config_agenda_profissional cap
            JOIN profissionais p ON cap.profissional_id = p.id
            LEFT JOIN tipos_consulta tc ON cap.tipo_consulta_id = tc.id
            ORDER BY p.nome, cap.dia_semana
        `);
        return rows;
    }

    // Buscar configurações por profissional
    static async findByProfissional(profissionalId) {
        const [rows] = await db.execute(`
            SELECT cap.*, tc.nome as tipo_consulta_nome, tc.duracao_minutos
            FROM config_agenda_profissional cap
            LEFT JOIN tipos_consulta tc ON cap.tipo_consulta_id = tc.id
            WHERE cap.profissional_id = ?
            ORDER BY 
                FIELD(cap.dia_semana, 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')
        `, [profissionalId]);
        return rows;
    }

    // Criar configuração
    static async create(config) {
        const { 
            profissional_id, 
            dia_semana, 
            hora_inicio, 
            hora_fim, 
            intervalo_minutos, 
            max_pacientes_dia, 
            tipo_consulta_id,
            ativo 
        } = config;
        
        const [result] = await db.execute(
            `INSERT INTO config_agenda_profissional 
            (profissional_id, dia_semana, hora_inicio, hora_fim, intervalo_minutos, max_pacientes_dia, tipo_consulta_id, ativo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [profissional_id, dia_semana, hora_inicio, hora_fim, intervalo_minutos, max_pacientes_dia, tipo_consulta_id, ativo]
        );
        return result.insertId;
    }

    // Atualizar configuração
    static async update(id, config) {
        const { 
            dia_semana, 
            hora_inicio, 
            hora_fim, 
            intervalo_minutos, 
            max_pacientes_dia, 
            tipo_consulta_id,
            ativo 
        } = config;
        
        await db.execute(
            `UPDATE config_agenda_profissional 
            SET dia_semana = ?, hora_inicio = ?, hora_fim = ?, intervalo_minutos = ?, 
                max_pacientes_dia = ?, tipo_consulta_id = ?, ativo = ?
            WHERE id = ?`,
            [dia_semana, hora_inicio, hora_fim, intervalo_minutos, max_pacientes_dia, tipo_consulta_id, ativo, id]
        );
    }

    // Excluir configuração
    static async delete(id) {
        await db.execute('DELETE FROM config_agenda_profissional WHERE id = ?', [id]);
    }

    // Buscar tipos de consulta
    static async findTiposConsulta() {
        const [rows] = await db.execute('SELECT * FROM tipos_consulta ORDER BY nome');
        return rows;
    }

    // Criar tipo de consulta
    static async createTipoConsulta(tipo) {
        const { nome, descricao, duracao_minutos } = tipo;
        const [result] = await db.execute(
            'INSERT INTO tipos_consulta (nome, descricao, duracao_minutos) VALUES (?, ?, ?)',
            [nome, descricao, duracao_minutos]
        );
        return result.insertId;
    }

    // Gerar horários baseados na configuração
    static async gerarHorariosDisponiveis(profissionalId, data) {
        // Determinar o dia da semana da data fornecida
        const [diaSemanaResult] = await db.execute(
            'SELECT DAYNAME(?) as dia_semana',
            [data]
        );
        const diaSemana = diaSemanaResult[0].dia_semana.toLowerCase();
        
        // Buscar configuração para esse dia
        const [configs] = await db.execute(`
            SELECT cap.*, tc.duracao_minutos
            FROM config_agenda_profissional cap
            LEFT JOIN tipos_consulta tc ON cap.tipo_consulta_id = tc.id
            WHERE cap.profissional_id = ? AND cap.dia_semana = ? AND cap.ativo = true
        `, [profissionalId, diaSemana]);
        
        if (configs.length === 0) {
            return []; // Não há configuração para este dia
        }

        const config = configs[0];
        const horarios = [];
        const duracao = config.duracao_minutos || config.intervalo_minutos || 30;
        
        let horaAtual = new Date(`1970-01-01T${config.hora_inicio}`);
        const horaFim = new Date(`1970-01-01T${config.hora_fim}`);
        
        while (horaAtual < horaFim) {
            horarios.push({
                horario: horaAtual.toTimeString().slice(0, 5),
                disponivel: true
            });
            
            // Adiciona intervalo
            horaAtual = new Date(horaAtual.getTime() + duracao * 60000);
        }
        
        return horarios;
    }
}

module.exports = ConfigAgenda;