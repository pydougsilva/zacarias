// Preços dos serviços
const precos = {
    roda: 150.00,
    freio: 80.00,
    estofamento: 200.00,
    eixo: 120.00,
    manutencao: 100.00
};

// Nomes completos dos serviços
const nomesServicos = {
    roda: "Troca de Roda",
    freio: "Ajuste de Freio",
    estofamento: "Recuperação de Estofamento",
    eixo: "Alinhamento de Eixo",
    manutencao: "Manutenção Preventiva"
};

// === CONTROLE DE EDIÇÃO ===
let orcamentoEditando = null;
let modoEdicao = false;

// === LOCALSTORAGE - FUNÇÕES BÁSICAS ===

// Função para gerar um ID único para cada orçamento
function gerarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para SALVAR um orçamento no localStorage
function salvarOrcamentoNoLocalStorage(orcamento) {
    console.log("💾 Tentando salvar orçamento...");
    
    try {
        // 1. Primeiro, pegamos todos os orçamentos existentes
        const orcamentosExistentes = JSON.parse(localStorage.getItem('orcamentosCadeiraRodas')) || [];
        console.log("📂 Orçamentos existentes:", orcamentosExistentes.length);
        
        // 2. Adicionamos o novo orçamento à lista
        orcamentosExistentes.push(orcamento);
        
        // 3. Salvamos a lista atualizada de volta no localStorage
        localStorage.setItem('orcamentosCadeiraRodas', JSON.stringify(orcamentosExistentes));
        
        console.log("✅ Orçamento salvo com sucesso! ID:", orcamento.id);
        return true;
        
    } catch (erro) {
        console.error("❌ Erro ao salvar no localStorage:", erro);
        return false;
    }
}

// Função para CARREGAR orçamentos do localStorage
function carregarOrcamentosDoLocalStorage() {
    try {
        const orcamentos = JSON.parse(localStorage.getItem('orcamentosCadeiraRodas')) || [];
        console.log("📂 Orçamentos carregados:", orcamentos.length);
        return orcamentos;
    } catch (erro) {
        console.error("❌ Erro ao carregar do localStorage:", erro);
        return [];
    }
}

// Função para ATUALIZAR orçamento existente no localStorage
function atualizarOrcamentoNoLocalStorage(id, orcamentoAtualizado) {
    console.log("🔄 Atualizando orçamento:", id);
    
    try {
        const orcamentos = carregarOrcamentosDoLocalStorage();
        const index = orcamentos.findIndex(orc => orc.id === id);
        
        if (index === -1) {
            console.error("❌ Orçamento não encontrado para atualização");
            return false;
        }
        
        // Mantém o ID, data original e timestamp original
        orcamentoAtualizado.id = id;
        orcamentoAtualizado.data = orcamentos[index].data;
        orcamentoAtualizado.timestamp = orcamentos[index].timestamp;
        
        // Atualiza o orçamento
        orcamentos[index] = orcamentoAtualizado;
        localStorage.setItem('orcamentosCadeiraRodas', JSON.stringify(orcamentos));
        
        console.log("✅ Orçamento atualizado com sucesso!");
        return true;
        
    } catch (erro) {
        console.error("❌ Erro ao atualizar orçamento:", erro);
        return false;
    }
}

// DEBUG: Verifica se script carregou
console.log("🔧 script.js carregado com sucesso!");

// Aguarda o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado!");
    
    // Carrega orçamentos existentes ao iniciar
    const orcamentosSalvos = carregarOrcamentosDoLocalStorage();
    console.log("💾 Orçamentos na memória:", orcamentosSalvos.length);
    
    const form = document.getElementById('form-orcamento');
    
    if (!form) {
        console.error("❌ Formulário não encontrado!");
        return;
    }
    
    console.log("✅ Formulário encontrado, adicionando event listener...");
    
    // Event listener para o formulário - AGORA COM EDIÇÃO
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("🎯 Formulário submetido - Modo:", modoEdicao ? "EDIÇÃO" : "CRIAÇÃO");
        
        // Coleta dados do formulário
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;
        const servicosSelecionados = document.querySelectorAll('input[name="servico"]:checked');
        const urgencia = parseFloat(document.getElementById('urgencia').value);
        const observacoes = document.getElementById('observacoes').value;

        console.log("📊 Dados coletados:", {
            nome: nome,
            servicos: servicosSelecionados.length,
            urgencia: urgencia
        });

        // Validação
        if (servicosSelecionados.length === 0) {
            alert('❌ Selecione pelo menos um serviço!');
            return;
        }

        if (!nome.trim()) {
            alert('❌ Digite o nome do cliente!');
            return;
        }

        // Calcula orçamento
        const calculoOrcamento = calcularOrcamento(servicosSelecionados, urgencia);
        console.log("💰 Orçamento calculado:", calculoOrcamento);
        
        if (modoEdicao && orcamentoEditando) {
            // === MODO EDIÇÃO ===
            const orcamentoAtualizado = {
                cliente: {
                    nome: nome.trim(),
                    telefone: telefone.trim(),
                    email: email.trim()
                },
                servicos: calculoOrcamento.servicos,
                total: calculoOrcamento.total,
                urgencia: urgencia,
                observacoes: observacoes.trim(),
                status: 'pendente'
            };

            // ATUALIZA no localStorage
            const atualizou = atualizarOrcamentoNoLocalStorage(orcamentoEditando, orcamentoAtualizado);
            
            if (atualizou) {
                // Exibe resultado atualizado
                const orcamentos = carregarOrcamentosDoLocalStorage();
                const orcamentoCompleto = orcamentos.find(orc => orc.id === orcamentoEditando);
                
                exibirResultado(orcamentoCompleto);
                mostrarMensagemSucesso('Orçamento atualizado com sucesso! ✏️');
                carregarHistorico();
                
                // Volta ao modo normal
                cancelarEdicao();
            } else {
                alert('❌ Erro ao atualizar orçamento. Tente novamente.');
            }
            
        } else {
            // === MODO CRIAÇÃO ===
            const orcamentoCompleto = {
                id: gerarIdUnico(),
                data: new Date().toLocaleString('pt-BR'),
                timestamp: Date.now(),
                cliente: {
                    nome: nome.trim(),
                    telefone: telefone.trim(),
                    email: email.trim()
                },
                servicos: calculoOrcamento.servicos,
                total: calculoOrcamento.total,
                urgencia: urgencia,
                observacoes: observacoes.trim(),
                status: 'pendente'
            };

            // SALVA no localStorage
            const salvou = salvarOrcamentoNoLocalStorage(orcamentoCompleto);
            
            if (salvou) {
                exibirResultado(orcamentoCompleto);
                mostrarMensagemSucesso('Orçamento salvo com sucesso! ✅');
                carregarHistorico();
            } else {
                alert('❌ Erro ao salvar orçamento. Tente novamente.');
            }
        }
    });

    // Event listener para o botão cancelar edição
    document.getElementById('btn-cancelar-edicao').addEventListener('click', cancelarEdicao);
    
    // Carregar histórico ao iniciar
    carregarHistorico();
});

// Função para calcular orçamento
function calcularOrcamento(servicos, multiplicadorUrgencia) {
    let total = 0;
    let servicosCalculados = [];

    servicos.forEach(servico => {
        const valorBase = precos[servico.value];
        const valorFinal = valorBase * multiplicadorUrgencia;
        
        servicosCalculados.push({
            nome: nomesServicos[servico.value],
            valor: valorFinal,
            valorBase: valorBase,
            multiplicador: multiplicadorUrgencia
        });
        total += valorFinal;
    });

    return { 
        servicos: servicosCalculados, 
        total: total
    };
}

// Função para exibir resultado
function exibirResultado(orcamento) {
    const detalhes = document.getElementById('detalhes-orcamento');
    const resultadoDiv = document.getElementById('resultado');

    if (!detalhes || !resultadoDiv) {
        console.error("❌ Elementos de resultado não encontrados!");
        return;
    }

    let html = `
        <div class="cliente-info">
            <p><strong>📋 Nº do Orçamento:</strong> ${orcamento.id}</p>
            <p><strong>📅 Data:</strong> ${orcamento.data}</p>
            <p><strong>👤 Cliente:</strong> ${orcamento.cliente.nome}</p>
            <p><strong>📞 Telefone:</strong> ${orcamento.cliente.telefone || 'Não informado'}</p>
            <p><strong>📧 Email:</strong> ${orcamento.cliente.email || 'Não informado'}</p>
            <p><strong>⏰ Prazo:</strong> ${obterPrazo(orcamento.urgencia)}</p>
            <p><strong>📊 Status:</strong> <span class="status-pendente">Pendente</span></p>
        </div>
        <hr>
        <div class="servicos-list">
            <h4>🔧 Serviços Selecionados:</h4>
    `;

    orcamento.servicos.forEach(servico => {
        html += `
            <div class="servico-item">
                <span>${servico.nome}</span>
                <span>R$ ${servico.valor.toFixed(2)}</span>
            </div>
        `;
    });

    html += `
        </div>
        <div class="total">
            <strong>💰 Total: R$ ${orcamento.total.toFixed(2)}</strong>
        </div>
    `;

    if (orcamento.observacoes && orcamento.observacoes.trim() !== '') {
        html += `<div class="observacoes"><strong>📝 Observações:</strong> ${orcamento.observacoes}</div>`;
    }

    html += `
        <p><em>✅ Orçamento salvo no histórico - Válido por 30 dias</em></p>
        <button onclick="verificarLocalStorage()" class="btn-testar">🧪 Testar Armazenamento</button>
        <button onclick="limparFormulario()" class="btn-limpar">🆕 Novo Orçamento</button>
    `;

    detalhes.innerHTML = html;
    resultadoDiv.style.display = 'block';
    resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    
    console.log("📋 Resultado exibido na tela!");
}

// === FUNÇÕES DE EDIÇÃO ===

// Função para preencher formulário com dados de um orçamento existente
function preencherFormularioEdicao(orcamento) {
    console.log("✏️ Preenchendo formulário para edição:", orcamento.id);
    
    // Preenche dados básicos
    document.getElementById('nome').value = orcamento.cliente.nome;
    document.getElementById('telefone').value = orcamento.cliente.telefone || '';
    document.getElementById('email').value = orcamento.cliente.email || '';
    document.getElementById('urgencia').value = orcamento.urgencia;
    document.getElementById('observacoes').value = orcamento.observacoes || '';
    
    // Limpa seleções anteriores
    document.querySelectorAll('input[name="servico"]').forEach(checkbox => {
        checkbox.checked = false;
        checkbox.parentElement.style.background = 'white';
        checkbox.parentElement.style.transform = 'scale(1)';
    });
    
    // Marca os serviços selecionados originalmente
    orcamento.servicos.forEach(servico => {
        const servicoKey = Object.keys(nomesServicos).find(
            key => nomesServicos[key] === servico.nome
        );
        
        if (servicoKey) {
            const checkbox = document.querySelector(`input[name="servico"][value="${servicoKey}"]`);
            if (checkbox) {
                checkbox.checked = true;
                checkbox.parentElement.style.background = '#e3f2fd';
                checkbox.parentElement.style.transform = 'scale(1.02)';
            }
        }
    });
    
    // Ativa modo de edição
    modoEdicao = true;
    orcamentoEditando = orcamento.id;
    
    // Atualiza interface para modo edição
    document.getElementById('btn-submit').textContent = '💾 Atualizar Orçamento';
    document.getElementById('btn-cancelar-edicao').style.display = 'block';
    document.getElementById('form-orcamento').classList.add('modo-edicao');
    
    // Scroll para o formulário
    document.getElementById('form-orcamento').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    console.log("✅ Formulário pronto para edição");
}

// Função para cancelar edição e voltar ao modo normal
function cancelarEdicao() {
    modoEdicao = false;
    orcamentoEditando = null;
    
    // Restaura interface normal
    document.getElementById('btn-submit').textContent = 'Gerar Orçamento';
    document.getElementById('btn-cancelar-edicao').style.display = 'none';
    document.getElementById('form-orcamento').classList.remove('modo-edicao');
    
    // Limpa formulário
    document.getElementById('form-orcamento').reset();
    
    // Limpa efeitos visuais dos checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.parentElement.style.background = 'white';
        checkbox.parentElement.style.transform = 'scale(1)';
    });
    
    console.log("❌ Edição cancelada");
}

// === FUNÇÕES DO HISTÓRICO ===

// Função para carregar e exibir o histórico
function carregarHistorico(filtro = 'todos') {
    const orcamentos = carregarOrcamentosDoLocalStorage();
    const listaOrcamentos = document.getElementById('lista-orcamentos');
    const semOrcamentosDiv = document.getElementById('sem-orcamentos');
    const totalOrcamentosSpan = document.getElementById('total-orcamentos');
    const totalValorSpan = document.getElementById('total-valor');

    // Atualizar estatísticas
    totalOrcamentosSpan.textContent = `Total: ${orcamentos.length}`;
    
    const valorTotal = orcamentos.reduce((total, orc) => total + orc.total, 0);
    totalValorSpan.textContent = `Valor Total: R$ ${valorTotal.toFixed(2)}`;

    // Mostrar/ocultar seção de histórico
    const historicoSection = document.getElementById('historico-orcamentos');
    if (orcamentos.length > 0) {
        historicoSection.classList.add('mostrar');
        semOrcamentosDiv.style.display = 'none';
        listaOrcamentos.style.display = 'block';
    } else {
        semOrcamentosDiv.style.display = 'block';
        listaOrcamentos.style.display = 'none';
        return;
    }

    // Aplicar filtro
    let orcamentosFiltrados = orcamentos;
    if (filtro !== 'todos') {
        orcamentosFiltrados = orcamentos.filter(orc => orc.status === filtro);
    }

    // Ordenar por data (mais recente primeiro)
    orcamentosFiltrados.sort((a, b) => b.timestamp - a.timestamp);

    // Gerar HTML da lista
    let html = '';
    orcamentosFiltrados.forEach((orcamento, index) => {
        html += `
            <div class="item-orcamento" data-id="${orcamento.id}">
                <div class="cabecalho-orcamento">
                    <h4>Orçamento #${index + 1} - ${orcamento.cliente.nome}</h4>
                    <span class="status-badge status-${orcamento.status}">${orcamento.status}</span>
                </div>
                
                <div class="info-cliente">
                    <strong>📅:</strong> ${orcamento.data} | 
                    <strong>📞:</strong> ${orcamento.cliente.telefone || 'N/I'} | 
                    <strong>📧:</strong> ${orcamento.cliente.email || 'N/I'}
                </div>

                <div class="detalhes-servicos">
                    <strong>🔧 Serviços (${orcamento.servicos.length}):</strong>
                    ${orcamento.servicos.slice(0, 2).map(servico => `
                        <div class="servico-resumo">
                            <span>${servico.nome}</span>
                            <span>R$ ${servico.valor.toFixed(2)}</span>
                        </div>
                    `).join('')}
                    ${orcamento.servicos.length > 2 ? `<div>+ ${orcamento.servicos.length - 2} outros serviços</div>` : ''}
                </div>

                <div class="total-item">
                    <strong>💰 Total: R$ ${orcamento.total.toFixed(2)}</strong>
                </div>

                <div class="rodape-orcamento">
                    <div>
                        <strong>⏰ Prazo:</strong> ${obterPrazo(orcamento.urgencia)}
                    </div>
                    <div class="acoes-orcamento">
                        <button class="btn-acao btn-visualizar" onclick="visualizarOrcamento('${orcamento.id}')">
                            👁️ Visualizar
                        </button>
                        <button class="btn-acao btn-editar" onclick="editarOrcamento('${orcamento.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn-acao btn-excluir" onclick="excluirOrcamento('${orcamento.id}')">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    listaOrcamentos.innerHTML = html;
}

// Função para filtrar o histórico
function filtrarHistorico(filtro) {
    // Atualizar botões ativos
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.classList.remove('ativo');
    });
    event.target.classList.add('ativo');
    
    carregarHistorico(filtro);
}

// Função para visualizar um orçamento completo
function visualizarOrcamento(id) {
    const orcamentos = carregarOrcamentosDoLocalStorage();
    const orcamento = orcamentos.find(orc => orc.id === id);
    
    if (orcamento) {
        // Usa a função existente de exibir resultado
        exibirResultado(orcamento);
        
        // Adiciona botão de voltar ao histórico
        const detalhes = document.getElementById('detalhes-orcamento');
        detalhes.innerHTML += `
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="carregarHistorico()" class="btn-testar">📊 Voltar ao Histórico</button>
            </div>
        `;
    }
}

// Função para editar orçamento
function editarOrcamento(id) {
    const orcamentos = carregarOrcamentosDoLocalStorage();
    const orcamento = orcamentos.find(orc => orc.id === id);
    
    if (orcamento) {
        preencherFormularioEdicao(orcamento);
    } else {
        alert('❌ Orçamento não encontrado!');
    }
}

// Função para excluir um orçamento
function excluirOrcamento(id) {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
        const orcamentos = carregarOrcamentosDoLocalStorage();
        const orcamentosAtualizados = orcamentos.filter(orc => orc.id !== id);
        
        localStorage.setItem('orcamentosCadeiraRodas', JSON.stringify(orcamentosAtualizados));
        
        mostrarMensagemSucesso('Orçamento excluído com sucesso! 🗑️');
        carregarHistorico();
    }
}

// Função para limpar todo o histórico
function limparHistorico() {
    if (confirm('⚠️ ATENÇÃO: Isso excluirá TODOS os orçamentos salvos. Tem certeza?')) {
        localStorage.removeItem('orcamentosCadeiraRodas');
        mostrarMensagemSucesso('Histórico limpo com sucesso! 🧹');
        carregarHistorico();
    }
}

// === FUNÇÕES AUXILIARES ===

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    const mensagemDiv = document.createElement('div');
    mensagemDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    mensagemDiv.textContent = mensagem;
    
    document.body.appendChild(mensagemDiv);
    
    setTimeout(() => {
        mensagemDiv.remove();
    }, 3000);
}

// Função para testar se o localStorage está funcionando
function verificarLocalStorage() {
    const orcamentos = carregarOrcamentosDoLocalStorage();
    const mensagem = `📊 Total de orçamentos salvos: ${orcamentos.length}\n\n` +
                    `Último orçamento: ${orcamentos.length > 0 ? orcamentos[orcamentos.length - 1].cliente.nome : 'Nenhum'}\n\n` +
                    `Veja os dados completos no Console (F12)`;
    
    alert(mensagem);
    console.log("💾 Orçamentos no localStorage:", orcamentos);
}

// Função para limpar formulário e criar novo orçamento
function limparFormulario() {
    document.getElementById('form-orcamento').reset();
    document.getElementById('resultado').style.display = 'none';
    
    // Remove efeitos visuais dos checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.parentElement.style.background = 'white';
        checkbox.parentElement.style.transform = 'scale(1)';
    });
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log("🆕 Formulário limpo para novo orçamento");
}

// Função para obter texto do prazo
function obterPrazo(urgencia) {
    const prazos = {
        1.0: '5-7 dias úteis',
        1.2: '2-3 dias úteis (+20%)', 
        1.5: '24 horas (+50%)'
    };
    return prazos[urgencia] || 'A combinar';
}

// Efeitos visuais para checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.parentElement.style.background = '#e3f2fd';
            this.parentElement.style.transform = 'scale(1.02)';
        } else {
            this.parentElement.style.background = 'white';
            this.parentElement.style.transform = 'scale(1)';
        }
    });
});

// Função de impressão
function imprimirOrcamento() {
    console.log("🖨️ Imprimindo orçamento...");
    window.print();
}

// Inicialização ao carregar a página
console.log("🚀 Sistema de orçamentos inicializado!");