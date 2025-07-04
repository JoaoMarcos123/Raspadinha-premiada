// Módulo de autenticação e gerenciamento de usuários
const authModule = {
    init: function () {
        console.log("Módulo de autenticação inicializado");
        this.checkAuthState();
        this.setupEventListeners();
    },

    checkAuthState: function () {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    this.handleLogout();
                    return;
                }
                document.body.classList.add("is-authenticated");
                if (payload.is_admin) {
                    document.body.classList.add("is-admin");
                    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "");
                } else {
                    document.body.classList.remove("is-admin");
                    document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
                }
                this.loadUserData();
            } catch {
                this.handleLogout();
            }
        } else {
            document.body.classList.remove("is-authenticated", "is-admin");
            document.querySelectorAll(".auth-only, .admin-only").forEach(el => el.style.display = "none");
            document.querySelectorAll(".no-auth-only").forEach(el => el.style.display = "");
        }
    },

    isAuthenticated: function () {
        return !!localStorage.getItem("token");
    },

    isAdmin: function () {
        const token = localStorage.getItem("token");
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.is_admin === true;
        } catch {
            return false;
        }
    },

    loadUserData: async function () {
        try {
            const res = await fetch("https://raspadinha-premiada.onrender.com/api/auth/status", {
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                credentials: "include"
            });
            const result = await res.json();
            if (result?.user) {
                localStorage.setItem("user_data", JSON.stringify(result.user));
                this.displayUserData(result.user);
            } else {
                const localData = localStorage.getItem("user_data");
                if (localData) this.displayUserData(JSON.parse(localData));
                else this.handleLogout();
            }
        } catch {
            try {
                const localData = localStorage.getItem("user_data");
                if (localData) this.displayUserData(JSON.parse(localData));
            } catch {}
        }
    },

    displayUserData: function (u) {
        document.getElementById("user-name")?.textContent = u.nome?.split(" ")[0] || "";
        document.querySelectorAll(".saldo-disponivel, #saldo-disponivel, #saldo-atual, #saldo-disponivel-saque")
            .forEach(el => el.textContent = u.saldo?.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})||0);
        document.getElementById("payment-option-saldo")?.style.display = (u.saldo>=5?"block":"none");
        if (document.getElementById("profile-nome")) {
            document.getElementById("profile-nome").value = u.nome||"";
            document.getElementById("profile-email").value = u.email||"";
            document.getElementById("profile-telefone").value = u.telefone||"";
        }
        document.getElementById("user-referral-code")?.value = u.referral_code||"";
        document.getElementById("user-referral-count")?.textContent = u.referral_count||0;
        const fill = document.getElementById("referral-progress-fill");
        if (fill) fill.style.width = `${Math.min(100,(u.referral_count%3||0)/3*100)}%`;
        document.getElementById("user-bonus-raspadinhas")?.textContent = u.bonus_raspadinhas_available||0;
        const bonusOpt = document.getElementById("bonus-raspadinha-option");
        const bonusDisp = document.getElementById("bonus-disponiveis-compra");
        if (bonusOpt && bonusDisp) {
            if (u.bonus_raspadinhas_available>0){
                bonusDisp.textContent = u.bonus_raspadinhas_available;
                bonusOpt.style.display="";
            } else bonusOpt.style.display="none";
        }
    },

    setupEventListeners: function () {
        document.getElementById("login-form")?.addEventListener("submit", this.handleLogin.bind(this));
        document.getElementById("cadastro-form")?.addEventListener("submit", this.handleRegister.bind(this));
        document.getElementById("profile-form")?.addEventListener("submit", this.handleProfileUpdate.bind(this));
        document.getElementById("btn-logout")?.addEventListener("click", this.handleLogout.bind(this));
        document.getElementById("btn-logout-fixed")?.addEventListener("click", this.handleLogout.bind(this));
        document.getElementById("link-to-login")?.addEventListener("click", e => { e.preventDefault(); showPage("page-login"); });
        document.getElementById("link-to-register")?.addEventListener("click", e => { e.preventDefault(); showPage("page-cadastro"); });
        document.getElementById("btn-login")?.addEventListener("click", () => showPage("page-login"));
        document.getElementById("btn-register")?.addEventListener("click", () => showPage("page-cadastro"));
        ["nav-profile","nav-historico","nav-saldo","nav-referral"].forEach(id=>{
            document.getElementById(id)?.addEventListener("click", e => { e.preventDefault(); showPage(id.replace("nav-","page-") ); });
        });
        document.getElementById("btn-ir-indicacao")?.addEventListener("click", () => showPage("page-referral"));
        document.getElementById("nav-admin")?.addEventListener("click", e => {
            e.preventDefault();
            if (this.isAdmin()) showPage("page-admin");
            else { this.showAuthError("Acesso restrito."); showPage("page-home"); }
        });
        document.getElementById("btn-copy-referral-code")?.addEventListener("click", () => {
            const codeInput = document.getElementById("user-referral-code");
            if (codeInput) {
                codeInput.select();
                document.execCommand("copy");
                this.showAuthSuccess("Código copiado!");
            }
        });
        const tel = document.getElementById("telefone");
        tel?.addEventListener("input",e=>{
            let v=e.target.value.replace(/\D/g,"");
            v=v.replace(/^(\d{2})(\d)/,"($1) $2");
            v=v.replace(/(\d{5})(\d)/,"$1-$2");
            e.target.value=v.slice(0,15);
        });
    },

    handleLogin: async function (event) {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        if (!email||!password){ this.showAuthError("Preencha e-mail e senha.",document.getElementById("login-form"));return; }
        this.showAuthLoading(document.getElementById("login-form"));
        try {
            const res = await fetch("https://raspadinha-premiada.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email,password })
            });
            if (!res.ok) throw new Error("Falha no login");
            const data = await res.json();
            if (data.token && data.user) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user_data", JSON.stringify(data.user));
                this.checkAuthState();
                this.hideAuthLoading(document.getElementById("login-form"));
                this.showAuthSuccess("Login realizado!", document.getElementById("login-form"));
                setTimeout(() => showPage("page-home"), 1000);
            } else throw new Error("Resposta inesperada.");
        } catch (err) {
            this.hideAuthLoading(document.getElementById("login-form"));
            this.showAuthError(err.message || "Erro no login.", document.getElementById("login-form"));
        }
    },

    handleRegister: async function (event) {
        event.preventDefault();
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("telefone").value.replace(/\D/g,"");
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const referralCodeInput = document.getElementById("referral-code-input")?.value.trim();
        if (!nome||!email||!telefone||!password){ this.showAuthError("Preencha todos os campos.",document.getElementById("cadastro-form"));return; }
        if (telefone.length<10||telefone.length>11){ this.showAuthError("Telefone inválido.",document.getElementById("cadastro-form"));return; }
        if (password!==confirmPassword){ this.showAuthError("Senhas não coincidem.",document.getElementById("cadastro-form"));return; }
        this.showAuthLoading(document.getElementById("cadastro-form"));
        try {
            const payload = { nome,email,telefone,password };
            if (referralCodeInput) payload.referral_code_input = referralCodeInput;
            const res = await fetch("https://raspadinha-premiada.onrender.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.message || "Erro no cadastro.");
            }
            this.hideAuthLoading(document.getElementById("cadastro-form"));
            this.showAuthSuccess("Cadastro realizado com sucesso! Faça login.",document.getElementById("cadastro-form"));
            setTimeout(() => showPage("page-login"), 2000);
        } catch (err) {
            this.hideAuthLoading(document.getElementById("cadastro-form"));
            this.showAuthError(err.message || "Erro ao cadastrar.",document.getElementById("cadastro-form"));
        }
    },

    handleProfileUpdate: async function(event) {
        event.preventDefault();
        const nome = document.getElementById("profile-nome").value;
        const telefone = document.getElementById("profile-telefone").value.replace(/\D/g,"");
        const password = document.getElementById("profile-password").value;
        const confirmPassword = document.getElementById("profile-confirm-password").value;
        if (!nome||!telefone){ this.showAuthError("Nome e telefone são obrigatórios.",document.getElementById("profile-form"));return; }
        if (telefone.length<10||telefone.length>11){ this.showAuthError("Telefone inválido.",document.getElementById("profile-form"));return; }
        if (password&&password!==confirmPassword){ this.showAuthError("Senhas não coincidem.",document.getElementById("profile-form"));return; }
        this.showAuthLoading(document.getElementById("profile-form"));
        try {
            const body = { nome,telefone };
            if (password) body.password = password;
            const res = await fetch("https://raspadinha-premiada.onrender.com/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error("Erro ao atualizar perfil.");
            const data = await res.json();
            localStorage.setItem("user_data", JSON.stringify(data.user));
            this.displayUserData(data.user);
            this.hideAuthLoading(document.getElementById("profile-form"));
            this.showAuthSuccess("Perfil atualizado!",document.getElementById("profile-form"));
            document.getElementById("profile-password").value="";
            document.getElementById("profile-confirm-password").value="";
        } catch (err) {
            this.hideAuthLoading(document.getElementById("profile-form"));
            this.showAuthError(err.message||"Erro ao atualizar perfil.",document.getElementById("profile-form"));
        }
    },

    handleLogout: function () {
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
        this.checkAuthState();
        showPage("page-home");
    },

    showAuthError: function (message, formElement) {
        const errEl = formElement?.querySelector(".auth-error");
        if (errEl) { errEl.textContent=message; errEl.style.display="block"; setTimeout(()=>errEl.style.display="none",4000); }
        else alert("Erro: "+message);
    },

    showAuthSuccess: function (message, formElement) {
        const sucEl = formElement?.querySelector(".auth-success");
        if (sucEl) { sucEl.textContent=message; sucEl.style.display="block"; setTimeout(()=>sucEl.style.display="none",4000); }
    },

    showAuthLoading: function (formElement) {
        const ld = formElement?.querySelector(".auth-loading"); if (ld) ld.style.display="flex";
        const btn = formElement?.querySelector("button[type=submit]"); if (btn) btn.disabled=true;
    },

    hideAuthLoading: function (formElement) {
        const ld = formElement?.querySelector(".auth-loading"); if (ld) ld.style.display="none";
        const btn = formElement?.querySelector("button[type=submit]"); if (btn) btn.disabled=false;
    },

    formatarMoeda: function(valor) {
        return (valor||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    authModule.init();
});
