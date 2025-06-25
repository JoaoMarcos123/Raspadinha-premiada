// auth.js completo, corrigido e funcional

// Função que alterna entre as páginas da SPA
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  const page = document.getElementById(pageId);
  if (page) page.style.display = "block";
}

// Módulo de autenticação
const authModule = {
  init: function () {
    this.setupEventListeners();
  },

  setupEventListeners: function () {
    // Formulário de cadastro
    document.getElementById("cadastro-form")?.addEventListener("submit", this.handleRegister.bind(this));

    // Botões de navegação
    document.getElementById("btn-register")?.addEventListener("click", () => showPage("page-cadastro"));
    document.getElementById("btn-login")?.addEventListener("click", () => showPage("page-login"));

    // Links de login/cadastro
    document.getElementById("link-to-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("page-login");
    });
    document.getElementById("link-to-register")?.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("page-cadastro");
    });
  },

  // Função de cadastro
  handleRegister: async function (event) {
    event.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value.replace(/\D/g, "");
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const referralCodeInput = document.getElementById("referral-code-input").value.trim();

    const form = document.getElementById("cadastro-form");
    const errorBox = form.querySelector(".auth-error");
    const successBox = form.querySelector(".auth-success");

    // Esconder mensagens
    errorBox.style.display = "none";
    successBox.style.display = "none";

    // Validações
    if (!nome || !email || !telefone || !password) {
      errorBox.innerText = "Por favor, preencha todos os campos obrigatórios.";
      errorBox.style.display = "block";
      return;
    }

    if (password !== confirmPassword) {
      errorBox.innerText = "As senhas não coincidem.";
      errorBox.style.display = "block";
      return;
    }

    try {
      const payload = { nome, email, telefone, password };
      if (referralCodeInput) {
        payload.referral_code_input = referralCodeInput;
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        successBox.innerText = "Cadastro realizado com sucesso!";
        successBox.style.display = "block";
        form.reset();
        setTimeout(() => showPage("page-login"), 2000);
      } else {
        errorBox.innerText = result.message || "Erro ao cadastrar.";
        errorBox.style.display = "block";
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      errorBox.innerText = "Erro de conexão com o servidor.";
      errorBox.style.display = "block";
    }
  }
};

// Inicialização do módulo quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  authModule.init();
});
