// Módulo de raspadinha aprimorado
const raspadinhaModule = {
    // Configurações
    config: {
        valorRaspadinha: 5, // Valor de cada raspadinha em reais
        premioMaximo: 500, // Prêmio máximo em reais
        percentualLucro: 50, // Percentual mínimo de lucro (%)
        chancePremio: 0.7, // Chance de ganhar algum prêmio (70%)
        valoresPremios: [5, 10, 20, 50, 100, 500], // Valores possíveis de prêmios
        chancesValores: [0.5, 0.25, 0.15, 0.07, 0.025, 0.005], // Chances de cada valor (deve somar 1)
        areaRaspagem: 50, // Percentual da área que precisa ser raspada para revelar (50%)
        quantidade: 0, // Quantidade de raspadinhas a serem geradas
    },
    
    // Estado do jogo
    state: {
        raspadinhas: [], // Array de raspadinhas geradas
        raspadinhasRaspadas: 0, // Contador de raspadinhas raspadas
        totalRaspadinhas: 0, // Total de raspadinhas compradas
        premioTotal: 0, // Soma dos prêmios ganhos
        jogoFinalizado: false, // Flag para controle de finalização
        areaRaspadaAtual: 0, // Área raspada da raspadinha atual (%)
        raspadinhaAtual: null, // Elemento da raspadinha sendo raspada
        indexAtual: -1, // Índice da raspadinha sendo raspada
        isRaspando: false, // Flag para controle de raspagem
    },
    
    // Inicialização do módulo
    init: function() {
        console.log('Módulo de raspadinha inicializado');
        
        // Adicionar eventos para botões relacionados
        const btnVerValorGanho = document.getElementById('btn-ver-valor-ganho');
        if (btnVerValorGanho) {
            btnVerValorGanho.addEventListener('click', () => {
                this.salvarResultado();
            });
        }
    },
    
    // Gerar novas raspadinhas
    gerarRaspadinhas: function(quantidade) {
        console.log(`Gerando ${quantidade} raspadinhas...`);
        
        // Resetar estado
        this.resetState();
        
        // Definir quantidade total
        this.state.totalRaspadinhas = quantidade;
        
        // Gerar raspadinhas
        for (let i = 0; i < quantidade; i++) {
            const raspadinha = this.gerarRaspadinha();
            this.state.raspadinhas.push(raspadinha);
        }
        
        // Renderizar raspadinhas
        this.renderizarRaspadinhas();
        
        // Atualizar progresso
        this.atualizarProgresso();
    },
    
    // Gerar uma raspadinha individual
    gerarRaspadinha: function() {
        // Determinar se é premiada
        const premiada = Math.random() < this.config.chancePremio;
        
        // Se não for premiada, retorna valor zero
        if (!premiada) {
            return {
                valor: 0,
                raspada: false,
                icone: '💔',
                areaRaspada: 0
            };
        }
        
        // Se for premiada, determinar o valor
        let valorIndex = 0;
        const random = Math.random();
        let acumulado = 0;
        
        for (let i = 0; i < this.config.chancesValores.length; i++) {
            acumulado += this.config.chancesValores[i];
            if (random < acumulado) {
                valorIndex = i;
                break;
            }
        }
        
        const valor = this.config.valoresPremios[valorIndex];
        
        // Determinar ícone com base no valor
        let icone = '💰';
        if (valor >= 100) {
            icone = '🎉';
        } else if (valor >= 50) {
            icone = '🌟';
        } else if (valor >= 20) {
            icone = '💎';
        } else if (valor >= 10) {
            icone = '🍀';
        }
        
        return {
            valor,
            raspada: false,
            icone,
            areaRaspada: 0
        };
    },
    
    // Renderizar raspadinhas no container
    renderizarRaspadinhas: function() {
        const container = document.getElementById('raspadinhas-container');
        if (!container) {
            console.error('Container de raspadinhas não encontrado!');
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Adicionar cada raspadinha
        this.state.raspadinhas.forEach((raspadinha, index) => {
            const raspadinhaElement = document.createElement('div');
            raspadinhaElement.className = 'raspadinha';
            raspadinhaElement.dataset.index = index;
            
            // Adicionar classe se já estiver raspada
            if (raspadinha.raspada) {
                raspadinhaElement.classList.add('raspada');
            }
            
            // Conteúdo da raspadinha
            raspadinhaElement.innerHTML = `
                <div class="raspadinha-content">
                    <canvas class="raspadinha-canvas" width="200" height="200"></canvas>
                    <div class="raspadinha-premio">
                        <span class="premio-icon">${raspadinha.icone}</span>
                        <span class="premio">${raspadinha.valor > 0 ? `R$ ${raspadinha.valor},00` : 'Não foi dessa vez!'}</span>
                    </div>
                </div>
            `;
            
            // Adicionar ao container
            container.appendChild(raspadinhaElement);
            
            // Inicializar canvas após adicionar ao DOM
            this.inicializarCanvas(raspadinhaElement.querySelector('.raspadinha-canvas'), index);
        });
    },
    
    // Inicializar canvas para raspagem
    inicializarCanvas: function(canvas, index) {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Preencher com cor de raspagem
        ctx.fillStyle = '#AAAAAA';
        ctx.fillRect(0, 0, width, height);
        
        // Adicionar texto "Raspe aqui!"
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Poppins';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Raspe aqui!', width / 2, height / 2);
        
        // Adicionar eventos de raspagem
        canvas.addEventListener('mousedown', (e) => this.iniciarRaspagem(e, index));
        canvas.addEventListener('touchstart', (e) => this.iniciarRaspagem(e, index));
        
        canvas.addEventListener('mousemove', (e) => this.continuarRaspagem(e));
        canvas.addEventListener('touchmove', (e) => this.continuarRaspagem(e));
        
        canvas.addEventListener('mouseup', () => this.finalizarRaspagem());
        canvas.addEventListener('touchend', () => this.finalizarRaspagem());
        canvas.addEventListener('mouseleave', () => this.finalizarRaspagem());
        canvas.addEventListener('touchcancel', () => this.finalizarRaspagem());
    },
    
    // Iniciar raspagem
    iniciarRaspagem: function(event, index) {
        // Prevenir comportamento padrão
        event.preventDefault();
        
        // Verificar se já está raspada
        if (this.state.raspadinhas[index].raspada) return;
        
        // Definir estado de raspagem
        this.state.isRaspando = true;
        this.state.indexAtual = index;
        
        // Obter elemento da raspadinha
        const raspadinhaElement = event.target.closest('.raspadinha');
        this.state.raspadinhaAtual = raspadinhaElement;
        
        // Continuar raspagem com o evento atual
        this.continuarRaspagem(event);
    },
    
    // Continuar raspagem
    continuarRaspagem: function(event) {
        // Verificar se está raspando
        if (!this.state.isRaspando || this.state.indexAtual === -1) return;
        
        // Prevenir comportamento padrão
        event.preventDefault();
        
        // Obter canvas e contexto
        const canvas = this.state.raspadinhaAtual.querySelector('.raspadinha-canvas');
        const ctx = canvas.getContext('2d');
        
        // Obter posição do mouse/toque
        let x, y;
        
        if (event.type.startsWith('mouse')) {
            const rect = canvas.getBoundingClientRect();
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        } else {
            const rect = canvas.getBoundingClientRect();
            const touch = event.touches[0];
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
        }
        
        // Definir configuração de raspagem
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        
        // Desenhar círculo para simular raspagem
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Calcular área raspada
        this.calcularAreaRaspada(canvas, this.state.indexAtual);
    },
    
    // Finalizar raspagem
    finalizarRaspagem: function() {
        // Verificar se está raspando
        if (!this.state.isRaspando) return;
        
        // Resetar estado de raspagem
        this.state.isRaspando = false;
    },
    
    // Calcular área raspada
    calcularAreaRaspada: function(canvas, index) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let transparentPixels = 0;
        
        // Contar pixels transparentes
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] === 0) {
                transparentPixels++;
            }
        }
        
        // Calcular percentual de área raspada
        const totalPixels = canvas.width * canvas.height;
        const percentualRaspado = (transparentPixels / totalPixels) * 100;
        
        // Atualizar estado
        this.state.raspadinhas[index].areaRaspada = percentualRaspado;
        
        // Verificar se atingiu o limite para considerar raspada
        if (percentualRaspado >= this.config.areaRaspagem && !this.state.raspadinhas[index].raspada) {
            this.revelarRaspadinha(index);
        }
    },
    
    // Revelar raspadinha
    revelarRaspadinha: function(index) {
        // Marcar como raspada
        this.state.raspadinhas[index].raspada = true;
        
        // Adicionar classe visual
        const raspadinhaElement = document.querySelector(`.raspadinha[data-index="${index}"]`);
        if (raspadinhaElement) {
            raspadinhaElement.classList.add('raspada');
            
            // Revelar completamente o canvas
            const canvas = raspadinhaElement.querySelector('.raspadinha-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Incrementar contador
        this.state.raspadinhasRaspadas++;
        
        // Adicionar valor ao prêmio total
        this.state.premioTotal += this.state.raspadinhas[index].valor;
        
        // Atualizar progresso
        this.atualizarProgresso();
        
        // Verificar se todas foram raspadas
        if (this.state.raspadinhasRaspadas === this.state.totalRaspadinhas) {
            this.finalizarJogo();
        }
    },
    
    // Atualizar barra de progresso
    atualizarProgresso: function() {
        const progressText = document.getElementById('progress-text');
        const progressFill = document.getElementById('progress-fill');
        
        if (progressText && progressFill) {
            // Atualizar texto
            progressText.textContent = `Raspou ${this.state.raspadinhasRaspadas} de ${this.state.totalRaspadinhas} raspadinhas`;
            
            // Atualizar barra
            const percentual = (this.state.raspadinhasRaspadas / this.state.totalRaspadinhas) * 100;
            progressFill.style.width = `${percentual}%`;
        }
    },
    
    // Finalizar jogo
    finalizarJogo: function() {
        // Marcar como finalizado
        this.state.jogoFinalizado = true;
        
        // Mostrar botão de ver valor ganho
        const btnVerValorGanho = document.getElementById('btn-ver-valor-ganho');
        if (btnVerValorGanho) {
            btnVerValorGanho.style.display = 'block';
        }
    },
    
    // Salvar resultado no servidor
    salvarResultado: async function() {
        try {
            // Preparar dados
            const jogoData = {
                quantidade_raspadinhas: this.state.totalRaspadinhas,
                valor_total: this.state.totalRaspadinhas * this.config.valorRaspadinha,
                premio_total: this.state.premioTotal,
                detalhes: JSON.stringify(this.state.raspadinhas)
            };
            
            // Enviar para o servidor (simulado)
            console.log('Salvando resultado:', jogoData);
            
            // Exibir resultado
            this.exibirResultado();
            
        } catch (error) {
            console.error('Erro ao salvar resultado:', error);
            alert('Ocorreu um erro ao salvar o resultado. Tente novamente.');
        }
    },
    
    // Exibir resultado
    exibirResultado: function() {
        // Atualizar valor ganho
        const valorGanho = document.getElementById('valor-ganho');
        if (valorGanho) {
            valorGanho.textContent = this.formatarMoeda(this.state.premioTotal);
        }
        
        // Navegar para página de saque se ganhou algo
        if (this.state.premioTotal > 0) {
            showPage('page-saque');
        } else {
            // Se não ganhou, mostrar mensagem e voltar para compra
            alert('Não foi dessa vez! Tente novamente com mais raspadinhas.');
            showPage('page-compra');
        }
    },
    
    // Resetar estado
    resetState: function() {
        this.state.raspadinhas = [];
        this.state.raspadinhasRaspadas = 0;
        this.state.totalRaspadinhas = 0;
        this.state.premioTotal = 0;
        this.state.jogoFinalizado = false;
        this.state.areaRaspadaAtual = 0;
        this.state.raspadinhaAtual = null;
        this.state.indexAtual = -1;
        this.state.isRaspando = false;
        
        // Esconder botão de ver valor ganho
        const btnVerValorGanho = document.getElementById('btn-ver-valor-ganho');
        if (btnVerValorGanho) {
            btnVerValorGanho.style.display = 'none';
        }
    },
    
    // Formatar valor em moeda
    formatarMoeda: function(valor) {
        return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
    }
};
