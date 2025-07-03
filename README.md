# Raspadinha Premiada

Sistema completo de raspadinhas online com backend Flask e frontend HTML/CSS/JavaScript.

## 🚀 Deploy Rápido

### 1. Backend no Render

1. **Conecte seu repositório GitHub ao Render**
2. **Configure as variáveis de ambiente:**
   ```
   FLASK_ENV=production
   SECRET_KEY=sua-chave-secreta-super-segura
   DATABASE_URL=sua-url-do-supabase
   ADMIN_EMAIL=admin@seudominio.com
   PORT=5000
   ```
3. **O Render usará automaticamente o arquivo `render.yaml`**

### 2. Banco de Dados no Supabase

1. **Crie um projeto no Supabase**
2. **Copie a URL de conexão PostgreSQL**
3. **Execute o script de inicialização:**
   ```bash
   python init_db.py
   ```

### 3. Frontend no Vercel

1. **Conecte seu repositório GitHub ao Vercel**
2. **Configure a variável de ambiente:**
   ```
   NEXT_PUBLIC_API_URL=https://seu-backend.onrender.com
   ```
3. **Atualize o arquivo `vercel.json` com a URL do seu backend**

## 📁 Estrutura do Projeto

```
raspadinha-premiada/
├── src/
│   ├── models/
│   │   └── user.py              # Modelos do banco de dados
│   ├── routes/
│   │   ├── auth.py              # Rotas de autenticação
│   │   ├── jogos.py             # Rotas de jogos e saques
│   │   └── admin.py             # Rotas administrativas
│   ├── static/                  # Frontend (HTML, CSS, JS)
│   │   ├── index.html           # Página principal
│   │   ├── css/                 # Estilos
│   │   └── js/                  # Scripts JavaScript
│   └── main.py                  # Aplicação Flask principal
├── requirements.txt             # Dependências Python
├── render.yaml                  # Configuração do Render
├── vercel.json                  # Configuração do Vercel
├── init_db.py                   # Script de inicialização do BD
└── .env.example                 # Exemplo de variáveis de ambiente
```

## 🔧 Configuração Local

### Pré-requisitos
- Python 3.8+
- PostgreSQL (ou Supabase)

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/raspadinha-premiada.git
   cd raspadinha-premiada
   ```

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Inicialize o banco de dados:**
   ```bash
   python init_db.py
   ```

5. **Execute a aplicação:**
   ```bash
   python src/main.py
   ```

## 🎮 Funcionalidades

### Para Usuários
- ✅ Cadastro e login
- ✅ Compra de raspadinhas
- ✅ Sistema de indicação (ganhe bônus)
- ✅ Histórico de jogos
- ✅ Solicitação de saques via PIX
- ✅ Perfil do usuário

### Para Administradores
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de usuários
- ✅ Controle de saques
- ✅ Relatórios financeiros
- ✅ Cupons de parceiros
- ✅ Configurações do sistema

## 🔐 Segurança

- Autenticação JWT
- Senhas criptografadas
- CORS configurado
- Validação de dados
- Proteção contra SQL injection

## 💳 Pagamentos

O sistema está preparado para integração com:
- PIX (InfinityPay ou similar)
- Cartão de crédito
- Saldo interno

## 📊 Banco de Dados

### Tabelas Principais
- `users` - Usuários do sistema
- `jogos` - Histórico de jogos
- `raspadinhas` - Detalhes das raspadinhas
- `saques` - Solicitações de saque
- `partner_coupons` - Cupons de parceiros
- `configuracoes` - Configurações do sistema

## 🚀 Deploy em Produção

### Render (Backend)
1. Conecte o repositório
2. Configure as variáveis de ambiente
3. O deploy é automático

### Vercel (Frontend)
1. Conecte o repositório
2. Configure a URL da API
3. Deploy automático

### Supabase (Banco)
1. Crie o projeto
2. Execute `init_db.py`
3. Configure a URL no backend

## 🔧 Configurações Importantes

### Variáveis de Ambiente Obrigatórias
```env
DATABASE_URL=postgresql://...
SECRET_KEY=chave-super-secreta
ADMIN_EMAIL=admin@seudominio.com
```

### Configurações do Sistema
Acesse o painel admin para configurar:
- Valor da raspadinha
- Valor mínimo de saque
- Chaves de pagamento
- Ativação de métodos de pagamento

## 📞 Suporte

- Email: contato@raspadinha-premiada.com
- WhatsApp: (11) 99999-9999

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

---

**⚠️ Importante:** Altere todas as senhas padrão antes de colocar em produção!

