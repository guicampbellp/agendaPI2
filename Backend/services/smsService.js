const twilio = require("twilio");
const Agenda = require("../models/Agenda");
const nodeCron = require("node-cron");

class SMSService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    static async enviarLembretes() {
        try {
            console.log("Verificando agendamentos para lembretes SMS...");
            const agendamentos = await Agenda.findProximos();
            console.log(`Encontrados ${agendamentos.length} agendamentos próximos`);

            const service = new SMSService();

            for (const agendamento of agendamentos) {
                if (agendamento.telefone && !agendamento.lembrete_enviado) {
                    try {
                        await service.enviarSMS(agendamento);
                        await Agenda.marcarLembreteEnviado(agendamento.id);
                        console.log(`SMS enviado para: ${agendamento.nome_cliente}`);
                    } catch (error) {
                        console.error(`Erro ao enviar SMS para ${agendamento.nome_cliente}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao enviar lembretes SMS:", error);
        }
    }

    async enviarSMS(agendamento) {
    try {
        console.log(`\n=== Tentando enviar SMS para: ${agendamento.nome_cliente} ===`);
        console.log(`Telefone original no banco: ${agendamento.telefone}`);

        // Formatar telefone para SMS (formato internacional)
        const telefoneFormatado = this.formatarTelefoneSMS(agendamento.telefone);
        
        if (!telefoneFormatado) {
            throw new Error(`Telefone inválido: ${agendamento.telefone}`);
        }

        console.log(`Telefone formatado para SMS: +${telefoneFormatado}`);

        // Formatar data e hora
        const dataConsulta = new Date(agendamento.data_consulta);
        const dataFormatada = dataConsulta.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const horaFormatada = dataConsulta.toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit'
        });

        // MENSAGEM REDUZIDA (máximo 160 caracteres)
        const mensagem = `Lembrete: Consulta com ${agendamento.nome_profissional} em ${dataFormatada} às ${horaFormatada}. Chegar 15min antes.`;

        // Verificar tamanho da mensagem
        console.log(`Tamanho da mensagem: ${mensagem.length} caracteres`);
        
        if (mensagem.length > 160) {
            // Se ainda estiver grande, reduza mais
            const mensagemCurta = `Consulta: ${dataFormatada} ${horaFormatada} - ${agendamento.nome_profissional}`;
            console.log(`Mensagem muito longa, usando versão curta: ${mensagemCurta.length} chars`);
            
            return await this.client.messages.create({
                body: mensagemCurta,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+${telefoneFormatado}`
            });
        }

        // Enviar SMS
        const result = await this.client.messages.create({
            body: mensagem,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+${telefoneFormatado}`
        });

        console.log(`✅ SMS enviado com SUCESSO para +${telefoneFormatado}`);
        console.log(`Twilio Message SID: ${result.sid}`);
        console.log(`Status: ${result.status}`);
        console.log(`Preço: ${result.price}`);

        return result;

    } catch (error) {
        console.error('❌ Erro ao enviar SMS via Twilio:', error);
        console.error('Código do erro:', error.code);
        console.error('Mensagem do erro:', error.message);
        
        if (error.code === 30044) {
            console.error('ERRO: Mensagem muito longa para conta trial');
            console.error('Solução: Reduza para menos de 160 caracteres');
        }
        throw error;
    }
}

    formatarTelefoneSMS(telefone) {
        // Remover todos os caracteres não numéricos
        const numeros = telefone.replace(/\D/g, '');
        
        console.log(`Telefone original: ${telefone}`);
        console.log(`Telefone apenas números: ${numeros}`);

        // Para SMS, precisa ter pelo menos 10 dígitos (DDD + número)
        if (numeros.length === 13 && numeros.startsWith('55')) {
            console.log(`✅ Telefone válido (13 dígitos com 55): +${numeros}`);
            return numeros;
        }
        
        if (numeros.length === 11 && !numeros.startsWith('55')) {
            const telefoneFormatado = `55${numeros}`;
            console.log(`✅ Telefone formatado (adicionado 55): +${telefoneFormatado}`);
            return telefoneFormatado;
        }
        
        if (numeros.length === 10) {
            const telefoneFormatado = `55${numeros}`;
            console.log(`✅ Telefone formatado (10 dígitos): +${telefoneFormatado}`);
            return telefoneFormatado;
        }
        
        console.error(`❌ Formato de telefone inválido para SMS: ${telefone} (${numeros.length} dígitos)`);
        return null;
    }

    static iniciarAgendador() {
        console.log("Iniciando agendador de lembretes SMS...");
        
        // Executar a cada 5 minutos para verificar agendamentos
        nodeCron.schedule("*/5 * * * *", () => {
            console.log("Executando verificação de lembretes SMS...");
            this.enviarLembretes();
        });
        
        // Executar também na inicialização
        setTimeout(() => {
            this.enviarLembretes();
        }, 5000);
    }
}

module.exports = SMSService;