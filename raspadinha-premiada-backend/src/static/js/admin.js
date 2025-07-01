// Módulo de administração
const adminModule = {
    // Configurações
    config: {
        adminEmail: "admin@raspadinha.com", // Email do administrador autorizado
    },
    
    // Inicialização do módulo
    init: function() {
        console.log('Módulo de administração inicializado');
        
        // Verificar se o usuário é administrador
        if (!authModule.isAdmin()) {
            console.error('Acesso não autorizado ao painel administrativo');
            showPage('page-home');
            alert('Acesso restrito. Você não tem permissão para acessar esta área.');
            return;
        }
        
        // Carregar dados do dashboard
        this.loadDashboardData();
        
        // Configurar navegação entre abas
        this.setupTabNavigation();
        
        // Configurar formulários
        this.setupForms();
        
        // Carregar configurações de pagamento
        this.loadPaymentSettings();
    },
    
    // Carregar dados do dashboard
    loadDashboardData: function() {
        try {
            // Simulação de dados para o dashboard
            const dashboardData = {
                totalVendas: 1250,
                totalRaspadinhas: 3750,
                totalPremios: 1875,
                totalSaques: 1500,
                saquesProcessados: 1350,
                saquesPendentes: 150,
                faturamentoBruto: 18750,
                premiosPagos: 9375,
                lucroLiquido: 9375
            };
            
            // Atualizar estatísticas
            document.getElementById('stat-total-vendas').textContent = dashboardData.totalVendas;
            document.getElementById('stat-total-raspadinhas').textContent = dashboardData.totalRaspadinhas;
            document.getElementById('stat-total-premios').textContent = this.formatarMoeda(dashboardData.totalPremios);
            document.getElementById('stat-total-saques').textContent = dashboardData.totalSaques;
            document.getElementById('stat-saques-processados').textContent = dashboardData.saquesProcessados;
            document.getElementById('stat-saques-pendentes').textContent = dashboardData.saquesPendentes;
            document.getElementById('stat-faturamento-bruto').textContent = this.formatarMoeda(dashboardData.faturamentoBruto);
            document.getElementById('stat-premios-pagos').textContent = this.formatarMoeda(dashboardData.premiosPagos);
            document.getElementById('stat-lucro-liquido').textContent = this.formatarMoeda(dashboardData.lucroLiquido);
            
            // Carregar gráficos
            this.loadCharts();
            
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        }
    },
    
    // Carregar gráficos
    loadCharts: function() {
        // Implementação de gráficos pode ser adicionada aqui
        console.log('Carregando gráficos do dashboard');
    },
    
    // Configurar navegação entre abas
    setupTabNavigation: function() {
        const tabButtons = document.querySelectorAll('.admin-tab-button');
        const tabContents = document.querySelectorAll('.admin-tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remover classe ativa de todos os botões
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adicionar classe ativa ao botão clicado
                this.classList.add('active');
                
                // Esconder todos os conteúdos
                tabContents.forEach(content => content.style.display = 'none');
                
                // Mostrar conteúdo correspondente
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).style.display = 'block';
            });
        });
        
        // Ativar primeira aba por padrão
        if (tabButtons.length > 0) {
            tabButtons[0].click();
        }
    },
    
    // Configurar formulários
    setupForms: function() {
        // Formulário de configurações de pagamento
        const paymentSettingsForm = document.getElementById('payment-settings-form');
        if (paymentSettingsForm) {
            paymentSettingsForm.addEventListener('submit', this.handlePaymentSettingsSave.bind(this));
        }
        
        // Formulário de configurações gerais
        const generalSettingsForm = document.getElementById('general-settings-form');
        if (generalSettingsForm) {
            generalSettingsForm.addEventListener('submit', this.handleGeneralSettingsSave.bind(this));
        }
        
        // Formulário de processamento de saque
        const processSaqueForm = document.getElementById('process-saque-form');
        if (processSaqueForm) {
            processSaqueForm.addEventListener('submit', this.handleProcessSaque.bind(this));
        }
        
        // Configurar eventos para mostrar/esconder campos de configuração
        const pixEnabled = document.getElementById('pix-enabled');
        if (pixEnabled) {
            pixEnabled.addEventListener('change', function() {
                const pixConfig = document.getElementById('pix-config');
                if (pixConfig) {
                    pixConfig.style.display = this.checked ? 'block' : 'none';
                }
            });
        }
        
        const creditCardEnabled = document.getElementById('credit-card-enabled');
        if (creditCardEnabled) {
            creditCardEnabled.addEventListener('change', function() {
                const creditCardConfig = document.getElementById('credit-card-config');
                if (creditCardConfig) {
                    creditCardConfig.style.display = this.checked ? 'block' : 'none';
                }
            });
        }
    },
    
    // Carregar configurações de pagamento
    loadPaymentSettings: function() {
        try {
            // Tentar carregar configurações do localStorage
            const paymentSettings = JSON.parse(localStorage.getItem('payment_settings') || '{}');
            
            // Configurações PIX
            if (document.getElementById('pix-enabled')) {
                document.getElementById('pix-enabled').checked = paymentSettings.pixEnabled !== false;
                document.getElementById('pix-key').value = paymentSettings.pixKey || '';
                document.getElementById('pix-recipient-name').value = paymentSettings.pixRecipientName || '';
                document.getElementById('pix-recipient-document').value = paymentSettings.pixRecipientDocument || '';
                
                // Mostrar/esconder configuração PIX
                document.getElementById('pix-config').style.display = 
                    paymentSettings.pixEnabled !== false ? 'block' : 'none';
            }
            
            // Configurações Cartão de Crédito
            if (document.getElementById('credit-card-enabled')) {
                document.getElementById('credit-card-enabled').checked = !!paymentSettings.creditCardEnabled;
                document.getElementById('credit-card-api-key').value = paymentSettings.creditCardApiKey || '';
                document.getElementById('credit-card-merchant-id').value = paymentSettings.creditCardMerchantId || '';
                document.getElementById('credit-card-public-key').value = paymentSettings.creditCardPublicKey || '';
                
                // Mostrar/esconder configuração Cartão
                document.getElementById('credit-card-config').style.display = 
                    paymentSettings.creditCardEnabled ? 'block' : 'none';
            }
            
            // Configurações Gerais de Pagamento
            if (document.getElementById('payment-fee')) {
                document.getElementById('payment-fee').value = paymentSettings.paymentFee || '0';
                document.getElementById('min-withdrawal').value = paymentSettings.minWithdrawal || '5';
                document.getElementById('auto-approve-below').value = paymentSettings.autoApproveBelow || '20';
            }
            
        } catch (error) {
            console.error('Erro ao carregar configurações de pagamento:', error);
        }
    },
    
    // Salvar configurações de pagamento
    handlePaymentSettingsSave: function(event) {
        event.preventDefault();
        
        try {
            // Coletar dados do formulário
            const paymentSettings = {
                // PIX
                pixEnabled: document.getElementById('pix-enabled').checked,
                pixKey: document.getElementById('pix-key').value,
                pixRecipientName: document.getElementById('pix-recipient-name').value,
                pixRecipientDocument: document.getElementById('pix-recipient-document').value,
                
                // Cartão de Crédito
                creditCardEnabled: document.getElementById('credit-card-enabled').checked,
                creditCardApiKey: document.getElementById('credit-card-api-key').value,
                creditCardMerchantId: document.getElementById('credit-card-merchant-id').value,
                creditCardPublicKey: document.getElementById('credit-card-public-key').value,
                
                // Configurações Gerais
                paymentFee: document.getElementById('payment-fee').value,
                minWithdrawal: document.getElementById('min-withdrawal').value,
                autoApproveBelow: document.getElementById('auto-approve-below').value
            };
            
            // Salvar no localStorage (em produção, seria enviado para o servidor)
            localStorage.setItem('payment_settings', JSON.stringify(paymentSettings));
            
            // Mostrar mensagem de sucesso
            alert('Configurações de pagamento salvas com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar configurações de pagamento:', error);
            alert('Erro ao salvar configurações. Tente novamente.');
        }
    },
    
    // Salvar configurações gerais
    handleGeneralSettingsSave: function(event) {
        event.preventDefault();
        
        try {
            // Coletar dados do formulário
            const generalSettings = {
                siteName: document.getElementById('site-name').value,
                siteDescription: document.getElementById('site-description').value,
                contactEmail: document.getElementById('contact-email').value,
                whatsappNumber: document.getElementById('whatsapp-number').value,
                termsUrl: document.getElementById('terms-url').value,
                privacyUrl: document.getElementById('privacy-url').value
            };
            
            // Salvar no localStorage (em produção, seria enviado para o servidor)
            localStorage.setItem('general_settings', JSON.stringify(generalSettings));
            
            // Mostrar mensagem de sucesso
            alert('Configurações gerais salvas com sucesso!');
            
        } catch (error) {
            console.error('Erro ao salvar configurações gerais:', error);
            alert('Erro ao salvar configurações. Tente novamente.');
        }
    },
    
    // Processar saque
    handleProcessSaque: function(event) {
        event.preventDefault();
        
        try {
            // Coletar dados do formulário
            const saqueId = document.getElementById('saque-id').value;
            const status = document.querySelector('input[name="saque-status"]:checked').value;
            
            // Simulação de processamento
            console.log(`Processando saque ${saqueId} com status ${status}`);
            
            // Mostrar mensagem de sucesso
            alert('Saque processado com sucesso!');
            
            // Atualizar lista de saques
            this.loadSaquesList();
            
        } catch (error) {
            console.error('Erro ao processar saque:', error);
            alert('Erro ao processar saque. Tente novamente.');
        }
    },
    
    // Carregar lista de saques
    loadSaquesList: function() {
        try {
            // Simulação de dados
            const saques = [
                { id: 1, usuario: 'Maria Silva', valor: 100, data: '01/06/2025', status: 'pendente' },
                { id: 2, usuario: 'João Pereira', valor: 50, data: '31/05/2025', status: 'aprovado' },
                { id: 3, usuario: 'Ana Costa', valor: 20, data: '30/05/2025', status: 'aprovado' },
                { id: 4, usuario: 'Carlos Santos', valor: 75, data: '29/05/2025', status: 'aprovado' }
            ];
            
            // Renderizar lista
            const saquesListElement = document.getElementById('saques-list');
            if (saquesListElement) {
                saquesListElement.innerHTML = '';
                
                saques.forEach(saque => {
                    const saqueElement = document.createElement('tr');
                    
                    let statusClass = '';
                    switch (saque.status) {
                        case 'pendente':
                            statusClass = 'status-warning';
                            break;
                        case 'aprovado':
                            statusClass = 'status-success';
                            break;
                        case 'rejeitado':
                            statusClass = 'status-danger';
                            break;
                    }
                    
                    saqueElement.innerHTML = `
                        <td>${saque.id}</td>
                        <td>${saque.usuario}</td>
                        <td>${this.formatarMoeda(saque.valor)}</td>
                        <td>${saque.data}</td>
                        <td><span class="${statusClass}">${saque.status}</span></td>
                        <td>
                            <button class="btn-small btn-primary" onclick="adminModule.openProcessSaque(${saque.id}, '${saque.usuario}', ${saque.valor})">
                                Processar
                            </button>
                        </td>
                    `;
                    
                    saquesListElement.appendChild(saqueElement);
                });
            }
            
        } catch (error) {
            console.error('Erro ao carregar lista de saques:', error);
        }
    },
    
    // Abrir modal de processamento de saque
    openProcessSaque: function(id, usuario, valor) {
        // Preencher dados do formulário
        document.getElementById('saque-id').value = id;
        document.getElementById('saque-usuario').textContent = usuario;
        document.getElementById('saque-valor').textContent = this.formatarMoeda(valor);
        
        // Mostrar modal
        document.getElementById('modal-process-saque').style.display = 'block';
    },
    
    // Fechar modal de processamento de saque
    closeProcessSaque: function() {
        document.getElementById('modal-process-saque').style.display = 'none';
    },
    
    // Formatar valor em moeda
    formatarMoeda: function(valor) {
        return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
    }
};

// Inicializar módulo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // O módulo admin só será inicializado na página admin
    const pageAdmin = document.getElementById('page-admin');
    if (pageAdmin && window.adminModule) {
        // Verificar se está na página admin e se o módulo existe
        document.getElementById('nav-admin').addEventListener('click', function(e) {
            e.preventDefault();
            
            // Verificar se o usuário é administrador antes de inicializar
            if (authModule.isAdmin()) {
                adminModule.init();
                showPage('page-admin');
            } else {
                alert('Acesso restrito. Você não tem permissão para acessar esta área.');
            }
        });
    }
});
