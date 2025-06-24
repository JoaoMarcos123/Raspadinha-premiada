# Raspadinha Premiada - Documentação

Este é um projeto Node.js/Express para a plataforma Raspadinha Premiada, otimizado para deploy no Railway.

## Estrutura do Projeto

```
raspadinha-premiada/
├── public/                  ← Arquivos visuais do site
│   ├── css/                 ← Estilos CSS
│   ├── js/                  ← Scripts JavaScript
│   ├── img/                 ← Imagens
│   ├── index.html           ← Página principal
│   ├── admin.html           ← Painel administrativo
│   └── responsabilidade.html ← Página de responsabilidade
├── server.js                ← Servidor Express
├── package.json             ← Configuração para Railway
└── .gitignore               ← Ignora arquivos desnecessários no Git
```

## Requisitos

- Node.js 14.0.0 ou superior
- NPM ou Yarn

## Instalação Local

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   npm start
   ```
4. Acesse http://localhost:3000

## Deploy no Railway

1. Crie uma conta no [Railway](https://railway.app/)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente:
   - `PORT`: Porta do servidor (opcional, padrão: 3000)
   - `SESSION_SECRET`: Chave secreta para sessões
   - `ADMIN_EMAIL`: Email do administrador

## Funcionalidades

### Navegação entre Páginas

O sistema suporta navegação completa entre todas as páginas:
- Página inicial: `/` ou `/index.html`
- Painel administrativo: `/admin` ou `/admin.html`
- Política de Responsabilidade: `/responsabilidade` ou `/responsabilidade.html`
- Termos de Uso: `/termos` ou `/termos.html`
- Política de Privacidade: `/privacidade` ou `/privacidade.html`

### Painel Administrativo

Para acessar o painel administrativo:
1. Configure a variável de ambiente `ADMIN_EMAIL` com seu email
2. Faça login com esse email
3. Acesse o painel administrativo pelo menu ou em `/admin.html`

### Configurações Editáveis

No painel administrativo, você pode editar:
- **CNPJ**: Exibido no rodapé do site
- **WhatsApp**: Número para contato (formato: 5511999999999)
- **E-mail**: Endereço de e-mail exibido no rodapé

Todas essas configurações são salvas automaticamente e exibidas no rodapé do site.

## Arquivos Principais

- `server.js`: Servidor Express com rotas e APIs
- `public/js/config.js`: Gerenciamento de configurações (CNPJ, WhatsApp e e-mail)
- `public/js/admin.js`: Funcionalidades do painel administrativo
- `public/admin.html`: Interface do painel administrativo

## APIs

- `GET /api/config`: Obter configurações públicas (CNPJ, WhatsApp e e-mail)
- `GET /api/admin/config`: Obter configurações (admin)
- `POST /api/admin/config`: Atualizar configurações (admin)
- `GET /api/auth/status`: Verificar status de autenticação
- `POST /api/auth/login`: Login
- `POST /api/auth/logout`: Logout
