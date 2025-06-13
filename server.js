const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'raspadinha-premiada-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

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
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simulação de autenticação - em produção, verificaria contra banco de dados
  if (email && password) {
    // Verificar se é admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@raspadinha.com';
    const isAdminUser = email === adminEmail;
    
    req.session.user = {
      email: email,
      isAdmin: isAdminUser
    };
    
    res.json({
      success: true,
      user: {
        email: email,
        isAdmin: isAdminUser
      }
    });
  } else {
    res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
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

// Rota para todas as outras requisições - redireciona para index.html apenas para rotas da SPA
// Isso permite que as rotas de API e arquivos estáticos funcionem normalmente
app.get('*', (req, res) => {
  // Verificar se é uma rota de API ou arquivo estático
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    // Deixar o Express continuar com o próximo middleware
    res.status(404).send('Não encontrado');
  } else {
    // Para rotas da SPA, enviar o index.html
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
