# 🚀 Instruções de Deploy - Raspadinha Premiada

## ✅ Status do Projeto
- ✅ Backend corrigido e funcionando
- ✅ Frontend corrigido e funcionando  
- ✅ Integração com Supabase configurada
- ✅ Arquivos de deploy criados
- ✅ Testado localmente com sucesso

## 📋 Pré-requisitos

### 1. Contas Necessárias
- [x] GitHub (para versionamento)
- [x] Render (para backend)
- [x] Vercel (para frontend)
- [x] Supabase (para banco de dados)

## 🗄️ 1. Configurar Banco de Dados (Supabase)

### Passo 1: Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha um nome: `raspadinha-premiada`
4. Defina uma senha forte para o banco
5. Escolha a região mais próxima

### Passo 2: Obter URL de Conexão
1. No painel do Supabase, vá em "Settings" > "Database"
2. Copie a "Connection string" no formato:
   ```
   postgresql://postgres:[SUA-SENHA]@[HOST]:[PORTA]/postgres
   ```

### Passo 3: Inicializar Banco
1. Clone este repositório localmente
2. Configure a variável `DATABASE_URL` com a URL do Supabase
3. Execute: `python init_db.py`

## 🖥️ 2. Deploy do Backend (Render)

### Passo 1: Conectar Repositório
1. Acesse [render.com](https://render.com)
2. Clique em "New" > "Web Service"
3. Conecte seu repositório GitHub
4. Escolha o repositório `raspadinha-premiada`

### Passo 2: Configurar Deploy
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT src.main:app`
- **Environment**: `Python 3`
- **Root Directory**: `.` (Isso é importante para o Render identificar o projeto Python corretamente)

### Passo 3: Variáveis de Ambiente
Configure estas variáveis no Render:
```env
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta-super-forte-aqui
DATABASE_URL=postgresql://postgres:[SENHA]@[HOST]:[PORTA]/postgres
ADMIN_EMAIL=admin@seudominio.com
PORT=5000
```

### Passo 4: Deploy
1. Clique em "Create Web Service"
2. Aguarde o deploy (5-10 minutos)
3. Anote a URL gerada (ex: `https://raspadinha-premiada.onrender.com`)

## 🌐 3. Deploy do Frontend (Vercel)

### Passo 1: Preparar Arquivos
1. Edite o arquivo `vercel.json`
2. Substitua `https://seu-backend.onrender.com` pela URL real do Render

### Passo 2: Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `src/static`

### Passo 3: Variáveis de Ambiente
Configure no Vercel:
```env
NEXT_PUBLIC_API_URL=https://sua-url-do-render.onrender.com
```

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o deploy (2-5 minutos)
3. Anote a URL gerada (ex: `https://raspadinha-premiada.vercel.app`)

## 🔧 4. Configurações Finais

### Atualizar URLs no Frontend
1. Edite `src/static/js/api.js`
2. Na linha que define `baseUrl`, substitua por:
   ```javascript
   baseUrl: 'https://sua-url-do-render.onrender.com/api'
   ```

### Testar Integração
1. Acesse a URL do Vercel
2. Teste o cadastro de usuário
3. Teste o login
4. Verifique se a API está respondendo

## 👨‍💼 5. Acesso Administrativo

### Login Padrão
- **Email**: admin@raspadinha.com (configurável)
- **Senha**: admin123

### ⚠️ IMPORTANTE: Alterar Senha
1. Faça login no painel admin
2. Vá em "Meu Perfil"
3. Altere a senha padrão imediatamente

## 🔍 6. Verificações de Funcionamento

### Backend (Render)
- [ ] `https://sua-url.onrender.com/api/health` retorna status OK
- [ ] Logs não mostram erros críticos
- [ ] Banco de dados conectado

### Frontend (Vercel)
- [ ] Página principal carrega
- [ ] Formulários de login/cadastro funcionam
- [ ] Não há erros no console do navegador

### Integração
- [ ] Cadastro de usuário funciona
- [ ] Login funciona
- [ ] Painel admin acessível

## 🛠️ 7. Solução de Problemas

### Erro de CORS
Se aparecer erro de CORS, verifique:
1. `Flask-CORS` está instalado
2. `CORS(app, origins="*")` está no `main.py`

### Erro de Banco
Se houver erro de conexão:
1. Verifique a `DATABASE_URL`
2. Confirme que o Supabase está ativo
3. Execute `init_db.py` novamente

### Erro 404 no Frontend
Se páginas não carregarem:
1. Verifique o `vercel.json`
2. Confirme que os arquivos estão em `src/static`

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do Render
2. Verifique o console do navegador
3. Teste as URLs da API diretamente

## 🎉 Pronto!

Após seguir todos os passos, seu sistema estará funcionando em:
- **Frontend**: https://sua-url.vercel.app
- **Backend**: https://sua-url.onrender.com
- **Admin**: https://sua-url.vercel.app (login com credenciais admin)

---

**Última atualização**: 03/07/2025
**Versão**: 1.0.0

