// API Client para comunicação com o backend

const apiModule = {
    // Configurações base
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

            // Retornar dados (mesmo se resposta for vazia)
            return await response.json().catch(() => ({}));
        } catch (error) {
            console.error(`Erro na requisição para ${endpoint}:`, error);
            throw error;
        }
    },

    // Métodos HTTP específicos
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },
    post(endpoint, data) {
        return this.request(endpoint, { method: 'POST', body: data });
    },
    put(endpoint, data) {
        return this.request(endpoint, { method: 'PUT', body: data });
    },
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // API de autenticação
    auth: {
        login(email, password) {
            return apiModule.request("/auth/login", {
                method: 'POST',
                body: { email, password }
            });
        },
        register(userData) {
            return apiModule.request("/auth/register", {
                method: 'POST',
                body: userData
            });
        },
        verify() {
            return apiModule.request("/auth/verify");
        },
        updateProfile(userData) {
            return apiModule.request("/auth/profile", {
                method: 'PUT',
                body: userData
            });
        }
    },

    // API de jogos
    jogos: {
        novoJogo(jogoData) {
            return apiModule.request('/jogos/novo', {
                method: 'POST',
                body: jogoData
            });
        },
        historico() {
            return apiModule.request('/jogos/historico');
        },
        solicitarSaque(saqueData) {
            return apiModule.request('/jogos/saque', {
                method: 'POST',
                body: saqueData
            });
        },
        historicoSaques() {
            return apiModule.request('/jogos/saques');
        },
        gerarPix(pixData) {
            return apiModule.request('/jogos/gerar-pix', {
                method: 'POST',
                body: pixData
            });
        },
        verificarPagamento(pagamentoId) {
            return apiModule.request(`/jogos/verificar-pagamento/${pagamentoId}`);
        }
    },

    // API de administração
    admin: {
        dashboard() {
            return apiModule.request('/admin/dashboard');
        },
        usuarios(page = 1, filter = '') {
            return apiModule.request(`/admin/usuarios?page=${page}&filter=${filter}`);
        },
        jogos(page = 1, dataInicio = '', dataFim = '', usuarioId = '') {
            return apiModule.request(`/admin/jogos?page=${page}&data_inicio=${dataInicio}&data_fim=${dataFim}&usuario_id=${usuarioId}`);
        },
        saques(page = 1, status = '') {
            return apiModule.request(`/admin/saques?page=${page}&status=${status}`);
        },
        processarSaque(saqueId, status) {
            return apiModule.request(`/admin/saques/${saqueId}/processar`, {
                method: 'PUT',
                body: { status }
            });
        },
        relatorios: {
            financeiro(dataInicio = '', dataFim = '') {
                return apiModule.request(`/admin/relatorios/financeiro?data_inicio=${dataInicio}&data_fim=${dataFim}`);
            }
        },
        configuracoes: {
            get() {
                return apiModule.request('/admin/configuracoes');
            },
            update(configData) {
                return apiModule.request('/admin/configuracoes', {
                    method: 'PUT',
                    body: configData
                });
            }
        }
    },

    // API de integração com InfinityPay
    infinityPay: {
        gerarPix(valor, descricao) {
            return apiModule.request('/infinity-pay/gerar-pix', {
                method: 'POST',
                body: { valor, descricao }
            });
        },
        verificarPagamento(transacaoId) {
            return apiModule.request(`/infinity-pay/verificar/${transacaoId}`);
        },
        simularPagamento(transacaoId) {
            return apiModule.request(`/infinity-pay/simular-pagamento/${transacaoId}`, {
                method: 'POST'
            });
        }
    }
};
