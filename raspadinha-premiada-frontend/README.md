# Raspadinha Premiada - Frontend

Frontend do projeto Raspadinha Premiada.

## Configuração

### Arquivo de Configuração

O arquivo `public/js/config.js` contém a configuração da API:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://raspadinha-premiada.onrender.com',
    // ...
};
```

Certifique-se de que a `BASE_URL` aponta para o seu backend no Render.

### Deploy no Vercel

1. Conecte este repositório ao Vercel
2. O Vercel detectará automaticamente que é um site estático
3. Configure o diretório de build como `public` (se necessário)
4. O site será deployado automaticamente

### Estrutura de Arquivos

```
public/
├── index.html          # Página principal
├── termos.html         # Termos de uso
├── privacidade.html    # Política de privacidade
├── js/
│   ├── config.js       # Configuração da API
│   ├── api.js          # Módulo de comunicação com API
│   ├── auth.js         # Módulo de autenticação
│   └── main.js         # Script principal
└── css/
    └── ...             # Arquivos de estilo
```

## Desenvolvimento Local

Para testar localmente, você pode usar qualquer servidor HTTP simples:

```bash
# Com Python
python -m http.server 8000

# Com Node.js (http-server)
npx http-server public

# Com PHP
php -S localhost:8000 -t public
```

O site estará disponível em http://localhost:8000

## Configuração da API

O frontend está configurado para se comunicar com a API no Render. Se você precisar alterar a URL da API, edite o arquivo `public/js/config.js`.
