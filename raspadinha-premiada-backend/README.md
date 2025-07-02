# Raspadinha Premiada - Backend API

Backend API para o projeto Raspadinha Premiada.

## Configuração

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Render:

- `ADMIN_EMAIL`: Email do administrador (ex: admin@raspadinha.com)
- `SESSION_SECRET`: Chave secreta para sessões (ex: sua-chave-secreta-aqui)
- `NODE_ENV`: production

### Deploy no Render

1. Conecte este repositório ao Render
2. Configure as variáveis de ambiente
3. O Render detectará automaticamente que é um projeto Node.js
4. O comando de start será: `npm start`

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `GET /api/auth/status` - Status de autenticação
- `POST /api/auth/logout` - Logout

### Configurações
- `GET /api/config` - Configurações públicas
- `GET /api/admin/config` - Configurações admin (requer auth)
- `POST /api/admin/config` - Atualizar configurações (requer auth)

### Utilitários
- `GET /api/health` - Health check da API

## Desenvolvimento Local

```bash
npm install
npm run dev
```

A API estará disponível em http://localhost:3000
