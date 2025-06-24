const express = require('express');
app.use(cors({
  origin: [
    'https://raspadinhapremiada.blog.br'
  ],
  methods: ['GET','POST'],
  credentials: true
}));
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== Início da configuração de middleware =====

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve os arquivos estáticos da pasta “public” mesmo em deploy no Render
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'raspadinha-premiada-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// ===== Fim da configuração de middleware =====

// Arquivo de configuração para armazenar CNPJ, WhatsApp e e-mail
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Função para carregar configurações
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE);
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  
  // Configuração padrão
  return {
    cnpj: '00.000.000/0001-00',
    whatsapp: '5511999999999',
    email: 'contato@raspadinha-premiada.com'
  };
}

// Função para salvar configurações
function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
}

// Middleware para verificar autenticação de admin
function isAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@raspadinha.com';
  
  if (req.session && req.session.user && req.session.user.email === adminEmail) {
    return next();
  }
  
  res.status(403).json({ error: 'Acesso negado. Permissões de administrador necessárias!' });
}

// Rotas para servir páginas HTML específicas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/responsabilidade', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'responsabilidade.html'));
});

app.get('/responsabilidade.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'responsabilidade.html'));
});

app.get('/termos', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'termos.html'));
});

app.get('/termos.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'termos.html'));
});

app.get('/privacidade', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacidade.html'));
});

app.get('/privacidade.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacidade.html'));
});

// API para obter configurações públicas (CNPJ, WhatsApp e e-mail)
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  res.json({
    cnpj: config.cnpj,
    whatsapp: config.whatsapp,
    email: config.email
  });
});

// API para autenticação (login)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  
  // Simulação de autenticação - em produção, verificaria contra banco de dados
  if (email && password) {
    // Verificar se é admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@raspadinha.com";
    const isAdminUser = email === adminEmail;
    
    req.session.user = {
      email: email,
      isAdmin: isAdminUser
    };

    // Simula a criação de um token JWT (apenas para o frontend)
    const tokenPayload = {
      user_id: Date.now(), // Simula um ID de usuário
      email: email,
      is_admin: isAdminUser,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira em 1 hora
    };
    const token = "simulated_jwt_token_for_" + email;

    res.json({
      success: true,
      token: token,
      user: {
        email: email,
        isAdmin: isAdminUser
      }
    });
  } else {
    res.status(400).json({ error: "Email e senha são obrigatórios" });
  }
});

// API para registro
app.post("/api/auth/register", (req, res) => {
  const { nome, email, telefone, password, referral_code_input } = req.body;

  if (!nome || !email || !telefone || !password) {
    return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
  }

  // Simulação de registro - em produção, salvaria no banco de dados
  // Aqui, apenas simulamos o sucesso e retornamos um token e dados de usuário
  const newUser = {
    id: Date.now(),
    nome: nome,
    email: email,
    telefone: telefone,
    referral_code: "USER" + Math.random().toString(36).substr(2, 9).toUpperCase(), // Simula código de indicação
    referral_count: 0,
    bonus_raspadinhas_available: 0,
    saldo: 0
  };

  // Simula a criação de um token JWT (apenas para o frontend)
  const tokenPayload = {
    user_id: newUser.id,
    email: newUser.email,
    is_admin: false,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expira em 1 hora
  };
  const token = "simulated_jwt." + Buffer.from(JSON.stringify(tokenPayload)).toString("base64") + ".signature";

  res.status(201).json({
    message: "Cadastro realizado com sucesso!",
    token: token,
    user: newUser
  });
});

// API para verificar status de autenticação
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// API para logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// API para obter configurações (admin)
app.get('/api/admin/config', isAdmin, (req, res) => {
  const config = loadConfig();
  res.json(config);
});

// API para atualizar configurações (admin)
app.post('/api/admin/config', isAdmin, (req, res) => {
  const { cnpj, whatsapp, email } = req.body;
  
  if (!cnpj || !whatsapp || !email) {
    return res.status(400).json({ error: 'CNPJ, WhatsApp e e-mail são obrigatórios' });
  }
  
  const config = loadConfig();
  config.cnpj = cnpj;
  config.whatsapp = whatsapp;
  config.email = email;
  
  if (saveConfig(config)) {
    res.json({ success: true, config });
  } else {
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// Rota para todas as outras requisições - redireciona para index.html para rotas da SPA
// O express.static já lida com arquivos estáticos como .html, .css, .js
app.get('*', (req, res) => {
  // Se a requisição não for para uma rota de API, serve o index.html para SPA routing
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // Para rotas de API não encontradas, retorna 404
    res.status(404).send('Não encontrado');
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Criar arquivo de configuração se não existir
  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig({
      cnpj: '00.000.000/0001-00',
      whatsapp: '5511999999999',
      email: 'contato@raspadinha-premiada.com'
    });
    console.log('Arquivo de configuração criado com valores padrão');
  }
});
