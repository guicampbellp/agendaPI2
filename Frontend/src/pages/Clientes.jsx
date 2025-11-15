// src/pages/Clientes.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [historicoCliente, setHistoricoCliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    data_nascimento: "",
    cpf: "",
    telefone: "",
    genero: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async (clienteId) => {
    setLoadingHistorico(true);
    try {
      const response = await api.get(`/clientes/${clienteId}/historico`);
      setHistoricoCliente(response.data);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      alert("Erro ao carregar histórico do paciente");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleAbrirHistorico = async (cliente) => {
    setClienteSelecionado(cliente);
    await carregarHistorico(cliente.id);
    setShowHistoricoModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}`, formData);
        alert("Cliente atualizado com sucesso!");
      } else {
        await api.post("/clientes", formData);
        alert("Cliente criado com sucesso!");
      }
      setShowModal(false);
      setEditingCliente(null);
      setFormData({
        nome: "",
        data_nascimento: "",
        cpf: "",
        telefone: "",
        genero: "",
      });
      carregarClientes();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao salvar cliente");
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);

    // Formatar a data para o formato YYYY-MM-DD que o input type="date" espera
    const dataNascimentoFormatada = new Date(cliente.data_nascimento)
      .toISOString()
      .split("T")[0];

    setFormData({
      nome: cliente.nome,
      data_nascimento: dataNascimentoFormatada, // Data formatada corretamente
      cpf: cliente.cpf,
      telefone: cliente.telefone,
      genero: cliente.genero,
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nome) => {
    // Primeiro verifica quantas consultas o cliente tem
    try {
      const response = await api.get(`/clientes/${id}/consultas`);
      const totalConsultas = response.data.totalConsultas;

      let mensagem = `Tem certeza que deseja excluir o cliente ${nome}?`;

      if (totalConsultas > 0) {
        mensagem += `\n\n⚠️ ATENÇÃO: Este cliente possui ${totalConsultas} consulta(s) agendada(s) que também serão excluída(s).`;
      }

      if (window.confirm(mensagem)) {
        await api.delete(`/clientes/${id}`);
        carregarClientes();
        alert("Cliente e suas consultas foram excluídos com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao verificar consultas:", error);
      // Se não conseguir verificar as consultas, mostra mensagem genérica
      if (
        window.confirm(
          `Tem certeza que deseja excluir o cliente ${nome}?\n\nTodas as consultas relacionadas também serão excluídas.`
        )
      ) {
        await api.delete(`/clientes/${id}`);
        carregarClientes();
        alert("Cliente excluído com sucesso!");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const formatarCPF = (cpf) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (telefone) => {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="page-container">
      <header>
        <h1>👥 Clientes</h1>
        <nav>
          <Link to="/Dashboard">🏠 Dashboard</Link>
          <Link to="/Agendas">📅 Agendas</Link>
          <Link to="/Profissionais">👨‍⚕️ Profissionais</Link>
          <Link to="/estatisticas">📊 Estatísticas</Link>
          <button onClick={handleLogout} className="btn-logout">
            Sair
          </button>
        </nav>
      </header>

      <main>
        <div className="page-header">
          <h2>Gerenciar Clientes</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Novo Cliente
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Data Nasc.</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Gênero</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>
                    {new Date(cliente.data_nascimento).toLocaleDateString(
                      "pt-BR"
                    )}
                  </td>
                  <td>{formatarCPF(cliente.cpf)}</td>
                  <td>{formatarTelefone(cliente.telefone)}</td>
                  <td>
                    {cliente.genero === "M"
                      ? "Masculino"
                      : cliente.genero === "F"
                      ? "Feminino"
                      : "Outro"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleAbrirHistorico(cliente)}
                      className="btn-info"
                      style={{ marginRight: "5px", backgroundColor: "#17a2b8" }}
                    >
                      Histórico
                    </button>
                    <button
                      onClick={() => handleEdit(cliente)}
                      className="btn-edit"
                      style={{ marginRight: "5px" }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.id, cliente.nome)}
                      className="btn-danger"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de Cadastro/Edição */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{editingCliente ? "Editar" : "Novo"} Cliente</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome:</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Data de Nascimento:</label>
                  <input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data_nascimento: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>CPF:</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefone:</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gênero:</label>
                  <select
                    value={formData.genero}
                    onChange={(e) =>
                      setFormData({ ...formData, genero: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCliente(null);
                      setFormData({
                        nome: "",
                        data_nascimento: "",
                        cpf: "",
                        telefone: "",
                        genero: "",
                      });
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCliente ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Histórico */}
        {/* Modal de Histórico */}
        {showHistoricoModal && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: "900px" }}>
              <h3>Histórico de Consultas - {clienteSelecionado?.nome}</h3>

              {loadingHistorico ? (
                <div>Carregando histórico...</div>
              ) : (
                <div className="table-container">
                  {historicoCliente.length === 0 ? (
                    <p>Nenhuma consulta agendada para este paciente.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Data da Consulta</th>
                          <th>Profissional</th>
                          <th>Especialidade</th>
                          <th>Status</th>
                          <th>Compareceu</th>
                          <th>Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoCliente.map((consulta) => {
                          const dataConsulta = new Date(consulta.data_consulta);
                          const hoje = new Date();
                          const ehFuturo = dataConsulta > hoje;
                          const jaPassou = dataConsulta < hoje;

                          return (
                            <tr key={consulta.id}>
                              <td>
                                {formatarData(consulta.data_consulta)}
                                {ehFuturo && (
                                  <span
                                    style={{
                                      color: "blue",
                                      fontWeight: "bold",
                                      marginLeft: "5px",
                                      fontSize: "0.8em",
                                    }}
                                  >
                                    ⏳ Futuro
                                  </span>
                                )}
                              </td>
                              <td>
                                {consulta.profissional_nome || "Não informado"}
                              </td>
                              <td>
                                {consulta.especialidade || "Não informada"}
                              </td>
                              <td>
                                <span
                                  style={{
                                    color:
                                      consulta.status === "realizado"
                                        ? "green"
                                        : consulta.status === "cancelado"
                                        ? "red"
                                        : consulta.status === "confirmado"
                                        ? "orange"
                                        : "blue",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {consulta.status === "agendado" &&
                                    "🟡 Agendado"}
                                  {consulta.status === "confirmado" &&
                                    "🟠 Confirmado"}
                                  {consulta.status === "realizado" &&
                                    "✅ Realizado"}
                                  {consulta.status === "cancelado" &&
                                    "❌ Cancelado"}
                                </span>
                              </td>
                              <td>
                                {consulta.status === "realizado" || jaPassou ? (
                                  <span
                                    style={{
                                      color:
                                        consulta.paciente_compareceu === "sim"
                                          ? "green"
                                          : consulta.paciente_compareceu ===
                                            "nao"
                                          ? "red"
                                          : "#666",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {consulta.paciente_compareceu === "sim" &&
                                      "✅ Sim"}
                                    {consulta.paciente_compareceu === "nao" &&
                                      "❌ Não"}
                                    {consulta.paciente_compareceu ===
                                      "pendente" &&
                                      (consulta.status === "realizado"
                                        ? "❓ Pendente"
                                        : "⏳ Aguardando")}
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      color: "#666",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    {consulta.status === "cancelado"
                                      ? "Consulta cancelada"
                                      : "Aguardando data"}
                                  </span>
                                )}
                              </td>
                              <td>
                                {consulta.observacoes || "Nenhuma observação"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowHistoricoModal(false)}
                  className="btn-primary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Clientes;
