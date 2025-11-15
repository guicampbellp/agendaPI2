// models/Profissional.js
const db = require('../config/database');

class Profissional {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM profissionais ORDER BY nome');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM profissionais WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(profissional) {
        const { nome, especialidade, foto_url } = profissional;
        const [result] = await db.execute(
            'INSERT INTO profissionais (nome, especialidade, foto_url) VALUES (?, ?, ?)',
            [nome, especialidade, foto_url || null]
        );
        return result.insertId;
    }

    static async update(id, profissional) {
        const { nome, especialidade, foto_url } = profissional;
        await db.execute(
            'UPDATE profissionais SET nome = ?, especialidade = ?, foto_url = ? WHERE id = ?',
            [nome, especialidade, foto_url || null, id]
        );
    }

    static async delete(id) {
        await db.execute('DELETE FROM profissionais WHERE id = ?', [id]);
    }

    // Método para atualizar apenas a foto
    static async atualizarFoto(id, foto_url) {
        await db.execute(
            'UPDATE profissionais SET foto_url = ? WHERE id = ?',
            [foto_url, id]
        );
    }
}

module.exports = Profissional;