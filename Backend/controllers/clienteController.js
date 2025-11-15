const Cliente = require('../models/Cliente');

class ClienteController {
    static async listar(req, res) {
        try {
            const clientes = await Cliente.findAll();
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar clientes' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const [cliente] = await Cliente.findById(id);
            
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }
            
            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar cliente' });
        }
    }

    static async criar(req, res) {
        try {
            const { nome, data_nascimento, cpf, telefone, genero } = req.body;
            
            if (!nome || !data_nascimento || !cpf || !telefone || !genero) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            const clienteId = await Cliente.create({
                nome,
                data_nascimento,
                cpf,
                telefone,
                genero
            });

            res.status(201).json({ id: clienteId, message: 'Cliente criado com sucesso' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }
            res.status(500).json({ error: 'Erro ao criar cliente' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, data_nascimento, cpf, telefone, genero } = req.body;

            await Cliente.update(id, {
                nome,
                data_nascimento,
                cpf,
                telefone,
                genero
            });

            res.json({ message: 'Cliente atualizado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao atualizar cliente' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            
            // Conta quantas consultas o cliente tem
            const totalConsultas = await Cliente.contarConsultas(id);
            
            // Exclui o cliente e suas consultas
            await Cliente.delete(id);
            
            res.json({ 
                message: 'Cliente excluído com sucesso',
                consultasExcluidas: totalConsultas
            });
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            res.status(500).json({ error: 'Erro ao excluir cliente' });
        }
    }

    // NOVO MÉTODO: Buscar histórico do cliente
    static async buscarHistorico(req, res) {
        try {
            console.log('Buscando histórico para cliente ID:', req.params.id);
            const { id } = req.params;
            const historico = await Cliente.buscarHistorico(id);
            console.log('Histórico encontrado:', historico);
            res.json(historico);
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            res.status(500).json({ error: 'Erro ao buscar histórico do cliente' });
        }
    }

    // NOVO MÉTODO: Verificar consultas do cliente
    static async verificarConsultas(req, res) {
        try {
            const { id } = req.params;
            const totalConsultas = await Cliente.contarConsultas(id);
            res.json({ totalConsultas });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao verificar consultas do cliente' });
        }
    }
}

module.exports = ClienteController;