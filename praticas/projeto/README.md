# App de Gestão Financeira

Uma aplicação completa para controle e gestão financeira pessoal. O projeto é composto por um aplicativo móvel (Frontend) moderno e responsivo integrado a uma API REST (Backend) segura com persistência de dados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React Native, Expo (v55+)
- **Backend:** Node.js (v24+), Express, Prisma ORM
- **Banco de Dados:** MySQL

---

## 🚀 Funcionalidades Principais

### Frontend (Mobile)

- **Validação de Acesso:** Tela de login para acessar o aplicativo.
- **Dashboard Interativo:** Gráficos de pizza para resumo de despesas e mensagem de boas-vindas personalizada.
- **Filtros Inteligentes:** Seleção de mês e ano (`MonthYearFilter`) para listagens e resumos.
- **Gestão de Transações:** Criação, edição e exclusão de transações (com acionamento por clique longo).
- **Categorias Customizadas:** Grid interativo utilizando ícones do Material Icons.

### Backend (API REST)

- **Isolamento de Dados:** Filtros por usuário via middleware, garantindo que cada conta acesse apenas seus próprios dados.
- **Banco de Dados Populado:** Script de Seed para criar automaticamente as 5 categorias padrão do sistema (bloqueadas contra exclusão).

---

## ⚙️ Como Configurar e Rodar o Projeto

### Pré-requisitos

- Node.js instalado (v24 ou superior)
- Servidor MySQL ativo rodando na porta padrão (`3306`)

---

### Passo 1: Preparar o Banco de Dados

Antes de iniciar a API, crie uma database vazia no MySQL:

```sql
CREATE DATABASE gestao_financeira
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

### Passo 2: Configurar o Backend (API)

1. Acesse a pasta do backend:

```bash
cd praticas/projeto/gestao-financeira-api
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

- Copie o arquivo `.env.example` e renomeie para `.env`.
- Ajuste a variável `DATABASE_URL` com suas credenciais:

```env
DATABASE_URL="mysql://root:suasenha@localhost:3306/gestao_financeira"
```

4. Aplique o schema do banco e popule as categorias iniciais:

```bash
npx prisma db push
npm run prisma:seed
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A API será executada, por padrão, na porta **3000**.

---

### Passo 3: Configurar o Frontend (Aplicativo)

1. Abra um novo terminal e acesse a pasta do aplicativo:

```bash
cd praticas/projeto/gestao-financeira
```

2. Instale as dependências:

```bash
npm install
```

3. (Opcional) Caso precise definir manualmente a URL da API, crie um arquivo `.env`:

```env
EXPO_PUBLIC_API_URL=http://<SEU_IP>:3000
```

4. Inicie o servidor do Expo:

```bash
npx expo start --clear
```

5. Para testar:

- Pressione `a` para abrir no Emulador Android.
- Pressione `i` para abrir no Simulador iOS.
- Ou escaneie o QR Code usando o aplicativo Expo Go.

---

## 🧪 Testando a API com o Postman

Uma collection pronta foi incluída no projeto para facilitar a validação das rotas do backend.

### Como Importar e Utilizar

1. Abra o Postman.
2. Clique em **Import**.
3. Selecione o arquivo:

```text
gestao-financeira-api/postman/collection.json
```

ou

```text
api.postman_collection.json
```

---

### Resumo dos Endpoints Disponíveis

#### Health Check

```http
GET {{baseUrl}}/
```

#### Categorias

```http
GET    {{baseUrl}}/categories
POST   {{baseUrl}}/categories
PUT    {{baseUrl}}/categories/:id
DELETE {{baseUrl}}/categories/:id
```

#### Transações

```http
GET    {{baseUrl}}/transactions
POST   {{baseUrl}}/transactions
PUT    {{baseUrl}}/transactions/:id
DELETE {{baseUrl}}/transactions/:id
```

---

## 💡 Dicas e Solução de Problemas

### Erro de Conexão com o Banco

Certifique-se de que o serviço MySQL está em execução.

#### Windows

1. Pressione `Win + R`.
2. Digite:

```text
services.msc
```

3. Localize o serviço MySQL.
4. Clique com o botão direito.
5. Selecione **Iniciar**.
