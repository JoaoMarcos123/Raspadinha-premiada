// Módulo para gerenciar configurações do site (CNPJ, WhatsApp e e-mail)
const configModule = (function() {
    // Variáveis privadas
    let cnpj = '00.000.000/0001-00';
    let whatsapp = '5511999999999';
    let email = 'contato@raspadinha-premiada.com';
    
    // Função para carregar configurações do servidor
    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const data = await response.json();
                cnpj = data.cnpj || cnpj;
                whatsapp = data.whatsapp || whatsapp;
                email = data.email || email;
                updateFooterInfo();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return false;
        }
    }
    
    // Função para atualizar informações no rodapé
    function updateFooterInfo() {
        // Atualizar CNPJ no rodapé
        const cnpjElements = document.querySelectorAll('.footer-cnpj');
        cnpjElements.forEach(el => {
            el.textContent = cnpj;
        });
        
        // Atualizar links de WhatsApp
        const whatsappLinks = document.querySelectorAll('.whatsapp-link');
        whatsappLinks.forEach(link => {
            link.href = `https://wa.me/${whatsapp}`;
        });
        
        // Atualizar e-mail no rodapé
        const emailElements = document.querySelectorAll('.footer-email');
        emailElements.forEach(el => {
            if (el.tagName.toLowerCase() === 'a') {
                el.href = `mailto:${email}`;
                el.textContent = email;
            } else {
                el.textContent = email;
            }
        });
    }
    
    // Função para salvar configurações (apenas admin)
    async function saveConfig(newCnpj, newWhatsapp, newEmail) {
        try {
            const response = await fetch('/api/admin/config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cnpj: newCnpj,
                    whatsapp: newWhatsapp,
                    email: newEmail
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    cnpj = newCnpj;
                    whatsapp = newWhatsapp;
                    email = newEmail;
                    updateFooterInfo();
                    return { success: true };
                }
            }
            
            const errorData = await response.json();
            return { success: false, error: errorData.error || 'Erro ao salvar configurações' };
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return { success: false, error: 'Erro de conexão ao salvar configurações' };
        }
    }
    
    // Função para obter configurações atuais (para admin)
    async function getAdminConfig() {
        try {
            const response = await fetch('/api/admin/config');
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Erro ao obter configurações de admin:', error);
            return null;
        }
    }
    
    // API pública
    return {
        init: loadConfig,
        saveConfig: saveConfig,
        getAdminConfig: getAdminConfig,
        getCnpj: () => cnpj,
        getWhatsapp: () => whatsapp,
        getEmail: () => email
    };
})();

// Inicializar configurações quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    configModule.init();
});
