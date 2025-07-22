# API de Controle Financeiro Pessoal

Olá! Esta é uma API completa para gerenciamento de finanças pessoais, com autenticação de usuários e controle de gastos, receitas, metas e categorias.

## ✨ Features

- **🔐 Autenticação Segura**: JWT com tempo de expiração
- **📊 Gestão Financeira Completa**:
  - 💸 Gastos: Registrar, editar e categorizar despesas
  - 💰 Receitas: Controlar ganhos e rendimentos
  - 🎯 Metas: Definir objetivos financeiros
  - 🏷️ Categorias: Organizar por tipos de transação
- **📈 Relatórios Detalhados**:
  - Mensal por categoria
  - Comparativo por período
  - Dashboard resumido
- **📚 Documentação Swagger**: Integrada e fácil de usar

## 🛠 Tecnologias utilizadas

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework para construção da API
- **MySQL2**: Conexão com banco de dados MySQL
- **JWT**: Autenticação segura com tokens
- **BCryptJS**: Criptografia de senhas
- **Swagger UI**: Documentação interativa da API
- **Helmet**: Segurança para aplicações Express
- **Rate Limiting**: Proteção contra abuso da API

## 🚀 Como executar

### Pré-requisitos
- Node.js (v16 ou superior)
- MySQL (5.7 ou superior)
- Yarn ou npm

### Configuração inicial

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/finance-api.git
   cd finance-api

 2. **Instale as dependências**:
   ```bash
   npm install
     # ou
   yarn install

3. **Configure o banco de dados**:
   Crie um arquivo .env baseado no .env.example:

4. **Inicialize o banco de dados**:
   ```bash
   npm run initdb

5. **Execute a aplicaçã**:
   ```bash
   Modo desenvolvimento (com nodemon):
   npm run dev
   Modo produção:
   npm start

6. **📚 Documentação da API**:
   Acesse a documentação interativa no seu navegador após iniciar o servidor:
   http://localhost:3000/api-docs
   Para testes rápidos, utilize as seguintes credenciais:
   Email: demo@email.com
   Senha: 123456

7. **🤝 Contribuição**:
   Contribuições são bem-vindas! Siga estes passos:
   Faça um fork do projeto
   Crie uma branch para sua feature (git checkout -b feature/incrivel)
   Commit suas mudanças (git commit -m 'Adiciona feature incrível')
   Push para a branch (git push origin feature/incrivel)
   Abra um Pull Request

Desenvolvido com ❤️ por Vitor Hugo 