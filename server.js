const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();

// CORS apenas para seu domínio
app.use(cors({
  origin: [
    'https://raspadinhapremiada.blog.br',
    'https://www.raspadinhapremiada.blog.br'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'raspadinha-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ===== CONFIG LOCAL =====
const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    const data = fs.readFileSync(CONFIG_FILE);
    return JSON.parse(data);
  }
  return {
    cnpj: "00.000.000/0001-00",
    whatsapp: "559999999999",
    email: "contato@raspadinha.com"
  };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

if (!fs.existsSync(CONFIG_FILE)) {
  saveConfig(loadConfig());
}

// ===== MIDDLEWARE ADMIN =====
function isAdmin(req, res, next) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@raspadinha.com';
  if (req.session?.user?.email === adminEmail) {
    return next();
  }
  return res.status(403).json({ error: 'Acesso negado. Admin necessário.' });
}

// ===== ROTAS FRONTEND =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ===== API - CONFIGURAÇÃO PÚBLICA =====
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

// ===== API - AUTENTICAÇÃO =====
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }

  const isAdminUser = email === (process.env.ADMIN_EMAIL || 'admin@raspadinha.com');
  req.session.user = { email, isAdmin: isAdminUser };

  const token = "fake_token_" + Date.now();
  res.json({ token, user: { email, isAdmin: isAdminUser } });
});

app.post('/api/auth/register', (req, res) => {
  const { nome, email, telefone, password } = req.body;
  if (!nome || !email || !telefone || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const user = {
    nome,
    email,
    telefone,
    saldo: 0,
    referral_code: "USER" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    bonus_raspadinhas_available: 0
  };

  const token = "fake_token_" + Date.now();
  res.status(201).json({ token, user });
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

// ===== API - PERFIL (simulado) =====
app.get('/api/auth/profile', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  res.json({ user: { nome: 'Usuário', email: req.session.user.email, telefone: '55999999999', saldo: 0 } });
});

app.put('/api/auth/profile', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const { nome, telefone } = req.body;
  res.json({ message: 'Perfil atualizado', user: { nome, telefone, email: req.session.user.email } });
});

// ===== API - CONFIG ADMIN =====
app.get('/api/admin/config', isAdmin, (req, res) => {
  res.json(loadConfig());
});

app.post('/api/admin/config', isAdmin, (req, res) => {
  const { cnpj, whatsapp, email } = req.body;
  if (!cnpj || !whatsapp || !email) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const config = { cnpj, whatsapp, email };
  saveConfig(config);
  res.json({ success: true, config });
});

// ===== ROTA FINAL (SPA) =====
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('API não encontrada');
  }
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
