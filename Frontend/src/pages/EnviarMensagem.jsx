// src/pages/EnviarMensagem.jsx
import React, { useState } from "react";
import axios from "axios";

function EnviarMensagem() {
  const [telefone, setTelefone] = useState("5513991669688"); // com DDI 55
  const [nome, setNome] = useState("Guilherme");
  const [profissional, setProfissional] = useState("Dr. João");
  const [dataConsulta, setDataConsulta] = useState("25/09/2025 15:00");
  const [status, setStatus] = useState("");

  const enviarMensagem = async () => {
    try {
      const response = await axios.post(
        "https://graph.facebook.com/v22.0/779144658621393/messages",
        {
          messaging_product: "whatsapp",
          to: telefone,
          type: "template",
          template: {
            name: "lembrete_consulta", // precisa ser um template aprovado
            language: { code: "pt_BR" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: nome },
                  { type: "text", text: profissional },
                  { type: "text", text: dataConsulta },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization:
              "Bearer EAAaFwJM8XigBPrMPzTBckhS6E7er1jo7beZC3WxO6fB6c934MVONKFY6vZAFP8rAiZBZBlWdWxGopSWE6Agtdi2DmkcfGVCtWnG4rEVhVz06xIFjGliVoLRT7pJRabZAfPSXZAuTiZByYGEIiIJzKXFwDFYNZC3JlkRHfo2b8sc8LwtgQj4xEOPSZB3NKbWFuXUWFt4pPXoTTAX09YUiNmqFV8LhyNd6T7O6ZBrZBTiufpY7k4yKQZDZD",
            "Content-Type": "application/json",
          },
        }
      );
      setStatus("✅ Mensagem enviada com sucesso!");
      console.log(response.data);
    } catch (error) {
      setStatus("❌ Erro ao enviar mensagem");
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Enviar Mensagem no WhatsApp</h2>

      <div>
        <label>Telefone (com DDI):</label>
        <input
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </div>

      <div>
        <label>Nome do paciente:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      <div>
        <label>Profissional:</label>
        <input
          type="text"
          value={profissional}
          onChange={(e) => setProfissional(e.target.value)}
        />
      </div>

      <div>
        <label>Data/Hora Consulta:</label>
        <input
          type="text"
          value={dataConsulta}
          onChange={(e) => setDataConsulta(e.target.value)}
        />
      </div>

      <button onClick={enviarMensagem}>Enviar Mensagem</button>
      <p>{status}</p>
    </div>
  );
}

export default EnviarMensagem;
