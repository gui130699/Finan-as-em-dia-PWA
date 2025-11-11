// Finanças em Dia - Scripts JavaScript

// ==================== FUNÇÕES GERAIS ====================

// Formatar valores monetários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Confirmar ação com mensagem personalizada
function confirmarAcao(mensagem) {
    return confirm(mensagem);
}

// ==================== AUTO-DISMISSABLE ALERTS ====================

document.addEventListener('DOMContentLoaded', function() {
    // Auto fechar alertas após 5 segundos
    const alerts = document.querySelectorAll('.alert:not(.alert-info):not(.alert-warning)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});

// ==================== VALIDAÇÕES DE FORMULÁRIOS ====================

// Validar valores monetários
function validarValor(input) {
    const valor = parseFloat(input.value);
    if (isNaN(valor) || valor < 0) {
        input.setCustomValidity('Digite um valor válido');
        return false;
    }
    input.setCustomValidity('');
    return true;
}

// Validar datas
function validarData(inputInicial, inputFinal) {
    const dataInicial = new Date(inputInicial.value);
    const dataFinal = new Date(inputFinal.value);
    
    if (dataFinal < dataInicial) {
        inputFinal.setCustomValidity('A data final deve ser maior que a inicial');
        return false;
    }
    inputFinal.setCustomValidity('');
    return true;
}

// ==================== MÁSCARAS E FORMATAÇÃO ====================

// Máscara para valores monetários
function aplicarMascaraMoeda(input) {
    let valor = input.value.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    input.value = valor;
}

// ==================== ATALHOS DE TECLADO ====================

document.addEventListener('keydown', function(e) {
    // Ctrl + K para buscar
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[name="busca"]');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl + N para novo lançamento
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const dataInput = document.querySelector('#data');
        if (dataInput) dataInput.focus();
    }
});

// ==================== TOOLTIPS ====================

// Inicializar tooltips do Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// ==================== TABELAS INTERATIVAS ====================

// Destacar linha ao clicar
document.addEventListener('DOMContentLoaded', function() {
    const tableRows = document.querySelectorAll('.table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            // Não destacar se clicar em botão ou link
            if (e.target.tagName === 'BUTTON' || 
                e.target.tagName === 'A' || 
                e.target.closest('button') || 
                e.target.closest('a')) {
                return;
            }
            
            // Remover destaque anterior
            tableRows.forEach(r => r.classList.remove('table-active'));
            
            // Adicionar destaque à linha clicada
            this.classList.add('table-active');
        });
    });
});

// ==================== FILTROS DINÂMICOS ====================

// Filtrar tabela em tempo real
function filtrarTabela(inputBusca, tabelaId) {
    const filtro = inputBusca.value.toLowerCase();
    const tabela = document.getElementById(tabelaId);
    const linhas = tabela.getElementsByTagName('tr');
    
    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        const texto = linha.textContent.toLowerCase();
        
        if (texto.includes(filtro)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    }
}

// ==================== ANIMAÇÕES ====================

// Animar números (contadores)
function animarNumero(elemento, valorFinal, duracao = 1000) {
    const valorInicial = 0;
    const incremento = valorFinal / (duracao / 16);
    let valorAtual = valorInicial;
    
    const timer = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= valorFinal) {
            valorAtual = valorFinal;
            clearInterval(timer);
        }
        elemento.textContent = formatarMoeda(valorAtual);
    }, 16);
}

// ==================== LOCALSTORAGE ====================

// Salvar preferências do usuário
function salvarPreferencia(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

// Carregar preferências do usuário
function carregarPreferencia(chave) {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : null;
}

// ==================== EXPORTAÇÃO ====================

// Exportar tabela para CSV
function exportarTabelaCSV(tabelaId, nomeArquivo) {
    const tabela = document.getElementById(tabelaId);
    let csv = [];
    const linhas = tabela.querySelectorAll('tr');
    
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll('td, th');
        const dados = Array.from(colunas).map(col => col.textContent);
        csv.push(dados.join(','));
    });
    
    const csvString = csv.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// ==================== NOTIFICAÇÕES ====================

// Criar notificação toast
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${tipo} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${mensagem}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast"></button>
        </div>
    `;
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// ==================== UTILITÁRIOS ====================

// Copiar texto para área de transferência
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarToast('Copiado para área de transferência!', 'success');
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
}

// Imprimir página
function imprimirPagina() {
    window.print();
}

// ==================== DEBUG ====================

// Log de desenvolvimento
const DEBUG = false;

function log(mensagem, ...args) {
    if (DEBUG) {
        console.log(`[Finanças em Dia] ${mensagem}`, ...args);
    }
}

// Log inicial
log('Scripts carregados com sucesso!');
