// Módulo para gerenciar o painel administrativo
const adminModule = (function() {
    // Elementos do DOM
    let configForm;
    let cnpjInput;
    let whatsappInput;
    let emailInput;
    let configSaveBtn;
    let configStatusMsg;
    
    // Inicializar módulo
    function init() {
        // Verificar se o usuário está na página de admin
        if (!document.getElementById('page-admin')) {
            return;
        }
        
        // Inicializar elementos
        configForm = document.getElementById('config-form');
        cnpjInput = document.getElementById('admin-cnpj');
        whatsappInput = document.getElementById('admin-whatsapp');
        emailInput = document.getElementById('admin-email');
        configSaveBtn = document.getElementById('btn-save-config');
        configStatusMsg = document.getElementById('config-status-message');
        
        // Carregar configurações atuais
        loadCurrentConfig();
        
        // Adicionar event listeners
        if (configForm) {
            configForm.addEventListener('submit', handleConfigSubmit);
        }
    }
    
    // Carregar configurações atuais
    async function loadCurrentConfig() {
        if (!cnpjInput || !whatsappInput || !emailInput) return;
        
        try {
            const config = await configModule.getAdminConfig();
            if (config) {
                cnpjInput.value = config.cnpj || '';
                whatsappInput.value = config.whatsapp || '';
                emailInput.value = config.email || '';
            }
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            showStatusMessage('Erro ao carregar configurações. Tente novamente.', 'error');
        }
    }
    
    // Manipular envio do formulário de configuração
    async function handleConfigSubmit(event) {
        event.preventDefault();
        
        if (!cnpjInput || !whatsappInput || !emailInput) return;
        
        const cnpj = cnpjInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        const email = emailInput.value.trim();
        
        // Validação básica
        if (!cnpj) {
            showStatusMessage('CNPJ é obrigatório', 'error');
            return;
        }
        
        if (!whatsapp) {
            showStatusMessage('WhatsApp é obrigatório', 'error');
            return;
        }
        
        if (!email) {
            showStatusMessage('E-mail é obrigatório', 'error');
            return;
        }
        
        // Validar formato de e-mail
        if (!validateEmail(email)) {
            showStatusMessage('Formato de e-mail inválido', 'error');
            return;
        }
        
        // Desabilitar botão durante o salvamento
        if (configSaveBtn) {
            configSaveBtn.disabled = true;
            configSaveBtn.textContent = 'Salvando...';
        }
        
        try {
            const result = await configModule.saveConfig(cnpj, whatsapp, email);
            
            if (result.success) {
                showStatusMessage('Configurações salvas com sucesso!', 'success');
            } else {
                showStatusMessage(result.error || 'Erro ao salvar configurações', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            showStatusMessage('Erro ao salvar configurações. Tente novamente.', 'error');
        } finally {
            // Reabilitar botão
            if (configSaveBtn) {
                configSaveBtn.disabled = false;
                configSaveBtn.textContent = 'Salvar Configurações';
            }
        }
    }
    
    // Validar formato de e-mail
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Exibir mensagem de status
    function showStatusMessage(message, type = 'info') {
        if (!configStatusMsg) return;
        
        // Limpar classes anteriores
        configStatusMsg.classList.remove('status-success', 'status-error', 'status-info');
        
        // Adicionar classe apropriada
        switch (type) {
            case 'success':
                configStatusMsg.classList.add('status-success');
                break;
            case 'error':
                configStatusMsg.classList.add('status-error');
                break;
            default:
                configStatusMsg.classList.add('status-info');
        }
        
        // Definir mensagem
        configStatusMsg.textContent = message;
        configStatusMsg.style.display = 'block';
        
        // Ocultar após 5 segundos se for sucesso
        if (type === 'success') {
            setTimeout(() => {
                configStatusMsg.style.display = 'none';
            }, 5000);
        }
    }
    
    // API pública
    return {
        init: init
    };
})();

// Inicializar módulo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    adminModule.init();
});
