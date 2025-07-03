// Arquivo principal para gerenciamento da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicação inicializada');
    
    // Inicializar módulos
    authModule.init();
    raspadinhaModule.init();
    
    // Configurar navegação entre páginas
    setupNavigation();
    
    // Configurar eventos para botões principais
    setupButtonEvents();
    
    // Configurar pop-up de ganhador recente
    setupWinnerPopup();
    
    // Configurar botão de logout fixo
    setupFixedLogoutButton();
});

// Função para mostrar uma página específica
function showPage(pageId) {
    // Esconder todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Mostrar a página solicitada
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = 'block';
        
        // Ações específicas para certas páginas
        if (pageId === 'page-compra') {
            // Atualizar valor total ao mostrar página de compra
            updateTotalValue();
        } else if (pageId === 'page-raspadinhas') {
            // Verificar se há raspadinhas para mostrar
            raspadinhaModule.checkRaspadinhas();
        } else if (pageId === 'page-profile') {
            // Carregar dados do perfil
            loadProfileData();
        } else if (pageId === 'page-historico') {
            // Carregar histórico
            loadHistoricoData();
        } else if (pageId === 'page-saldo') {
            // Atualizar saldo
            updateSaldoPage();
        } else if (pageId === 'page-admin') {
            // Inicializar painel admin
            initAdminPanel();
        }
    }
    
    // Rolar para o topo
    window.scrollTo(0, 0);
}

// Configurar navegação entre páginas
function setupNavigation() {
    // Links de navegação principal
    document.getElementById('nav-home').addEventListener('click', function(e) {
        e.preventDefault();
        showPage('page-home');
    });
    
    // Botão "Jogar Agora"
    document.getElementById('btn-jogar-agora').addEventListener('click', function() {
        if (authModule.isAuthenticated()) {
            showPage('page-compra');
        } else {
            showPage('page-login');
        }
    });
}

// Configurar eventos para botões principais
function setupButtonEvents() {
    // Formulário de compra
    const compraForm = document.getElementById('compra-form');
    if (compraForm) {
        compraForm.addEventListener('submit', handleCompra);
    }
    
    // Input de quantidade
    const quantidadeInput = document.getElementById('quantidade');
    if (quantidadeInput) {
        quantidadeInput.addEventListener('input', updateTotalValue);
    }
    
    // Botão "Ver Valor Ganho"
    const btnVerValorGanho = document.getElementById('btn-ver-valor-ganho');
    if (btnVerValorGanho) {
        btnVerValorGanho.addEventListener('click', function() {
            // Calcular valor total ganho
            const valorGanho = raspadinhaModule.calcularValorTotal();
            
            // Atualizar valor na página de saque
            document.getElementById('valor-ganho').textContent = 'R$ ' + valorGanho.toFixed(2).replace('.', ',');
            
            // Mostrar página de saque
            showPage('page-saque');
        });
    }
    
    // Formulário de saque
    const saqueForm = document.getElementById('saque-form');
    if (saqueForm) {
        saqueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulação de processamento de saque
            alert('Saque solicitado com sucesso! Você receberá o valor em até 24 horas úteis.');
            
            // Redirecionar para a página inicial
            showPage('page-home');
        });
    }
    
    // Botões da página de saldo
    const btnComprarMais = document.getElementById('btn-comprar-mais');
    if (btnComprarMais) {
        btnComprarMais.addEventListener('click', function() {
            showPage('page-compra');
        });
    }
    
    const btnSolicitarSaque = document.getElementById('btn-solicitar-saque');
    if (btnSolicitarSaque) {
        btnSolicitarSaque.addEventListener('click', function() {
            showPage('page-saque');
        });
    }
    
    // Botões de modal de pagamento
    setupPaymentModalButtons();
}

// Configurar botões do modal de pagamento
function setupPaymentModalButtons() {
    // Modal PIX
    const modalPagamento = document.getElementById('modal-pagamento');
    const closeButton = modalPagamento?.querySelector('.close-button');
    const btnCancelPayment = document.getElementById('btn-cancel-payment');
    const btnConfirmPayment = document.getElementById('btn-confirm-payment');
    const btnCopyPix = document.getElementById('btn-copy-pix');
    
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            modalPagamento.style.display = 'none';
        });
    }
    
    if (btnCancelPayment) {
        btnCancelPayment.addEventListener('click', function() {
            modalPagamento.style.display = 'none';
        });
    }
    
    if (btnConfirmPayment) {
        btnConfirmPayment.addEventListener('click', function() {
            // Simular confirmação de pagamento
            modalPagamento.style.display = 'none';
            
            // Gerar raspadinhas
            const quantidade = parseInt(document.getElementById('quantidade').value);
            raspadinhaModule.gerarRaspadinhas(quantidade);
            
            // Mostrar página de raspadinhas
            showPage('page-raspadinhas');
        });
    }
    
    if (btnCopyPix) {
        btnCopyPix.addEventListener('click', function() {
            const pixCode = document.getElementById('pix-code');
            pixCode.select();
            document.execCommand('copy');
            alert('Código PIX copiado para a área de transferência!');
        });
    }
    
    // Modal Cartão de Crédito
    const modalCartao = document.getElementById('modal-pagamento-cartao');
    const closeButtonCartao = modalCartao?.querySelector('.close-button');
    const btnCancelCardPayment = document.getElementById('btn-cancel-card-payment');
    const btnConfirmCardPayment = document.getElementById('btn-confirm-card-payment');
    
    if (closeButtonCartao) {
        closeButtonCartao.addEventListener('click', function() {
            modalCartao.style.display = 'none';
        });
    }
    
    if (btnCancelCardPayment) {
        btnCancelCardPayment.addEventListener('click', function() {
            modalCartao.style.display = 'none';
        });
    }
    
    if (btnConfirmCardPayment) {
        btnConfirmCardPayment.addEventListener('click', function() {
            // Simular processamento de pagamento
            const paymentStatus = modalCartao.querySelector('.payment-status');
            const form = document.getElementById('credit-card-form');
            
            // Validar formulário
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            // Mostrar loading
            paymentStatus.style.display = 'block';
            form.style.display = 'none';
            btnCancelCardPayment.disabled = true;
            btnConfirmCardPayment.disabled = true;
            
            // Simular processamento
            setTimeout(function() {
                // Esconder modal
                modalCartao.style.display = 'none';
                
                // Resetar estado do modal
                paymentStatus.style.display = 'none';
                form.style.display = 'block';
                btnCancelCardPayment.disabled = false;
                btnConfirmCardPayment.disabled = false;
                
                // Gerar raspadinhas
                const quantidade = parseInt(document.getElementById('quantidade').value);
                raspadinhaModule.gerarRaspadinhas(quantidade);
                
                // Mostrar página de raspadinhas
                showPage('page-raspadinhas');
            }, 2000);
        });
    }
}

// Manipular compra de raspadinhas
function handleCompra(event) {
    event.preventDefault();
    
    // Obter quantidade e método de pagamento
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const metodoPagamento = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Validar quantidade
    if (quantidade < 1) {
        alert('Por favor, selecione pelo menos 1 raspadinha.');
        return;
    }
    
    // Processar pagamento de acordo com o método selecionado
    if (metodoPagamento === 'pix') {
        // Mostrar modal de pagamento PIX
        document.getElementById('modal-pagamento').style.display = 'block';
    } else if (metodoPagamento === 'credit-card') {
        // Mostrar modal de pagamento com cartão
        document.getElementById('modal-pagamento-cartao').style.display = 'block';
    } else if (metodoPagamento === 'saldo') {
        // Usar saldo disponível
        const saldoDisponivel = parseFloat(localStorage.getItem('saldo') || '0');
        const valorTotal = quantidade * 5;
        
        if (saldoDisponivel >= valorTotal) {
            // Atualizar saldo
            const novoSaldo = saldoDisponivel - valorTotal;
            localStorage.setItem('saldo', novoSaldo.toString());
            
            // Gerar raspadinhas
            raspadinhaModule.gerarRaspadinhas(quantidade);
            
            // Mostrar página de raspadinhas
            showPage('page-raspadinhas');
        } else {
            alert('Saldo insuficiente. Por favor, escolha outro método de pagamento.');
        }
    }
}

// Atualizar valor total na página de compra
function updateTotalValue() {
    const quantidade = parseInt(document.getElementById('quantidade').value);
    const valorUnitario = 5; // R$ 5,00 por raspadinha
    const valorTotal = quantidade * valorUnitario;
    
    document.getElementById('valor-total').value = 'R$ ' + valorTotal.toFixed(2).replace('.', ',');
}

// Carregar dados do perfil
function loadProfileData() {
    try {
        // Obter dados do usuário do localStorage
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        
        // Preencher formulário de perfil
        document.getElementById('profile-nome').value = userData.nome || '';
        document.getElementById('profile-email').value = userData.email || '';
        document.getElementById('profile-telefone').value = userData.telefone || '';
    } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
    }
}

// Carregar dados de histórico
function loadHistoricoData() {
    // Esta função seria implementada para carregar histórico real de uma API
    // Por enquanto, usamos dados simulados
    
    // Histórico de jogos
    const historicoJogos = document.getElementById('historico-jogos');
    if (historicoJogos) {
        // Limpar conteúdo atual
        historicoJogos.innerHTML = '';
        
        // Adicionar alguns itens de exemplo
        const jogos = [
            { data: '01/06/2025', quantidade: 3, valor: 15, premios: 10 },
            { data: '28/05/2025', quantidade: 5, valor: 25, premios: 20 },
            { data: '15/05/2025', quantidade: 2, valor: 10, premios: 0 }
        ];
        
        if (jogos.length > 0) {
            jogos.forEach(jogo => {
                const item = document.createElement('div');
                item.className = 'historico-item';
                item.innerHTML = `
                    <div>
                        <div>${jogo.data}</div>
                        <div class="historico-data">${jogo.quantidade} raspadinhas</div>
                    </div>
                    <div>
                        <div class="historico-valor negativo">-R$ ${jogo.valor.toFixed(2).replace('.', ',')}</div>
                        <div class="historico-valor positivo">+R$ ${jogo.premios.toFixed(2).replace('.', ',')}</div>
                    </div>
                `;
                historicoJogos.appendChild(item);
            });
        } else {
            historicoJogos.innerHTML = '<div class="historico-empty"><p>Você ainda não jogou nenhuma raspadinha.</p></div>';
        }
    }
    
    // Histórico de saques
    const historicoSaques = document.getElementById('historico-saques');
    if (historicoSaques) {
        // Limpar conteúdo atual
        historicoSaques.innerHTML = '';
        
        // Adicionar alguns itens de exemplo
        const saques = [
            { data: '29/05/2025', valor: 30, status: 'Concluído' }
        ];
        
        if (saques.length > 0) {
            saques.forEach(saque => {
                const item = document.createElement('div');
                item.className = 'historico-item';
                item.innerHTML = `
                    <div>
                        <div>${saque.data}</div>
                        <div class="historico-data">${saque.status}</div>
                    </div>
                    <div class="historico-valor negativo">-R$ ${saque.valor.toFixed(2).replace('.', ',')}</div>
                `;
                historicoSaques.appendChild(item);
            });
        } else {
            historicoSaques.innerHTML = '<div class="historico-empty"><p>Você ainda não realizou nenhum saque.</p></div>';
        }
    }
}

// Atualizar página de saldo
function updateSaldoPage() {
    try {
        // Obter dados do usuário do localStorage
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const saldo = userData.saldo || 0;
        
        // Atualizar saldo na página
        const saldoElement = document.getElementById('saldo-disponivel-saque');
        if (saldoElement) {
            saldoElement.textContent = 'R$ ' + saldo.toFixed(2).replace('.', ',');
        }
    } catch (error) {
        console.error('Erro ao atualizar página de saldo:', error);
    }
}

// Inicializar painel administrativo
function initAdminPanel() {
    // Configurar tabs
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover classe active de todas as tabs
            adminTabs.forEach(t => t.classList.remove('active'));
            
            // Adicionar classe active à tab clicada
            this.classList.add('active');
            
            // Esconder todos os conteúdos
            const contents = document.querySelectorAll('.admin-content');
            contents.forEach(content => content.classList.remove('active'));
            
            // Mostrar conteúdo correspondente
            const tabName = this.getAttribute('data-tab');
            document.getElementById('admin-' + tabName).classList.add('active');
        });
    });
    
    // Configurar tabs de configuração
    const configTabs = document.querySelectorAll('.config-tab');
    configTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remover classe active de todas as tabs
            configTabs.forEach(t => t.classList.remove('active'));
            
            // Adicionar classe active à tab clicada
            this.classList.add('active');
            
            // Esconder todos os conteúdos
            const contents = document.querySelectorAll('.config-content');
            contents.forEach(content => content.classList.remove('active'));
            
            // Mostrar conteúdo correspondente
            const tabName = this.getAttribute('data-config');
            document.getElementById('config-' + tabName).classList.add('active');
        });
    });
}

// Configurar pop-up de ganhador recente
function setupWinnerPopup() {
    const popup = document.getElementById('popup-ganhador');
    const closeButton = popup.querySelector('.popup-close');
    const jogarButton = document.getElementById('popup-jogar');
    
    // Fechar pop-up ao clicar no X
    closeButton.addEventListener('click', function() {
        popup.style.display = 'none';
    });
    
    // Botão "Jogar Agora" do pop-up
    jogarButton.addEventListener('click', function() {
        popup.style.display = 'none';
        
        if (authModule.isAuthenticated()) {
            showPage('page-compra');
        } else {
            showPage('page-login');
        }
    });
    
    // Mostrar pop-up após alguns segundos
    setTimeout(function() {
        showRandomWinner();
    }, 10000);
    
    // Mostrar pop-up periodicamente
    setInterval(function() {
        showRandomWinner();
    }, 45000);
}

// Mostrar ganhador aleatório no pop-up
function showRandomWinner() {
    const popup = document.getElementById('popup-ganhador');
    const popupMessage = popup.querySelector('.popup-message');
    
    // Lista de nomes e valores para simulação
    const nomes = ['Maria S.', 'João P.', 'Ana C.', 'Carlos M.', 'Lucia R.', 'Roberto T.', 'Fernanda L.'];
    const valores = [5, 10, 20, 50, 100];
    
    // Selecionar nome e valor aleatórios
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const valor = valores[Math.floor(Math.random() * valores.length)];
    
    // Atualizar mensagem
    popupMessage.innerHTML = `<strong>${nome}</strong> acabou de ganhar <strong>R$ ${valor},00</strong> em uma raspadinha!`;
    
    // Mostrar pop-up
    popup.style.display = 'block';
    
    // Esconder pop-up após alguns segundos
    setTimeout(function() {
        popup.style.display = 'none';
    }, 8000);
}

// Configurar botão de logout fixo
function setupFixedLogoutButton() {
    const btnLogoutFixed = document.getElementById('btn-logout-fixed');
    
    if (btnLogoutFixed) {
        btnLogoutFixed.addEventListener('click', function() {
            // Chamar função de logout do módulo de autenticação
            authModule.handleLogout();
            
            // Mostrar mensagem de confirmação
            alert('Você saiu da sua conta com sucesso!');
        });
    }
}
