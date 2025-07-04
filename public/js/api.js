// API Client para comunicação com o backend

const apiModule = {
    // Configurações base (corrigido para apontar para o backend na Render)
    baseUrl: 'https://raspadinha-premiada.onrender.com/api',

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
    
        login: function(email, password) {
    return apiModule.request("/api/auth/login", {
        method: 'POST',
        body: { email, password }
    });
},

register: function(userData) {
    return apiModule.request("/api/auth/register", {
        method: 'POST',
        body: userData
    });
},
        verify: function() {
            return apiModule.request("/auth/verify");
        },
        updateProfile: function(userData) {
            return apiModule.request("/auth/profile", {
                method: 'PUT',
                body: userData
            });
        }
    },
    
    // API de jogos
    jogos: {
        novoJogo: function(jogoData) {
            return apiModule.request('/jogos/novo', {
                method: 'POST',
                body: jogoData
            });
        },
        historico: function() {
            return apiModule.request('/jogos/historico');
        },
        solicitarSaque: function(saqueData) {
            return apiModule.request('/jogos/saque', {
                method: 'POST',
                body: saqueData
            });
        },
        historicoSaques: function() {
            return apiModule.request('/jogos/saques');
        },
        gerarPix: function(pixData) {
            return apiModule.request('/jogos/gerar-pix', {
                method: 'POST',
                body: pixData
            });
        },
        verificarPagamento: function(pagamentoId) {
            return apiModule.request(`/jogos/verificar-pagamento/${pagamentoId}`);
        }
    },
    
    // API de administração
    admin: {
        dashboard: function() {
            return apiModule.request('/admin/dashboard');
        },
        usuarios: function(page = 1, filter = '') {
            return apiModule.request(`/admin/usuarios?page=${page}&filter=${filter}`);
        },
        jogos: function(page = 1, dataInicio = '', dataFim = '', usuarioId = '') {
            return apiModule.request(`/admin/jogos?page=${page}&data_inicio=${dataInicio}&data_fim=${dataFim}&usuario_id=${usuarioId}`);
        },
        saques: function(page = 1, status = '') {
            return apiModule.request(`/admin/saques?page=${page}&status=${status}`);
        },
        processarSaque: function(saqueId, status) {
            return apiModule.request(`/admin/saques/${saqueId}/processar`, {
                method: 'PUT',
                body: { status }
            });
        },
        relatorios: {
            financeiro: function(dataInicio = '', dataFim = '') {
                return apiModule.request(`/admin/relatorios/financeiro?data_inicio=${dataInicio}&data_fim=${dataFim}`);
            }
        },
        configuracoes: {
            get: function() {
                return apiModule.request('/admin/configuracoes');
            },
            update: function(configData) {
                return apiModule.request('/admin/configuracoes', {
                    method: 'PUT',
                    body: configData
                });
            }
        }
    },
    
    // API de integração com InfinityPay
    infinityPay: {
        gerarPix: function(valor, descricao) {
            return apiModule.request('/infinity-pay/gerar-pix', {
                method: 'POST',
                body: { valor, descricao }
            });
        },
        verificarPagamento: function(transacaoId) {
            return apiModule.request(`/infinity-pay/verificar/${transacaoId}`);
        },
        simularPagamento: function(transacaoId) {
            return apiModule.request(`/infinity-pay/simular-pagamento/${transacaoId}`, {
                method: 'POST'
            });
        }
    }
};
