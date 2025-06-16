// Módulo de autenticação e gerenciamento de usuários
const authModule = {
    // Configurações
    config: {
        // Email específico do administrador (será verificado pelo backend via token)
        // Não é mais necessário definir o email aqui, a verificação será feita no backend
        // com base no token JWT que conterá a flag is_admin.
    },
    
    // Inicialização do módulo
    init: function() {
        console.log("Módulo de autenticação inicializado");
        this.checkAuthState();
        this.setupEventListeners();
    },
    
    // Verificar estado de autenticação
    checkAuthState: function() {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Decodificar token para verificar expiração e admin status (sem verificar assinatura aqui)
                const payload = JSON.parse(atob(token.split(".")[1]));
                const now = Math.floor(Date.now() / 1000);

                if (payload.exp && payload.exp < now) {
                    console.log("Token expirado.");
                    this.handleLogout(); // Força logout se token expirado
                    return;
                }

                document.body.classList.add("is-authenticated");
                
                if (payload.is_admin) {
                    document.body.classList.add("is-admin");
                    // Mostrar elementos admin
                    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "");
                } else {
                    document.body.classList.remove("is-admin");
                    // Esconder elementos admin
                    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
                }
                this.loadUserData(); // Carrega dados do usuário logado
            } catch (error) {
                console.error("Erro ao decodificar token ou token inválido:", error);
                this.handleLogout(); // Limpa token inválido
            }
        } else {
            document.body.classList.remove("is-authenticated");
            document.body.classList.remove("is-admin");
            // Esconder elementos que exigem auth ou admin
            document.querySelectorAll(".auth-only, .admin-only").forEach(el => el.style.display = "none");
            // Mostrar elementos que só aparecem para não logados
            document.querySelectorAll(".no-auth-only").forEach(el => el.style.display = "");
        }
    },
    
    // Verificar se o usuário está autenticado (apenas checa existência do token)
    isAuthenticated: function() {
        return !!localStorage.getItem("token");
    },
    
    // Verificar se o usuário é administrador (lendo a flag do token)
    isAdmin: function() {
        const token = localStorage.getItem("token");
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.is_admin === true;
        } catch (error) {
            console.error("Erro ao verificar admin status do token:", error);
            return false;
        }
    },
    
    // Carregar dados do usuário da API
    loadUserData: async function() {
        try {
            const response = await apiModule.get("/auth/profile");
            if (response && response.user) {
                localStorage.setItem("user_data", JSON.stringify(response.user));
                this.displayUserData(response.user);
            } else {
                 console.error("Resposta inválida ao buscar perfil:", response);
                 // Poderia tentar carregar do localStorage como fallback?
                 const localData = localStorage.getItem("user_data");
                 if(localData) {
                    this.displayUserData(JSON.parse(localData));
                 } else {
                    this.handleLogout(); // Se não consegue carregar dados, desloga
                 }
            }
        } catch (error) {
            console.error("Erro ao carregar dados do usuário da API:", error);
            // Se falhar (ex: token inválido no backend), deslogar
            if (error.status === 401 || error.status === 403) {
                 this.handleLogout();
            }
            // Tentar carregar do localStorage como fallback em outros erros?
            const localData = localStorage.getItem("user_data");
            if(localData) {
               this.displayUserData(JSON.parse(localData));
            }
        }
    },

    // Exibir dados do usuário na interface
    displayUserData: function(userData) {
        // Nome no header
        const userNameElement = document.getElementById("user-name");
        if (userNameElement && userData.nome) {
            userNameElement.textContent = userData.nome.split(" ")[0];
        }

        // Saldo
        const saldoElements = document.querySelectorAll(".saldo-disponivel, #saldo-disponivel, #saldo-atual, #saldo-disponivel-saque");
        const saldoFormatado = this.formatarMoeda(userData.saldo || 0);
        saldoElements.forEach(element => element.textContent = saldoFormatado);
        const paymentOptionSaldo = document.getElementById("payment-option-saldo");
        if (paymentOptionSaldo) {
            paymentOptionSaldo.style.display = (userData.saldo || 0) >= 5 ? "block" : "none";
        }

        // Formulário de Perfil
        const profileNome = document.getElementById("profile-nome");
        const profileEmail = document.getElementById("profile-email");
        const profileTelefone = document.getElementById("profile-telefone");
        if (profileNome) profileNome.value = userData.nome || "";
        if (profileEmail) profileEmail.value = userData.email || "";
        if (profileTelefone) profileTelefone.value = userData.telefone || "";

        // Página Indique e Ganhe
        const referralCodeInput = document.getElementById("user-referral-code");
        const referralCountElement = document.getElementById("user-referral-count");
        const referralProgressFill = document.getElementById("referral-progress-fill");
        const bonusRaspadinhasElement = document.getElementById("user-bonus-raspadinhas");
        if (referralCodeInput) referralCodeInput.value = userData.referral_code || "";
        if (referralCountElement) referralCountElement.textContent = userData.referral_count || 0;
        if (referralProgressFill) {
            const progress = Math.min(100, ((userData.referral_count || 0) % 3) / 3 * 100);
            referralProgressFill.style.width = `${progress}%`;
        }
        if (bonusRaspadinhasElement) bonusRaspadinhasElement.textContent = userData.bonus_raspadinhas_available || 0;

        // Opção de usar bônus na compra
        const bonusOptionCompra = document.getElementById("bonus-raspadinha-option");
        const bonusDisponiveisCompra = document.getElementById("bonus-disponiveis-compra");
        if (bonusOptionCompra && bonusDisponiveisCompra) {
            const bonusCount = userData.bonus_raspadinhas_available || 0;
            if (bonusCount > 0) {
                bonusDisponiveisCompra.textContent = bonusCount;
                bonusOptionCompra.style.display = "block";
            } else {
                bonusOptionCompra.style.display = "none";
            }
        }
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        // Formulários
        document.getElementById("login-form")?.addEventListener("submit", this.handleLogin.bind(this));
        document.getElementById("cadastro-form")?.addEventListener("submit", this.handleRegister.bind(this));
        document.getElementById("profile-form")?.addEventListener("submit", this.handleProfileUpdate.bind(this));
        
        // Botões Logout
        document.getElementById("btn-logout")?.addEventListener("click", this.handleLogout.bind(this));
        document.getElementById("btn-logout-fixed")?.addEventListener("click", this.handleLogout.bind(this)); // Botão fixo
        
        // Links Login/Cadastro
        document.getElementById("link-to-login")?.addEventListener("click", (e) => { e.preventDefault(); showPage("page-login"); });
        document.getElementById("link-to-register")?.addEventListener("click", (e) => { e.preventDefault(); showPage("page-cadastro"); });
        document.getElementById("btn-login")?.addEventListener("click", () => showPage("page-login"));
        document.getElementById("btn-register")?.addEventListener("click", () => showPage("page-cadastro"));
        
        // Navegação Autenticada
        document.getElementById("nav-profile")?.addEventListener("click", (e) => { e.preventDefault(); showPage("page-profile"); });
        document.getElementById("nav-historico")?.addEventListener("click", (e) => { e.preventDefault(); showPage("page-historico"); });
        document.getElementById("nav-saldo")?.addEventListener("click", (e) => { e.preventDefault(); showPage("page-saldo"); });
        document.getElementById("nav-referral")?.addEventListener("click", (e) => { e.preventDefault(); showPage("page-referral"); }); // Link Indique/Ganhe
        document.getElementById("btn-ir-indicacao")?.addEventListener("click", () => showPage("page-referral")); // Botão footer

        // Navegação Admin
        document.getElementById("nav-admin")?.addEventListener("click", (e) => {
            e.preventDefault();
            if (this.isAdmin()) {
                showPage("page-admin");
            } else {
                this.showAuthError("Acesso restrito.");
                showPage("page-home");
            }
        });

        // Botão Copiar Código de Indicação
        document.getElementById("btn-copy-referral-code")?.addEventListener("click", () => {
            const codeInput = document.getElementById("user-referral-code");
            if (codeInput) {
                codeInput.select();
                document.execCommand("copy");
                this.showAuthSuccess("Código copiado!");
            }
        });

        // Máscara de telefone (simples)
        const telInput = document.getElementById("telefone");
        if (telInput) {
            telInput.addEventListener("input", (e) => {
                let value = e.target.value.replace(/\D/g, "");
                value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
                value = value.replace(/(\d{5})(\d)/, "$1-$2");
                e.target.value = value.slice(0, 15); // Limita tamanho (XX) XXXXX-XXXX
            });
        }
    },
    
    // Manipular login
    handleLogin: async function(event) {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        if (!email || !password) {
            this.showAuthError("Por favor, preencha email e senha.");
            return;
        }
        
        this.showAuthLoading(document.getElementById("login-form"));
        try {
            const response = await apiModule.post("/auth/login", { email, password });
            if (response && response.token && response.user) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("user_data", JSON.stringify(response.user));
                this.hideAuthLoading(document.getElementById("login-form"));
                this.checkAuthState(); // Atualiza UI e carrega dados
                this.showAuthSuccess("Login realizado com sucesso!", document.getElementById("login-form"));
                setTimeout(() => showPage("page-home"), 1000);
            } else {
                throw new Error(response.message || "Resposta inválida do servidor.");
            }
        } catch (error) {
            this.hideAuthLoading(document.getElementById("login-form"));
            this.showAuthError(error.message || "Erro ao fazer login. Verifique suas credenciais.", document.getElementById("login-form"));
        }
    },
    
    // Manipular cadastro
    handleRegister: async function(event) {
        event.preventDefault();
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("telefone").value.replace(/\D/g, ""); // Remove máscara
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const referralCodeInput = document.getElementById("referral-code-input").value.trim(); // Pega código de indicação

        if (!nome || !email || !telefone || !password) {
            this.showAuthError("Por favor, preencha todos os campos obrigatórios.", document.getElementById("cadastro-form"));
            return;
        }
        if (telefone.length < 10 || telefone.length > 11) { // Validação básica de tamanho
             this.showAuthError("Telefone inválido. Use o formato (XX) XXXXX-XXXX.", document.getElementById("cadastro-form"));
            return;
        }
        if (password !== confirmPassword) {
            this.showAuthError("As senhas não coincidem.", document.getElementById("cadastro-form"));
            return;
        }
        
        this.showAuthLoading(document.getElementById("cadastro-form"));
        try {
            const payload = { nome, email, telefone, password };
            if (referralCodeInput) {
                payload.referral_code_input = referralCodeInput; // Envia código se preenchido
            }
            
            const response = await apiModule.post("/auth/register", payload);
            if (response && response.message && response.user) {
                this.hideAuthLoading(document.getElementById("cadastro-form"));
                this.showAuthSuccess("Cadastro realizado com sucesso! Faça login para continuar.", document.getElementById("cadastro-form"));
                setTimeout(() => showPage("page-login"), 2000);
            } else {
                 throw new Error(response.message || "Resposta inválida do servidor.");
            }
        } catch (error) {
            this.hideAuthLoading(document.getElementById("cadastro-form"));
            this.showAuthError(error.message || "Erro ao fazer cadastro. Tente novamente.", document.getElementById("cadastro-form"));
        }
    },
    
    // Manipular atualização de perfil
    handleProfileUpdate: async function(event) {
        event.preventDefault();
        const nome = document.getElementById("profile-nome").value;
        const telefone = document.getElementById("profile-telefone").value.replace(/\D/g, ""); // Remove máscara
        const password = document.getElementById("profile-password").value;
        const confirmPassword = document.getElementById("profile-confirm-password").value;
        
        if (!nome || !telefone) {
            this.showAuthError("Nome e telefone são obrigatórios.", document.getElementById("profile-form"));
            return;
        }
         if (telefone.length < 10 || telefone.length > 11) {
             this.showAuthError("Telefone inválido. Use o formato (XX) XXXXX-XXXX.", document.getElementById("profile-form"));
            return;
        }
        if (password && password !== confirmPassword) {
            this.showAuthError("As senhas não coincidem.", document.getElementById("profile-form"));
            return;
        }
        
        this.showAuthLoading(document.getElementById("profile-form"));
        try {
            const payload = { nome, telefone };
            if (password) {
                payload.password = password; // Envia senha apenas se preenchida
            }
            
            const response = await apiModule.put("/auth/profile", payload);
            if (response && response.message && response.user) {
                localStorage.setItem("user_data", JSON.stringify(response.user)); // Atualiza dados locais
                this.hideAuthLoading(document.getElementById("profile-form"));
                this.displayUserData(response.user); // Atualiza UI
                this.showAuthSuccess("Perfil atualizado com sucesso!", document.getElementById("profile-form"));
                // Limpa campos de senha após sucesso
                document.getElementById("profile-password").value = "";
                document.getElementById("profile-confirm-password").value = "";
            } else {
                 throw new Error(response.message || "Resposta inválida do servidor.");
            }
        } catch (error) {
            this.hideAuthLoading(document.getElementById("profile-form"));
            this.showAuthError(error.message || "Erro ao atualizar perfil. Tente novamente.", document.getElementById("profile-form"));
        }
    },
    
    // Manipular logout
    handleLogout: function(event) {
        if (event) event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
        this.checkAuthState(); // Atualiza UI para estado deslogado
        showPage("page-home");
    },
    
    // Funções auxiliares para UI (mensagens, loading, formatação)
    showAuthError: function(message, formElement) {
        const container = formElement || document;
        const errorElement = container.querySelector(".auth-error");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
            setTimeout(() => { errorElement.style.display = "none"; }, 5000);
        } else {
            alert(`Erro: ${message}`); // Fallback
        }
    },
    
    showAuthSuccess: function(message, formElement) {
        const container = formElement || document;
        const successElement = container.querySelector(".auth-success");
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = "block";
            setTimeout(() => { successElement.style.display = "none"; }, 3000);
        } else {
            alert(message); // Fallback
        }
    },
    
    showAuthLoading: function(formElement) {
        const container = formElement || document;
        const loadingElement = container.querySelector(".auth-loading");
        if (loadingElement) loadingElement.style.display = "flex";
        // Desabilitar botão submit do form
        const submitButton = container.querySelector("button[type=\"submit\"]");
        if (submitButton) submitButton.disabled = true;
    },

    hideAuthLoading: function(formElement) {
        const container = formElement || document;
        const loadingElement = container.querySelector(".auth-loading");
        if (loadingElement) loadingElement.style.display = "none";
         // Habilitar botão submit do form
         const submitButton = container.querySelector("button[type=\"submit\"]");
         if (submitButton) submitButton.disabled = false;
    },

    formatarMoeda: function(valor) {
        return (valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
};

// Inicializar o módulo quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    authModule.init();
});

