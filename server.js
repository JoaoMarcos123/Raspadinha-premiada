const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');

const app = express();

// Habilita CORS apenas para seu domínio
app.use(cors({
  origin: [
    'https://raspadinhapremiada.blog.br',
    'https://www.raspadinhapremiada.blog.br'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configura middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve arquivos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'raspadinha-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Arquivo config
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

// Rotas frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API pública para mostrar dados
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

// Rota fallback para SPA
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
