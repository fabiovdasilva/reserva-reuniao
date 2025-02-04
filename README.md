# Sistema de Reservas de Salas 

Sistema completo para gestão de reservas de salas de reunião com integração AD, calendário interativo e controle de permissões.

![image](https://github.com/user-attachments/assets/c549de82-9e35-48d1-8ace-298fde4bfe38)

![image](https://github.com/user-attachments/assets/c340554a-2464-458c-a287-f649f2cf0148)

![image](https://github.com/user-attachments/assets/ecfa963f-f171-47f8-8b4f-a9b275fdac9d)

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
