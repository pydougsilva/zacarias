console.log("script carregado!")
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

// Event listener quando o formulário é enviado
document.getElementById('form-orcamento').addEventListener('submit', function(e) {
    e.preventDefault(); // Impede o recarregamento da página
    
    // Coleta dados do formulário
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const servicosSelecionados = document.querySelectorAll('input[name="servico"]:checked');
    const urgencia = parseFloat(document.getElementById('urgencia').value);
    const observacoes = document.getElementById('observacoes').value;

    // Validação básica
    if (servicosSelecionados.length === 0) {
        alert('Selecione pelo menos um serviço!');
        return;
    }

    // Calcula orçamento
    const orcamento = calcularOrcamento(servicosSelecionados, urgencia);
    
    // Exibe resultado
    exibirResultado(nome, telefone, servicosSelecionados, orcamento, observacoes, urgencia);
});

// Função para calcular o orçamento
function calcularOrcamento(servicos, multiplicadorUrgencia) {
    let total = 0;
    let servicosCalculados = [];

    servicos.forEach(servico => {
        const valor = precos[servico.value] * multiplicadorUrgencia;
        servicosCalculados.push({
            nome: nomesServicos[servico.value],
            valor: valor
        });
        total += valor;
    });

    return { servicos: servicosCalculados, total: total };
}

// Função para exibir o resultado
function exibirResultado(nome, telefone, servicos, orcamento, observacoes, urgencia) {
    const detalhes = document.getElementById('detalhes-orcamento');
    
    let html = `
        <p><strong>Cliente:</strong> ${nome}</p>
        <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
        <p><strong>Prazo:</strong> ${obterPrazo(urgencia)}</p>
        <hr>
        <h4>Serviços Selecionados:</h4>
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
        <div class="total">
            <span>Total: R$ ${orcamento.total.toFixed(2)}</span>
        </div>
    `;

    if (observacoes) {
        html += `<p><strong>Observações:</strong> ${observacoes}</p>`;
    }

    html += `<p><em>Orçamento válido por 30 dias</em></p>`;

    detalhes.innerHTML = html;
    document.getElementById('resultado').style.display = 'block';
    
    // Scroll para o resultado
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth' });
}

// Função auxiliar para obter texto do prazo
function obterPrazo(urgencia) {
    switch(urgencia) {
        case 1.0: return '5-7 dias úteis';
        case 1.2: return '2-3 dias úteis (+20%)';
        case 1.5: return '24 horas (+50%)';
        default: return 'A combinar';
    }
}

// Função para imprimir orçamento
function imprimirOrcamento() {
    window.print();
}

// Efeitos interativos adicionais
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.parentElement.style.background = '#e3f2fd';
        } else {
            this.parentElement.style.background = 'white';
        }
    });
});