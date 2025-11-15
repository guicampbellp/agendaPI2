const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conexão com o banco estabelecida!');
        
        // Testar se encontra o funcionário
        const [rows] = await connection.execute('SELECT * FROM funcionarios WHERE email = ?', ['admin@clinica.com']);
        
        if (rows.length > 0) {
            console.log('✅ Funcionário encontrado:', rows[0]);
        } else {
            console.log('❌ Funcionário não encontrado');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
    }
}

testConnection();