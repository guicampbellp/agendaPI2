const twilio = require("twilio");
const Agenda = require("../models/Agenda");
const nodeCron = require("node-cron");

class WhatsAppService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  static async enviarLembretes() {
    try {
      console.log("Verificando agendamentos para lembretes...");
      const agendamentos = await Agenda.findProximos();
      console.log(`Encontrados ${agendamentos.length} agendamentos próximos`);

      const service = new WhatsAppService();

      for (const agendamento of agendamentos) {
        if (agendamento.telefone && !agendamento.lembrete_enviado) {
          try {
            await service.enviarMensagem(agendamento);
            await Agenda.marcarLembreteEnviado(agendamento.id);
            console.log(`Lembrete enviado para: ${agendamento.nome_cliente}`);
          } catch (error) {
            console.error(
              `Erro ao enviar para ${agendamento.nome_cliente}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error("Erro ao enviar lembretes:", error);
    }
  }

  async enviarMensagem(agendamento) {
    try {
      console.log(`\n=== Tentando enviar mensagem para: ${agendamento.nome_cliente} ===`);
      console.log(`Telefone original no banco: ${agendamento.telefone}`);

      // Formatar telefone
      const telefoneFormatado = this.formatarTelefone(agendamento.telefone);
      if (!telefoneFormatado) {
        throw new Error(`Telefone inválido: ${agendamento.telefone}`);
      }
      console.log(`Telefone formatado: +${telefoneFormatado}`);

      // Formatar data e hora
      const dataConsulta = new Date(agendamento.data_consulta);
      const dataFormatada = dataConsulta.toLocaleDateString('pt-BR', {
        day:'2-digit', month:'2-digit', year:'numeric'
      });
      const horaFormatada = dataConsulta.toLocaleTimeString('pt-BR', {
        hour:'2-digit', minute:'2-digit'
      });

      // Variáveis do template
      const contentVariables = JSON.stringify({
        "1": agendamento.nome_cliente,
        "2": dataFormatada,
        "3": horaFormatada,
        "4": agendamento.nome_profissional
      });

      // Envio usando template
      const result = await this.client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER, // whatsapp:+14155238886
        to: `whatsapp:+${telefoneFormatado}`,
        contentSid: "HX22d03a41703694be019f90b08a9dc352",
        contentVariables
      });

      console.log(`✅ Mensagem enviada com SUCESSO para +${telefoneFormatado}`);
      console.log(`Twilio Message SID: ${result.sid}`);

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via Twilio:', error);
      if (error.code === 21211) {
        console.error('ERRO: Número de telefone inválido');
      } else if (error.code === 21408) {
        console.error('ERRO: Acesso à API do WhatsApp não disponível');
      } else if (error.code === 21610) {
        console.error('ERRO: Número não está no WhatsApp');
      }
      throw error;
    }
  }

  formatarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, '');

    console.log(`Telefone original: ${telefone}`);
    console.log(`Telefone apenas números: ${numeros}`);

    if (numeros.length === 13 && numeros.startsWith('55')) return numeros;
    if (numeros.length === 11 && !numeros.startsWith('55')) return `55${numeros}`;
    if (numeros.length < 11) {
      console.error(`❌ Telefone muito curto: ${numeros}`);
      return null;
    }
    console.error(`❌ Formato de telefone inválido: ${telefone}`);
    return null;
  }

  static iniciarAgendador() {
    console.log("Iniciando agendador de lembretes WhatsApp...");

    // Executar a cada 5 minutos
    nodeCron.schedule("*/5 * * * *", () => {
      console.log("Executando verificação de lembretes...");
      this.enviarLembretes();
    });

    // Executar na inicialização
    setTimeout(() => {
      this.enviarLembretes();
    }, 5000);
  }
}

module.exports = WhatsAppService;
