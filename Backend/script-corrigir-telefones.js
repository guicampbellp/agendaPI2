// script-corrigir-telefones.js
const db = require('./config/database');

async function corrigirTelefones() {
    try {
        // Buscar todos os clientes
        const [clientes] = await db.execute('SELECT id, telefone FROM clientes');
        
        for (const cliente of clientes) {
            const numeros = cliente.telefone.replace(/\D/g, '');
            
            // Se tem 11 dígitos mas não começa com 55, adicionar 55
            if (numeros.length === 11 && !numeros.startsWith('55')) {
                const novoTelefone = `55${numeros}`;
                await db.execute('UPDATE clientes SET telefone = ? WHERE id = ?', [novoTelefone, cliente.id]);
                console.log(`✅ Corrigido: ${cliente.telefone} -> ${novoTelefone}`);
            }
        }
        
        console.log('✅ Correção de telefones concluída!');
    } catch (error) {
        console.error('❌ Erro ao corrigir telefones:', error);
    }
}

corrigirTelefones();