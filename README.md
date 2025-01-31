# Sistema de Reservas de Salas - PROELT

Sistema completo para gestão de reservas de salas de reunião com integração AD, calendário interativo e controle de permissões.

![Screenshot do Sistema](screenshot.png)

## ⚙️ Funcionalidades Principais

- Autenticação via LDAP ou usuário local
- Calendário visual por sala
- Controle de conflitos de horários
- Gestão de salas (admin)
- Cancelamento de reservas
- Design responsivo
- Sistema de cores por empresa
- Modais interativos

## 📋 Pré-requisitos

- Servidor web (XAMPP/WAMP/MAMP)
- PHP 8.0+
- MySQL 5.7+
- Composer (para dependências)
- Acesso a servidor LDAP (opcional)

## 🚀 Instalação Passo a Passo

Banco de dados
SQL
CREATE DATABASE proelt_db;
USE proelt_db;
SOURCE database/proelt_db.sql;


👥 Credenciais de Teste
Admin Local:
Usuário: admin
Senha: *******

Usuário LDAP:
Utilize suas credenciais corporativas

🖥️ Tecnologias Utilizadas
PHP 8
MySQL
JavaScript (ES6+)
FullCalendar
LDAP
HTML5/CSS3

📚 Estrutura de Arquivos
proelt-reservas/
├── api/           # Endpoints REST
├── assets/        # CSS/JS/Imagens
├── includes/      # Classes core
├── database/      # Esquema SQL
├── docs/          # Documentação
└── index.php      # Entrada principal
