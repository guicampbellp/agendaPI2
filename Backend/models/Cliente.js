const db = require('../config/database');

class Cliente {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM clientes ORDER BY nome');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM clientes WHERE id = ?', [id]);
        return rows;
    }

    static async create(cliente) {
        const { nome, data_nascimento, cpf, telefone, genero } = cliente;
        const [result] = await db.execute(
            'INSERT INTO clientes (nome, data_nascimento, cpf, telefone, genero) VALUES (?, ?, ?, ?, ?)',
            [nome, data_nascimento, cpf, telefone, genero]
        );
        return result.insertId;
    }

    static async update(id, cliente) {
        const { nome, data_nascimento, cpf, telefone, genero } = cliente;
        await db.execute(
            'UPDATE clientes SET nome = ?, data_nascimento = ?, cpf = ?, telefone = ?, genero = ? WHERE id = ?',
            [nome, data_nascimento, cpf, telefone, genero, id]
        );
    }

    static async delete(id) {
        // Primeiro exclui as consultas relacionadas ao cliente
        await db.execute('DELETE FROM agendas WHERE cliente_id = ?', [id]);
        // Depois exclui o cliente
        await db.execute('DELETE FROM clientes WHERE id = ?', [id]);
    }

    // MÉTODO ATUALIZADO: Buscar histórico do cliente da tabela agendas
    static async buscarHistorico(clienteId) {
        const [rows] = await db.execute(`
            SELECT 
                a.id,
                a.data_consulta,
                a.status,
                a.observacao as observacoes,
                a.paciente_compareceu,
                p.nome as profissional_nome,
                p.especialidade
            FROM agendas a
            LEFT JOIN profissionais p ON a.profissional_id = p.id
            WHERE a.cliente_id = ?
            ORDER BY a.data_consulta DESC
        `, [clienteId]);
        return rows;
    }

    // NOVO MÉTODO: Contar consultas do cliente
    static async contarConsultas(clienteId) {
        const [rows] = await db.execute(
            'SELECT COUNT(*) as total FROM agendas WHERE cliente_id = ?',
            [clienteId]
        );
        return rows[0].total;
    }
}

module.exports = Cliente;