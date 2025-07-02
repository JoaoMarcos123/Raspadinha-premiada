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
    
    // API de autenticação
    auth: {
        // Login
        login: function(email, password) {
            return API.request('/auth/login', {
                method: 'POST',
                body: { email, password }
            });
        },
        
        // Registro
        register: function(userData) {
            return API.request('/auth/register', {
                method: 'POST',
                body: userData
            });
        },
        
        // Verificar token
        verify: function() {
            return API.request('/auth/verify');
        },
        
        // Atualizar perfil
        updateProfile: function(userData) {
            return API.request('/auth/profile', {
                method: 'PUT',
                body: userData
            });
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
            return API.request('/jogos/saque', {
                method: 'POST',
                body: saqueData
            });
        },
        
        // Histórico de saques
        historicoSaques: function() {
            return API.request('/jogos/saques');
        },
        
        // Gerar QR Code PIX
        gerarPix: function(pixData) {
            return API.request('/jogos/gerar-pix', {
                method: 'POST',
                body: pixData
            });
        },
        
        // Verificar status de pagamento
        verificarPagamento: function(pagamentoId) {
            return API.request(`/jogos/verificar-pagamento/${pagamentoId}`);
        }
    },
    
    // API de administração
    admin: {
        // Dashboard
        dashboard: function() {
            return API.request('/admin/dashboard');
        },
        
        // Usuários
        usuarios: function(page = 1, filter = '') {
            return API.request(`/admin/usuarios?page=${page}&filter=${filter}`);
        },
        
        // Jogos
        jogos: function(page = 1, dataInicio = '', dataFim = '', usuarioId = '') {
            return API.request(`/admin/jogos?page=${page}&data_inicio=${dataInicio}&data_fim=${dataFim}&usuario_id=${usuarioId}`);
        },
        
        // Saques
        saques: function(page = 1, status = '') {
            return API.request(`/admin/saques?page=${page}&status=${status}`);
        },
        
        // Processar saque
        processarSaque: function(saqueId, status) {
            return API.request(`/admin/saques/${saqueId}/processar`, {
                method: 'PUT',
                body: { status }
            });
        },
        
        // Relatórios
        relatorios: {
            financeiro: function(dataInicio = '', dataFim = '') {
                return API.request(`/admin/relatorios/financeiro?data_inicio=${dataInicio}&data_fim=${dataFim}`);
            }
        },
        
        // Configurações
        configuracoes: {
            get: function() {
                return API.request('/admin/configuracoes');
            },
            update: function(configData) {
                return API.request('/admin/configuracoes', {
                    method: 'PUT',
                    body: configData
                });
            }
        }
    },
    
    // API de integração com InfinityPay
    infinityPay: {
        // Gerar QR Code PIX
        gerarPix: function(valor, descricao) {
            return API.request('/infinity-pay/gerar-pix', {
                method: 'POST',
                body: { valor, descricao }
            });
        },
        
        // Verificar status de pagamento
        verificarPagamento: function(transacaoId) {
            return API.request(`/infinity-pay/verificar/${transacaoId}`);
        },
        
        // Simular pagamento (apenas para ambiente de desenvolvimento)
        simularPagamento: function(transacaoId) {
            return API.request(`/infinity-pay/simular-pagamento/${transacaoId}`, {
                method: 'POST'
            });
        }
    }
};

// Simulação de API para ambiente de desenvolvimento
const APISimulator = {
    // Inicializar simulador
    init: function() {
        console.log('API Simulator inicializado');
        
        // Interceptar chamadas fetch
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
        
        // Extrair endpoint
        const endpoint = url.replace('/api', '');
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Roteamento de endpoints
        if (endpoint.startsWith('/infinity-pay/gerar-pix')) {
            return APISimulator.simularGerarPix(options);
        } else if (endpoint.startsWith('/infinity-pay/verificar/')) {
            const transacaoId = endpoint.split('/').pop();
            return APISimulator.simularVerificarPagamento(transacaoId);
        } else if (endpoint.startsWith('/infinity-pay/simular-pagamento/')) {
            const transacaoId = endpoint.split('/').pop();
            return APISimulator.simularConfirmarPagamento(transacaoId);
        }
        
        // Endpoint não simulado
        return new Response(JSON.stringify({
            success: false,
            message: 'Endpoint não simulado'
        }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    },
    
    // Simular geração de QR Code PIX
    simularGerarPix: function(options) {
        try {
            const body = JSON.parse(options.body);
            const valor = body.valor;
            
            // Gerar ID de transação
            const transacaoId = Date.now().toString();
            
            // Resposta simulada
            return new Response(JSON.stringify({
                success: true,
                transacao_id: transacaoId,
                qrcode_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAAB9UlEQVR4nO3VwY3DMAwAQSn03y3dJI8YmAXmK4KkPF7P8/rjdV33iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hwjwj3iHCPCPeIcI8I94hw/wLyxAX96ueJ8QAAAABJRU5ErkJggg==',
                pix_copia_cola: '00020126580014BR.GOV.BCB.PIX0136example.com/pix/v2/123456789',
                expiracao: 3600 // 1 hora
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Erro ao processar requisição'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    },
    
    // Simular verificação de pagamento
    simularVerificarPagamento: function(transacaoId) {
        // Verificar se o pagamento foi simulado
        const pagamentoConfirmado = localStorage.getItem(`pagamento_${transacaoId}`);
        
        if (pagamentoConfirmado) {
            return new Response(JSON.stringify({
                success: true,
                status: 'CONFIRMADO',
                message: 'Pagamento confirmado'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({
                success: true,
                status: 'PENDENTE',
                message: 'Aguardando pagamento'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    },
    
    // Simular confirmação de pagamento
    simularConfirmarPagamento: function(transacaoId) {
        // Marcar pagamento como confirmado
        localStorage.setItem(`pagamento_${transacaoId}`, 'true');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Pagamento simulado com sucesso'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// Inicializar simulador em ambiente de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    APISimulator.init();
}
