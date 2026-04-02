-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 03/04/2026 às 00:04
-- Versão do servidor: 8.0.36
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `agenda_medica`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendas`
--

CREATE TABLE `agendas` (
  `id` int NOT NULL,
  `data_consulta` datetime NOT NULL,
  `profissional_id` int DEFAULT NULL,
  `cliente_id` int DEFAULT NULL,
  `status` enum('agendado','confirmado','cancelado','realizado') DEFAULT 'agendado',
  `observacao` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lembrete_enviado` tinyint DEFAULT '0',
  `paciente_compareceu` enum('sim','nao','pendente') DEFAULT 'pendente',
  `data_confirmacao_presenca` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `agendas`
--

INSERT INTO `agendas` (`id`, `data_consulta`, `profissional_id`, `cliente_id`, `status`, `observacao`, `created_at`, `lembrete_enviado`, `paciente_compareceu`, `data_confirmacao_presenca`) VALUES
(41, '2025-11-14 19:10:00', 7, 6, 'agendado', 'Primeira Consulta', '2025-11-14 22:20:01', 0, 'sim', '2025-11-16 17:33:42'),
(47, '2025-11-14 21:10:00', 14, 4, 'agendado', 'Primeira Consulta', '2025-11-14 23:58:54', 1, 'nao', '2025-11-16 17:33:50'),
(49, '2025-11-16 14:50:00', 7, 4, 'agendado', 'Segunda Consulta\n', '2025-11-16 17:38:49', 1, 'pendente', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `data_nascimento` date NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `telefone` varchar(15) NOT NULL,
  `genero` enum('M','F','Outro') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `nome`, `data_nascimento`, `cpf`, `telefone`, `genero`, `created_at`) VALUES
(4, 'Guilherme Campbell Penna', '1999-04-29', '41111111126', '13991669688', 'M', '2025-11-14 22:03:04'),
(5, 'Roberto Almeida', '1985-03-15', '123.456.789-00', '(11) 99999-1111', 'M', '2025-11-14 22:19:00'),
(6, 'Carla Santos', '1999-07-22', '234.567.890-11', '(11) 99999-2222', 'F', '2025-11-14 22:19:00'),
(7, 'Mariana silva', '1978-11-30', '345.678.901-22', '(11) 99999-3333', 'F', '2025-11-14 22:19:00'),
(8, 'Paulo Rodrigues', '1982-05-10', '456.789.012-33', '(11) 99999-4444', 'M', '2025-11-14 22:19:00'),
(11, 'Rosana Ribeiro', '1965-04-03', '12345678912', '13991669622', 'F', '2025-11-14 22:33:29');

-- --------------------------------------------------------

--
-- Estrutura para tabela `estatisticas_presenca`
--

CREATE TABLE `estatisticas_presenca` (
  `id` int NOT NULL,
  `data_referencia` date NOT NULL,
  `total_agendados` int DEFAULT '0',
  `total_compareceram` int DEFAULT '0',
  `total_faltaram` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `nome`, `email`, `senha`, `created_at`) VALUES
(1, 'Administrador', 'admin@clinica.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2025-09-24 12:59:45');

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_consultas`
--

CREATE TABLE `historico_consultas` (
  `id` int NOT NULL,
  `cliente_id` int NOT NULL,
  `data_consulta` datetime NOT NULL,
  `profissional_id` int NOT NULL,
  `observacoes` text,
  `paciente_compareceu` enum('sim','nao') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `profissionais`
--

CREATE TABLE `profissionais` (
  `id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `especialidade` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `foto_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Despejando dados para a tabela `profissionais`
--

INSERT INTO `profissionais` (`id`, `nome`, `especialidade`, `created_at`, `foto_url`) VALUES
(7, 'Dr. Carlos', 'Pediatria', '2025-11-14 22:18:48', 'https://cdn.iconscout.com/icon/free/png-256/free-pessoa-icon-svg-download-png-1502146.png'),
(14, 'Dr. Guilherme Silva', 'Ortopedia', '2025-11-14 23:56:16', 'https://cdn.iconscout.com/icon/free/png-256/free-pessoa-icon-svg-download-png-1502146.png');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `agendas`
--
ALTER TABLE `agendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profissional_id` (`profissional_id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cpf` (`cpf`);

--
-- Índices de tabela `estatisticas_presenca`
--
ALTER TABLE `estatisticas_presenca`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `historico_consultas`
--
ALTER TABLE `historico_consultas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `profissional_id` (`profissional_id`);

--
-- Índices de tabela `profissionais`
--
ALTER TABLE `profissionais`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `agendas`
--
ALTER TABLE `agendas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `estatisticas_presenca`
--
ALTER TABLE `estatisticas_presenca`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `historico_consultas`
--
ALTER TABLE `historico_consultas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `profissionais`
--
ALTER TABLE `profissionais`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `agendas`
--
ALTER TABLE `agendas`
  ADD CONSTRAINT `agendas_ibfk_1` FOREIGN KEY (`profissional_id`) REFERENCES `profissionais` (`id`),
  ADD CONSTRAINT `agendas_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);

--
-- Restrições para tabelas `historico_consultas`
--
ALTER TABLE `historico_consultas`
  ADD CONSTRAINT `historico_consultas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  ADD CONSTRAINT `historico_consultas_ibfk_2` FOREIGN KEY (`profissional_id`) REFERENCES `profissionais` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
