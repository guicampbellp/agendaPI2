const db = require('../config/database');

class Funcionario {
    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM funcionarios WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT id, nome, email FROM funcionarios WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async create(funcionario) {
        const { nome, email, senha } = funcionario;
        const [result] = await db.execute(
            'INSERT INTO funcionarios (nome, email, senha) VALUES (?, ?, ?)',
            [nome, email, senha]
        );
        return result.insertId;
    }
}

module.exports = Funcionario;