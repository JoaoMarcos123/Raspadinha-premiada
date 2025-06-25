const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();

// ===== CORS =====
const allowedOrigins = [
  'https://raspadinhapremiada.blog.br',
  'https://www.raspadinhapremiada.blog.br'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// ===== Middleware =====
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'raspadinha-premiada-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// ===== Configuração inicial =====
const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE);
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }

  return {
    cnpj: '00.000.000/0001-00',
    whatsapp: '5511999999999',
    email: 'contato@raspadinha-premiada.com'
  };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
}

function isAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@raspadinha.com';
  if (req.session?.user?.email === adminEmail) {
    return next();
  }
  res.status(403).json({ error: 'Acesso negado. Permissões de administrador necessárias!' });
}

// ===== Rotas HTML =====
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/responsabilidade', (req, res) => res.sendFile(path.join(__dirname, 'public', 'responsabilidade.html')));
app.get('/responsabilidade.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'responsabilidade.html')));
app.get('/termos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'termos.html')));
app.get('/termos.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'termos.html')));
app.get('/privacidade', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacidade.html')));
app.get('/privacidade.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacidade.html')));

// ===== APIs Públicas =====
app.get('/api/config', (req, res) => {
  const config = loadConfig();
  res.json({ cnpj: config.cnpj, whatsapp: config.whatsapp, email: config.email });
});

// ===== Autenticação =====
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@raspadinha.com";
  const isAdminUser = email === adminEmail;

  req.session.user = { email, isAdmin: isAdminUser };

  const token = "simulated_jwt_token_for_" + email;

  res.json({
    success: true,
    token,
    user: { email, isAdmin: isAdminUser }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { nome, email, telefone, password, referral_code_input } = req.body;
  if (!nome || !email || !telefone || !password) {
    return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
  }

  const newUser = {
    id: Date.now(),
    nome,
    email,
    telefone,
    referral_code: "USER" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    referral_count: 0,
    bonus_raspadinhas_available: 0,
    saldo: 0
  };

  const tokenPayload = {
    user_id: newUser.id,
    email: newUser.email,
    is_admin: false,
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  };
  const token = "simulated_jwt." + Buffer.from(JSON.stringify(tokenPayload)).toString("base64") + ".signature";

  res.status(201).json({ message: "Cadastro realizado com sucesso!", token, user: newUser });
});

app.get('/api/auth/status', (req, res) => {
  if (req.session?.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ===== APIs Admin =====
app.get('/api/admin/config', isAdmin, (req, res) => {
  const config = loadConfig();
  res.json(config);
});

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

// ===== SPA Routing fallback =====
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('Não encontrado');
  }
});

// ===== Start server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// ===== Cria config.json se não existir =====
if (!fs.existsSync(CONFIG_FILE)) {
  saveConfig({
    cnpj: '00.000.000/0001-00',
    whatsapp: '5527998349634',
    email: 'contato@raspadinha-premiada.com'
  });
  console.log('Arquivo de configuração criado com valores padrão');
}
