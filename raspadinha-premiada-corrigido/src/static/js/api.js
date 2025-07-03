// API Client para comunicação com o backend

const API = {
    // Configurações base
    baseUrl: '/api',
    
    // Método genérico para requisições
    request: async function(endpoint, options = {}) {
        try {
            // Configurações padrão
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
                }
            };
            
            // Mesclar opções
            const requestOptions = { ...defaultOptions, ...options };
            
            // Converter body para JSON se for objeto
            if (requestOptions.body && typeof requestOptions.body === 'object') {
                requestOptions.body = JSON.stringify(requestOptions.body);
            }
            
            // Fazer requisição
            const response = await fetch(this.baseUrl + endpoint, requestOptions);
            
            // Verificar status
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }
            
            // Retornar dados
            return await response.json();
        } catch (error) {
            console.error(`Erro na requisição para ${endpoint}:`, error);
            throw error;
        }
    },

    // Métodos HTTP específicos
    get: function(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    post: function(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: data });
    },
    put: function(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: data });
    },
    delete: function(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },
    
    // API de autenticação
    auth: {
        // Login
        login: function(email, password) {
            return API.request("/auth/login", {
                method: 'POST',
                body: { email, password }
            });
        },
        
        // Registro
        register: function(userData) {
            return API.request("/auth/register", {
                method: 'POST',
                body: userData
            });
        },
        
        // Obter perfil
        getProfile: function() {
            return API.request("/auth/profile");
        },
        
        // Atualizar perfil
        updateProfile: function(userData) {
            return API.request("/auth/profile", {
                method: 'PUT',
                body: userData
            });
        },
        
        // Informações de indicação
        getReferralInfo: function() {
            return API.request("/auth/profile/referral-info");
        }
    },
    
    // API de jogos
    jogos: {
        // Novo jogo
        novoJogo: function(jogoData) {
            return API.request('/jogos/novo', {
                method: 'POST',
                body: jogoData
            });
        },
        
        // Histórico de jogos
        historico: function() {
            return API.request('/jogos/historico');
        },
        
        // Solicitar saque
        solicitarSaque: function(saqueData) {
            return API.request('/jogos/solicitar-saque', {
                method: 'POST',
                body: saqueData
            });
        },
        
        // Histórico de saques
        historicoSaques: function() {
            return API.request('/jogos/saques');
        }
    },
    
    // API de administração
    admin: {
        // Dashboard
        dashboard: function() {
            return API.request('/admin/dashboard');
        },
        
        // Usuários
        usuarios: function(page = 1, per_page = 20) {
            return API.request(`/admin/usuarios?page=${page}&per_page=${per_page}`);
        },
        
        // Jogos
        jogos: function(page = 1, per_page = 20, user_id = '', data_inicio = '', data_fim = '') {
            let url = `/admin/jogos?page=${page}&per_page=${per_page}`;
            if (user_id) url += `&user_id=${user_id}`;
            if (data_inicio) url += `&data_inicio=${data_inicio}`;
            if (data_fim) url += `&data_fim=${data_fim}`;
            return API.request(url);
        },
        
        // Saques
        saques: function(page = 1, per_page = 20, status = '') {
            let url = `/admin/saques?page=${page}&per_page=${per_page}`;
            if (status) url += `&status=${status}`;
            return API.request(url);
        },
        
        // Atualizar status do saque
        atualizarStatusSaque: function(saqueId, status) {
            return API.request(`/admin/saques/${saqueId}/status`, {
                method: 'PUT',
                body: { status }
            });
        },
        
        // Relatórios
        relatorios: {
            financeiro: function(data_inicio = '', data_fim = '') {
                let url = '/admin/relatorios/financeiro';
                const params = [];
                if (data_inicio) params.push(`data_inicio=${data_inicio}`);
                if (data_fim) params.push(`data_fim=${data_fim}`);
                if (params.length > 0) url += '?' + params.join('&');
                return API.request(url);
            }
        },
        
        // Configurações
        configuracoes: {
            get: function() {
                return API.request('/admin/configuracoes');
            },
            save: function(configData) {
                return API.request('/admin/configuracoes', {
                    method: 'POST',
                    body: configData
                });
            }
        },
        
        // Cupons de parceiros
        partnerCoupons: {
            list: function() {
                return API.request('/admin/partner-coupons');
            },
            create: function(couponData) {
                return API.request('/admin/partner-coupons', {
                    method: 'POST',
                    body: couponData
                });
            },
            toggle: function(couponId) {
                return API.request(`/admin/partner-coupons/${couponId}/toggle`, {
                    method: 'PUT'
                });
            },
            delete: function(couponId) {
                return API.request(`/admin/partner-coupons/${couponId}`, {
                    method: 'DELETE'
                });
            }
        },
        
        // Relatório de uso de cupons
        reportPartnerUsage: function() {
            return API.request('/admin/reports/partner-usage');
        }
    }
};

// Verificar se está em ambiente de desenvolvimento
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname.includes('127.0.0.1') ||
                     window.location.hostname.includes('192.168.');

// Simulação de API para ambiente de desenvolvimento
const APISimulator = {
    // Dados simulados
    users: [
        { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999', saldo: 150.50, data_cadastro: '2024-01-15 10:30:00', ultimo_login: '2024-01-20 14:22:00' },
        { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888', saldo: 75.25, data_cadastro: '2024-01-16 09:15:00', ultimo_login: '2024-01-19 16:45:00' }
    ],
    
    jogos: [
        { id: 1, user_id: 1, quantidade_raspadinhas: 3, valor_total: 15.00, premio_total: 25.00, data_jogo: '2024-01-20 14:30:00', origem_saldo: false, usou_bonus: false },
        { id: 2, user_id: 2, quantidade_raspadinhas: 2, valor_total: 10.00, premio_total: 0.00, data_jogo: '2024-01-19 16:50:00', origem_saldo: false, usou_bonus: false }
    ],
    
    saques: [
        { id: 1, user_id: 1, valor: 50.00, chave_pix: 'joao@email.com', status: 'pendente', data_solicitacao: '2024-01-20 15:00:00', data_processamento: null },
        { id: 2, user_id: 2, valor: 25.00, chave_pix: '11999999999', status: 'concluido', data_solicitacao: '2024-01-19 17:00:00', data_processamento: '2024-01-20 09:00:00' }
    ],
    
    // Interceptar chamadas fetch
    init: function() {
        if (!isDevelopment) return;
        
        console.log('API Simulator inicializado para ambiente de desenvolvimento');
        
        const originalFetch = window.fetch;
        window.fetch = async function(url, options) {
            // Verificar se é uma chamada para a API
            if (url.startsWith('/api')) {
                return APISimulator.handleRequest(url, options);
            }
            
            // Caso contrário, usar fetch original
            return originalFetch(url, options);
        };
    },
    
    // Manipular requisição
    handleRequest: async function(url, options) {
        console.log(`Simulando requisição para ${url}`, options);
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Extrair endpoint
        const endpoint = url.replace('/api', '');
        const method = options?.method || 'GET';
        
        try {
            // Roteamento de endpoints
            if (endpoint === '/health') {
                return this.createResponse({ status: 'ok', message: 'API Raspadinha Premiada funcionando!' });
            }
            
            // Auth endpoints
            if (endpoint === '/auth/login' && method === 'POST') {
                return this.simulateLogin(options);
            }
            if (endpoint === '/auth/register' && method === 'POST') {
                return this.simulateRegister(options);
            }
            if (endpoint === '/auth/profile' && method === 'GET') {
                return this.simulateGetProfile();
            }
            
            // Admin endpoints
            if (endpoint === '/admin/dashboard') {
                return this.simulateAdminDashboard();
            }
            if (endpoint.startsWith('/admin/usuarios')) {
                return this.simulateAdminUsuarios();
            }
            if (endpoint.startsWith('/admin/jogos')) {
                return this.simulateAdminJogos();
            }
            if (endpoint.startsWith('/admin/saques')) {
                return this.simulateAdminSaques();
            }
            
            // Endpoint não encontrado
            return this.createResponse({ error: 'Endpoint não encontrado' }, 404);
            
        } catch (error) {
            console.error('Erro no simulador:', error);
            return this.createResponse({ error: 'Erro interno do servidor' }, 500);
        }
    },
    
    // Criar resposta HTTP
    createResponse: function(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status: status,
            headers: { 'Content-Type': 'application/json' }
        });
    },
    
    // Simular login
    simulateLogin: function(options) {
        const body = JSON.parse(options.body);
        const { email, password } = body;
        
        if (email === 'admin@raspadinha.com' && password === 'admin123') {
            const token = 'fake-admin-token-' + Date.now();
            return this.createResponse({
                message: 'Login realizado com sucesso!',
                token: token,
                user: {
                    id: 999,
                    nome: 'Administrador',
                    email: 'admin@raspadinha.com',
                    telefone: '(11) 99999-9999',
                    saldo: 0,
                    data_cadastro: '2024-01-01 00:00:00',
                    ultimo_login: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }
            });
        }
        
        if (email === 'user@test.com' && password === '123456') {
            const token = 'fake-user-token-' + Date.now();
            return this.createResponse({
                message: 'Login realizado com sucesso!',
                token: token,
                user: this.users[0]
            });
        }
        
        return this.createResponse({ message: 'Email ou senha incorretos!' }, 401);
    },
    
    // Simular registro
    simulateRegister: function(options) {
        const body = JSON.parse(options.body);
        const newUser = {
            id: this.users.length + 1,
            nome: body.nome,
            email: body.email,
            telefone: body.telefone,
            saldo: 0,
            data_cadastro: new Date().toISOString().slice(0, 19).replace('T', ' '),
            ultimo_login: null,
            referral_code: 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase(),
            referral_count: 0,
            bonus_raspadinhas_available: 0
        };
        
        this.users.push(newUser);
        
        return this.createResponse({
            message: 'Usuário cadastrado com sucesso!',
            user: newUser
        }, 201);
    },
    
    // Simular obter perfil
    simulateGetProfile: function() {
        return this.createResponse({
            user: {
                ...this.users[0],
                referral_code: 'REF12345678',
                referral_count: 2,
                bonus_raspadinhas_available: 0
            }
        });
    },
    
    // Simular dashboard admin
    simulateAdminDashboard: function() {
        return this.createResponse({
            total_usuarios: this.users.length,
            total_jogos: this.jogos.length,
            total_arrecadado: 125.00,
            total_premios: 25.00,
            lucro: 100.00,
            margem_lucro: 80.0,
            saques_pendentes: 1,
            valor_saques_pendentes: 50.00,
            novos_usuarios_7d: 2,
            jogos_7d: 2,
            total_cupons_ativos: 3,
            total_cadastros_cupom: 15
        });
    },
    
    // Simular usuários admin
    simulateAdminUsuarios: function() {
        return this.createResponse({
            usuarios: this.users,
            total: this.users.length,
            pages: 1,
            current_page: 1
        });
    },
    
    // Simular jogos admin
    simulateAdminJogos: function() {
        return this.createResponse({
            jogos: this.jogos,
            total: this.jogos.length,
            pages: 1,
            current_page: 1
        });
    },
    
    // Simular saques admin
    simulateAdminSaques: function() {
        return this.createResponse({
            saques: this.saques,
            total: this.saques.length,
            pages: 1,
            current_page: 1
        });
    }
};

// Inicializar simulador se estiver em desenvolvimento
if (isDevelopment) {
    APISimulator.init();
}

