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
        <div class="botoes-resultado">
            <button onclick="verificarLocalStorage()" class="btn-testar">🧪 Testar Armazenamento</button>
            <button onclick="gerarPDF(${JSON.stringify(orcamento).replace(/"/g, '&quot;')})" class="btn-pdf">📄 Gerar PDF Profissional</button>
            <button onclick="gerarPDFSimples(${JSON.stringify(orcamento).replace(/"/g, '&quot;')})" class="btn-pdf">⚡ PDF Rápido</button>
            <button onclick="limparFormulario()" class="btn-limpar">🆕 Novo Orçamento</button>
        </div>
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
// === FUNÇÕES PARA GERAÇÃO DE PDF ===

// Função para gerar PDF profissional
async function gerarPDF(orcamento) {
    console.log("📄 Iniciando geração de PDF...", orcamento.id);
    
    try {
        // Mostrar loading
        mostrarMensagemSucesso('Gerando PDF... ⏳');
        
        // Criar elemento temporário para o PDF
        const elementoPDF = criarEstruturaPDF(orcamento);
        
        // Adicionar ao DOM temporariamente
        document.body.appendChild(elementoPDF);
        
        // Gerar PDF
        await gerarPDFComHtml2canvas(elementoPDF, orcamento);
        
        // Remover elemento temporário
        document.body.removeChild(elementoPDF);
        
        console.log("✅ PDF gerado com sucesso!");
        
    } catch (erro) {
        console.error("❌ Erro ao gerar PDF:", erro);
        alert('Erro ao gerar PDF. Tente novamente.');
    }
}

// Função para criar a estrutura HTML do PDF
function criarEstruturaPDF(orcamento) {
    const container = document.createElement('div');
    container.className = 'container-pdf';
    container.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: 800px;
        background: white;
        padding: 30px;
        font-family: Arial, sans-serif;
    `;
    
    const dataEmissao = new Date().toLocaleDateString('pt-BR');
    
    container.innerHTML = `
        <div class="cabecalho-pdf">
            <h1>ORÇAMENTO - CADEIRA DE RODAS</h1>
            <div class="empresa">Sua Empresa de Consertos</div>
            <div class="empresa">CNPJ: 12.345.678/0001-90</div>
            <div class="empresa">Tel: (11) 9999-8888 | Email: contato@empresa.com</div>
        </div>
        
        <div class="info-orcamento-pdf">
            <div class="info-cliente-pdf">
                <h3>DADOS DO CLIENTE</h3>
                <p><strong>Nome:</strong> ${orcamento.cliente.nome}</p>
                <p><strong>Telefone:</strong> ${orcamento.cliente.telefone || 'Não informado'}</p>
                <p><strong>Email:</strong> ${orcamento.cliente.email || 'Não informado'}</p>
            </div>
            
            <div class="info-documento-pdf">
                <h3>DOCUMENTO</h3>
                <p><strong>Nº do Orçamento:</strong> ${orcamento.id}</p>
                <p><strong>Data de Emissão:</strong> ${dataEmissao}</p>
                <p><strong>Data do Serviço:</strong> ${orcamento.data}</p>
                <p><strong>Prazo de Validade:</strong> 30 dias</p>
            </div>
        </div>
        
        <div class="servicos-pdf">
            <h3>SERVIÇOS SOLICITADOS</h3>
            <table class="tabela-servicos-pdf">
                <thead>
                    <tr>
                        <th>Descrição do Serviço</th>
                        <th>Quantidade</th>
                        <th>Valor Unitário</th>
                        <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orcamento.servicos.map(servico => `
                        <tr>
                            <td>${servico.nome}</td>
                            <td>1</td>
                            <td>R$ ${servico.valor.toFixed(2)}</td>
                            <td>R$ ${servico.valor.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="total-pdf">
            <strong>TOTAL: R$ ${orcamento.total.toFixed(2)}</strong>
        </div>
        
        ${orcamento.observacoes ? `
        <div class="observacoes-pdf">
            <h3>OBSERVAÇÕES</h3>
            <p>${orcamento.observacoes}</p>
        </div>
        ` : ''}
        
        <div class="condicoes-pdf">
            <h3>CONDIÇÕES E PRAZOS</h3>
            <p><strong>Prazo de Execução:</strong> ${obterPrazo(orcamento.urgencia)}</p>
            <p><strong>Forma de Pagamento:</strong> À combinar</p>
            <p><strong>Garantia:</strong> 90 dias para serviços executados</p>
        </div>
        
        <div class="rodape-pdf">
            <p>Agradecemos pela preferência! Este orçamento é válido por 30 dias.</p>
            <p>Endereço: Rua Exemplo, 123 - Centro - São Paulo/SP - CEP: 01234-567</p>
        </div>
    `;
    
    return container;
}

// Função para gerar PDF usando html2canvas
async function gerarPDFComHtml2canvas(elemento, orcamento) {
    const { jsPDF } = window.jspdf;
    
    // Configurações do canvas
    const opcoes = {
        scale: 2,
        useCORS: true,
        logging: false
    };
    
    // Capturar o HTML como imagem
    const canvas = await html2canvas(elemento, opcoes);
    const imgData = canvas.toDataURL('image/png');
    
    // Criar PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calcular proporções da imagem
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgHeight / imgWidth;
    const pdfImgHeight = pdfWidth * ratio;
    
    // Adicionar imagem ao PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfImgHeight);
    
    // Se a imagem for maior que uma página, adicionar páginas extras
    let alturaRestante = pdfImgHeight - pdfHeight;
    let posicaoY = -pdfHeight;
    
    while (alturaRestante > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, posicaoY, pdfWidth, pdfImgHeight);
        alturaRestante -= pdfHeight;
        posicaoY -= pdfHeight;
    }
    
    // Salvar PDF
    pdf.save(`orcamento-${orcamento.id}.pdf`);
}

// Função simplificada para PDF rápido (alternativa)
function gerarPDFSimples(orcamento) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Configurações iniciais
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    
    // Cabeçalho
    pdf.text('ORÇAMENTO - CADEIRA DE RODAS', 20, 20);
    pdf.setFontSize(10);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    pdf.text(`Nº: ${orcamento.id}`, 150, 30);
    
    // Linha divisória
    pdf.line(20, 35, 190, 35);
    
    // Dados do cliente
    pdf.setFontSize(12);
    pdf.text('DADOS DO CLIENTE:', 20, 45);
    pdf.setFontSize(10);
    pdf.text(`Nome: ${orcamento.cliente.nome}`, 20, 55);
    pdf.text(`Telefone: ${orcamento.cliente.telefone || 'N/I'}`, 20, 62);
    pdf.text(`Email: ${orcamento.cliente.email || 'N/I'}`, 20, 69);
    
    // Serviços
    let y = 85;
    pdf.setFontSize(12);
    pdf.text('SERVIÇOS:', 20, y);
    y += 10;
    
    pdf.setFontSize(10);
    orcamento.servicos.forEach((servico, index) => {
        pdf.text(`${index + 1}. ${servico.nome}`, 25, y);
        pdf.text(`R$ ${servico.valor.toFixed(2)}`, 160, y);
        y += 7;
    });
    
    // Total
    y += 10;
    pdf.setFontSize(12);
    pdf.text(`TOTAL: R$ ${orcamento.total.toFixed(2)}`, 160, y);
    
    // Observações
    if (orcamento.observacoes) {
        y += 15;
        pdf.setFontSize(12);
        pdf.text('OBSERVAÇÕES:', 20, y);
        y += 7;
        pdf.setFontSize(10);
        
        // Quebrar texto longo
        const observacoes = pdf.splitTextToSize(orcamento.observacoes, 170);
        pdf.text(observacoes, 20, y);
    }
    
    // Rodapé
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(8);
    pdf.text('Agradecemos pela preferência! Orçamento válido por 30 dias.', 20, pageHeight - 20);
    
    // Salvar
    pdf.save(`orcamento-${orcamento.id}.pdf`);
}

// Inicialização ao carregar a página
console.log("🚀 Sistema de orçamentos inicializado!");