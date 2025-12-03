// ============================================
// FINANCEIRO EM DIA - PWA
// Todas as funcionalidades do Flask convertidas para JavaScript
// Versão: 2025-11-15 00:00 - Modal seleção parcelas e checkbox parcelado
// ============================================

// Configuração do Supabase
// As credenciais são carregadas do index.html ou config.local.js
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || '';
const SUPABASE_KEY = window.SUPABASE_CONFIG?.key || '';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Estado global
let currentUser = null;
let currentPage = 'login';
let categorias = [];
let contasFixas = [];
let mesAtual = new Date().toISOString().slice(0, 7);

// ============================================
// UTILITÁRIOS - TRATAMENTO DE ERROS
// ============================================

/**
 * Função auxiliar para tratamento de erros
 * @param {Error} error - Objeto de erro
 * @param {string} contexto - Contexto onde o erro ocorreu
 * @param {boolean} mostrarAlerta - Se deve mostrar alerta ao usuário
 * @returns {string} Mensagem de erro formatada
 */
function tratarErro(error, contexto = '', mostrarAlerta = true) {
    console.error(`❌ Erro${contexto ? ' em ' + contexto : ''}:`, error);
    
    let mensagem = 'Ocorreu um erro inesperado.';
    
    // Identificar tipo de erro
    if (error.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            mensagem = 'Erro de conexão. Verifique sua internet.';
        } else if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
            mensagem = 'Este registro já existe.';
        } else if (error.message.includes('not found') || error.message.includes('No rows')) {
            mensagem = 'Registro não encontrado.';
        } else if (error.message.includes('permission') || error.message.includes('RLS')) {
            mensagem = 'Permissão negada. Faça login novamente.';
        } else {
            mensagem = error.message;
        }
    }
    
    if (mostrarAlerta) {
        showAlert(mensagem, 'danger');
    }
    
    return mensagem;
}

/**
 * Validar valor monetário
 * @param {number} valor - Valor a validar
 * @returns {object} {valido: boolean, erro: string}
 */
function validarValor(valor) {
    if (!valor || isNaN(valor)) {
        return { valido: false, erro: 'Valor inválido' };
    }
    if (valor <= 0) {
        return { valido: false, erro: 'O valor deve ser maior que zero' };
    }
    if (valor > 1000000000) {
        return { valido: false, erro: 'Valor muito alto (máximo R$ 1 bilhão)' };
    }
    return { valido: true };
}

/**
 * Validar descrição
 * @param {string} descricao - Descrição a validar
 * @returns {object} {valido: boolean, erro: string}
 */
function validarDescricao(descricao) {
    const desc = descricao.trim();
    if (!desc) {
        return { valido: false, erro: 'Descrição é obrigatória' };
    }
    if (desc.length < 3) {
        return { valido: false, erro: 'Descrição muito curta (mínimo 3 caracteres)' };
    }
    if (desc.length > 200) {
        return { valido: false, erro: 'Descrição muito longa (máximo 200 caracteres)' };
    }
    return { valido: true };
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    // Atualiza status a cada 3 segundos para detectar mudanças
    setInterval(updateConnectionStatus, 3000);
});

function updateConnectionStatus() {
    const statusEl = document.getElementById('status-conexao');
    if (statusEl) {
        const isOnline = navigator.onLine;
        statusEl.innerHTML = isOnline ? 
            '<i class="bi bi-wifi"></i> Online' : 
            '<i class="bi bi-wifi-off"></i> Offline';
        statusEl.className = isOnline ? 'nav-link text-success' : 'nav-link text-warning';
    }
}

async function checkAuth() {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (userId && userName) {
        currentUser = { id: parseInt(userId), nome: userName };
        showPage('home');
    } else {
        showPage('login');
    }
}

// ============================================
// NAVEGAÇÃO E PÁGINAS
// ============================================

async function showPage(page) {
    currentPage = page;
    const app = document.getElementById('app');
    
    switch(page) {
        case 'login':
            app.innerHTML = getLoginHTML();
            break;
        case 'register':
            app.innerHTML = getRegisterHTML();
            break;
        case 'home':
            app.innerHTML = getHomeHTML();
            await loadDashboard();
            break;
        case 'lancamentos':
            app.innerHTML = getLancamentosHTML();
            await loadCategorias();
            await loadLancamentos();
            const hoje = new Date();
            const dataLocal = hoje.getFullYear() + '-' + 
                String(hoje.getMonth() + 1).padStart(2, '0') + '-' + 
                String(hoje.getDate()).padStart(2, '0');
            document.getElementById('lanc-data').value = dataLocal;
            inicializarFormularioLancamento();
            break;
        case 'categorias':
            app.innerHTML = getCategoriasHTML();
            await loadCategoriasPage();
            break;
        case 'contas_fixas':
            app.innerHTML = getContasFixasHTML();
            await loadCategorias();
            await loadContasFixas();
            break;
        case 'contas_parceladas':
            app.innerHTML = getContasParceladasHTML();
            await loadContasParceladas();
            break;
        case 'relatorios':
            app.innerHTML = getRelatoriosHTML();
            await loadRelatorios();
            break;
        case 'importar_ofx':
            app.innerHTML = getImportarOFXHTML();
            await initImportarOFX();
            break;
        case 'ajuda':
            app.innerHTML = getAjudaHTML();
            break;
        default:
            app.innerHTML = getLoginHTML();
    }
    
    updateConnectionStatus();
}

// ============================================
// AJUDA
// ============================================

function getAjudaHTML() {
    return `
        ${getNavbar('ajuda')}
        <div class="container mt-4">
            <h2><i class="bi bi-question-circle"></i> Central de Ajuda</h2>
            <p class="lead">Guia completo de funcionalidades do Finanças em Dia</p>
            
            <div class="accordion" id="accordionAjuda">
                
                <!-- Dashboard -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#dashboard">
                            <i class="bi bi-house-door me-2"></i> Dashboard (Home)
                        </button>
                    </h2>
                    <div id="dashboard" class="accordion-collapse collapse show" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>📊 Visão Geral Financeira</h5>
                            <p>A página inicial mostra um resumo completo das suas finanças do mês atual:</p>
                            
                            <h6>Cards Informativos:</h6>
                            <ul>
                                <li><strong>Receitas Recebidas:</strong> Total de receitas já pagas no mês</li>
                                <li><strong>Despesas Pagas:</strong> Total de despesas já quitadas</li>
                                <li><strong>Saldo Atual:</strong> Diferença entre receitas e despesas pagas</li>
                                <li><strong>Saldo Previsto:</strong> Projeção incluindo valores pendentes</li>
                            </ul>
                            
                            <h6>🔔 Avisos de Vencimento:</h6>
                            <ul>
                                <li><span class="badge bg-danger">VENCIDAS</span> Contas com data passada</li>
                                <li><span class="badge bg-warning">VENCEM HOJE</span> Contas que vencem hoje</li>
                                <li><span class="badge" style="background-color: #fff3cd; color: #000;">PRÓXIMOS 3 DIAS</span> Urgente</li>
                                <li><span class="badge bg-secondary">PRÓXIMOS 7 DIAS</span> Atenção</li>
                            </ul>
                            
                            <h6>📈 Análises:</h6>
                            <ul>
                                <li><strong>Comparativo Mensal:</strong> Compara gastos do mês atual vs anterior com % de variação</li>
                                <li><strong>Top 5 Categorias:</strong> Maiores gastos por categoria com barras de progresso</li>
                            </ul>
                            
                            <h6>💰 Previsão de Saldo:</h6>
                            <p>Mostra o saldo projetado para o final do mês considerando todas as contas a receber e a pagar pendentes.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Lançamentos -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#lancamentos">
                            <i class="bi bi-journal-text me-2"></i> Lançamentos
                        </button>
                    </h2>
                    <div id="lancamentos" class="accordion-collapse collapse" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>💸 Gestão de Receitas e Despesas</h5>
                            
                            <h6>Como Adicionar:</h6>
                            <ol>
                                <li>Preencha a <strong>Data</strong>, <strong>Descrição</strong> e <strong>Categoria</strong></li>
                                <li>Insira o <strong>Valor</strong></li>
                                <li>Clique em <strong>Adicionar</strong></li>
                            </ol>
                            <p><em>Nota: O tipo (receita/despesa) é determinado automaticamente pela categoria selecionada.</em></p>
                            
                            <h6>✅ Lançamento Parcelado:</h6>
                            <p>Marque o checkbox <strong>"Lançamento Parcelado"</strong> para dividir um valor em várias parcelas:</p>
                            <ul>
                                <li><strong>Número de Parcelas:</strong> Quantidade de vezes que será dividido</li>
                                <li><strong>Data de Vencimento:</strong> Primeiro vencimento (parcelas seguem mensalmente)</li>
                                <li><strong>Tipo de Valor:</strong>
                                    <ul>
                                        <li><em>Valor Total:</em> Sistema divide automaticamente</li>
                                        <li><em>Valor da Parcela:</em> Você informa o valor de cada parcela</li>
                                    </ul>
                                </li>
                            </ul>
                            
                            <h6>🔄 Conta Fixa:</h6>
                            <p>Marque <strong>"Conta Fixa"</strong> para contas recorrentes todo mês:</p>
                            <ul>
                                <li>Sistema cria automaticamente a conta fixa</li>
                                <li>Aparece na aba "Contas Fixas" para gestão</li>
                                <li>Pode gerar lançamentos automaticamente todo mês</li>
                            </ul>
                            
                            <h6>Ações Disponíveis:</h6>
                            <ul>
                                <li><i class="bi bi-info-circle text-info"></i> <strong>Info:</strong> Ver detalhes da quitação (se houver)</li>
                                <li><i class="bi bi-check-circle text-success"></i> <strong>Quitar:</strong> Marcar parcela como paga</li>
                                <li><i class="bi bi-pencil text-primary"></i> <strong>Editar:</strong> Alterar dados do lançamento</li>
                                <li><i class="bi bi-trash text-danger"></i> <strong>Excluir:</strong> Remover lançamento</li>
                            </ul>
                            
                            <h6>🔍 Filtros:</h6>
                            <p>Filtre por <strong>Tipo</strong>, <strong>Status</strong>, <strong>Categoria</strong> e <strong>Mês/Ano</strong></p>
                            
                            <h6>📅 Gerar Contas Fixas do Mês:</h6>
                            <p>Botão para gerar automaticamente todas as contas fixas ativas do mês selecionado.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Categorias -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#categorias">
                            <i class="bi bi-tags me-2"></i> Categorias
                        </button>
                    </h2>
                    <div id="categorias" class="accordion-collapse collapse" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>🏷️ Organização de Lançamentos</h5>
                            
                            <h6>O que são Categorias?</h6>
                            <p>Categorias ajudam a organizar seus lançamentos em grupos como Alimentação, Transporte, Salário, etc.</p>
                            
                            <h6>Como Criar:</h6>
                            <ol>
                                <li>Digite o <strong>Nome</strong> da categoria</li>
                                <li>Selecione o <strong>Tipo</strong>:
                                    <ul>
                                        <li><span class="badge bg-success">Receita</span> Para entradas de dinheiro</li>
                                        <li><span class="badge bg-danger">Despesa</span> Para saídas de dinheiro</li>
                                    </ul>
                                </li>
                                <li>Clique em <strong>Adicionar Categoria</strong></li>
                            </ol>
                            
                            <h6>Gerenciamento:</h6>
                            <ul>
                                <li><i class="bi bi-pencil text-primary"></i> <strong>Editar:</strong> Alterar nome ou tipo</li>
                                <li><i class="bi bi-trash text-danger"></i> <strong>Excluir:</strong> Remover categoria (apenas se não tiver lançamentos)</li>
                            </ul>
                            
                            <h6>💡 Dica:</h6>
                            <p>Crie categorias antes de adicionar lançamentos para facilitar a organização!</p>
                            
                            <h6>Exemplos de Categorias:</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <strong>Receitas:</strong>
                                    <ul>
                                        <li>Salário</li>
                                        <li>Freelance</li>
                                        <li>Investimentos</li>
                                        <li>Outros</li>
                                    </ul>
                                </div>
                                <div class="col-md-6">
                                    <strong>Despesas:</strong>
                                    <ul>
                                        <li>Alimentação</li>
                                        <li>Transporte</li>
                                        <li>Moradia</li>
                                        <li>Educação</li>
                                        <li>Lazer</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contas Fixas -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#contasFixas">
                            <i class="bi bi-arrow-repeat me-2"></i> Contas Fixas
                        </button>
                    </h2>
                    <div id="contasFixas" class="accordion-collapse collapse" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>🔄 Contas Recorrentes</h5>
                            
                            <h6>O que são Contas Fixas?</h6>
                            <p>Contas que se repetem todo mês, como aluguel, internet, academia, assinaturas, etc.</p>
                            
                            <h6>Como Criar:</h6>
                            <p>Ao adicionar um lançamento, marque o checkbox <strong>"Conta Fixa"</strong>. O sistema cria automaticamente a conta fixa com:</p>
                            <ul>
                                <li>Descrição do lançamento</li>
                                <li>Categoria</li>
                                <li>Valor fixo</li>
                                <li>Dia de vencimento (extraído da data)</li>
                            </ul>
                            
                            <h6>Gerenciamento:</h6>
                            <ul>
                                <li><i class="bi bi-toggle-on text-success"></i> / <i class="bi bi-toggle-off text-secondary"></i> <strong>Ativar/Desativar:</strong> Controlar se a conta está ativa</li>
                                <li><i class="bi bi-pencil text-primary"></i> <strong>Editar:</strong> Alterar descrição, categoria, valor ou dia de vencimento</li>
                                <li><i class="bi bi-trash text-danger"></i> <strong>Excluir:</strong> Remover conta fixa permanentemente</li>
                            </ul>
                            
                            <h6>🎯 Geração Automática:</h6>
                            <p>Na aba Lançamentos, use o botão <strong>"Gerar Contas Fixas do Mês"</strong> para criar automaticamente todos os lançamentos das contas fixas ativas do mês selecionado.</p>
                            
                            <h6>💡 Vantagens:</h6>
                            <ul>
                                <li>Evita esquecer contas mensais</li>
                                <li>Geração automática economiza tempo</li>
                                <li>Fácil gestão de assinaturas e serviços</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Contas Parceladas -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#contasParceladas">
                            <i class="bi bi-credit-card me-2"></i> Contas Parceladas
                        </button>
                    </h2>
                    <div id="contasParceladas" class="accordion-collapse collapse" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>💳 Pagamentos em Parcelas</h5>
                            
                            <h6>O que são?</h6>
                            <p>Compras ou dívidas divididas em várias parcelas ao longo dos meses (ex: compra no cartão em 12x).</p>
                            
                            <h6>Visualização:</h6>
                            <p>Esta aba mostra um resumo agrupado de todas as suas compras parceladas:</p>
                            <ul>
                                <li><strong>Descrição:</strong> Nome da compra</li>
                                <li><strong>Parcelas:</strong> Pagas / Total (ex: 3/12)</li>
                                <li><strong>Valor Parcela:</strong> Valor de cada prestação</li>
                                <li><strong>Total:</strong> Valor total da compra</li>
                                <li><strong>Próximo Vencimento:</strong> Data da próxima parcela</li>
                                <li><strong>Progresso:</strong> Barra visual das parcelas pagas</li>
                            </ul>
                            
                            <h6>🎯 Quitação:</h6>
                            <p>Clique em <i class="bi bi-check-circle text-success"></i> <strong>Quitar</strong> para:</p>
                            <ul>
                                <li><strong>Quitação Integral:</strong> Pagar todas as parcelas restantes de uma vez (com opção de desconto)</li>
                                <li><strong>Quitação Parcial:</strong> Escolher quais parcelas pagar</li>
                            </ul>
                            
                            <h6>ℹ️ Informações:</h6>
                            <ul>
                                <li>Parcelas pagas ficam marcadas com <span class="badge bg-success">Pago</span></li>
                                <li>Parcelas pendentes aparecem como <span class="badge bg-warning">Pendente</span></li>
                                <li>Sistema calcula automaticamente o progresso</li>
                            </ul>
                            
                            <h6>💡 Dica:</h6>
                            <p>Acompanhe o andamento de cada parcelamento e planeje quitações antecipadas quando tiver saldo disponível!</p>
                        </div>
                    </div>
                </div>
                
                <!-- Relatórios -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#relatorios">
                            <i class="bi bi-file-earmark-bar-graph me-2"></i> Relatórios
                        </button>
                    </h2>
                    <div id="relatorios" class="accordion-collapse collapse" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>📊 Análise Financeira Detalhada</h5>
                            
                            <h6>Como Gerar:</h6>
                            <ol>
                                <li>Selecione a <strong>Data Início</strong></li>
                                <li>Selecione a <strong>Data Fim</strong></li>
                                <li>Clique em <strong>Gerar Relatório</strong></li>
                            </ol>
                            
                            <h6>Informações Exibidas:</h6>
                            <ul>
                                <li><strong>Resumo Geral:</strong>
                                    <ul>
                                        <li>Total de Receitas</li>
                                        <li>Total de Despesas</li>
                                        <li>Saldo do Período</li>
                                        <li>Total de Lançamentos</li>
                                    </ul>
                                </li>
                                <li><strong>Gastos por Categoria:</strong> Gráfico de pizza mostrando distribuição</li>
                                <li><strong>Lançamentos por Categoria:</strong> Quantidade de lançamentos em cada</li>
                                <li><strong>Tabela Detalhada:</strong> Todos os lançamentos do período com:
                                    <ul>
                                        <li>Data</li>
                                        <li>Descrição</li>
                                        <li>Categoria</li>
                                        <li>Tipo</li>
                                        <li>Valor</li>
                                        <li>Status</li>
                                    </ul>
                                </li>
                            </ul>
                            
                            <h6>💡 Uso Prático:</h6>
                            <ul>
                                <li>Compare diferentes períodos</li>
                                <li>Identifique categorias com maior gasto</li>
                                <li>Analise seu comportamento financeiro</li>
                                <li>Planeje redução de gastos</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Dicas Gerais -->
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#dicas">
                            <i class="bi bi-lightbulb me-2"></i> Dicas e Melhores Práticas
                        </button>
                    </h2>
                    <div id="dicas" class="accordion-collapse collapse" data-bs-parent="#accordionAjuda">
                        <div class="accordion-body">
                            <h5>💡 Aproveite ao Máximo o App</h5>
                            
                            <h6>🎯 Organização:</h6>
                            <ul>
                                <li>Crie categorias específicas para melhor controle</li>
                                <li>Use nomes descritivos nos lançamentos</li>
                                <li>Registre todos os gastos, mesmo os pequenos</li>
                                <li>Configure contas fixas para não esquecer pagamentos</li>
                            </ul>
                            
                            <h6>💰 Planejamento:</h6>
                            <ul>
                                <li>Consulte a Previsão de Saldo para planejar gastos futuros</li>
                                <li>Use o Comparativo Mensal para identificar tendências</li>
                                <li>Acompanhe o Top 5 Categorias para controlar maiores gastos</li>
                                <li>Gere relatórios mensais para análise completa</li>
                            </ul>
                            
                            <h6>⚡ Produtividade:</h6>
                            <ul>
                                <li>Marque "Conta Fixa" ao adicionar despesas recorrentes</li>
                                <li>Use "Gerar Contas Fixas do Mês" todo início de mês</li>
                                <li>Para compras parceladas, sempre use o checkbox "Lançamento Parcelado"</li>
                                <li>Configure a Data de Vencimento correta para avisos precisos</li>
                            </ul>
                            
                            <h6>🔔 Avisos:</h6>
                            <ul>
                                <li>Verifique diariamente a Home para avisos de vencimento</li>
                                <li>Priorize contas VENCIDAS (vermelho)</li>
                                <li>Preste atenção nas que VENCEM HOJE (laranja)</li>
                                <li>Planeje-se para as dos próximos 3 e 7 dias</li>
                            </ul>
                            
                            <h6>📱 PWA (Progressive Web App):</h6>
                            <ul>
                                <li>Instale no celular para acesso offline</li>
                                <li>Funciona como app nativo</li>
                                <li>Dados sincronizam automaticamente quando online</li>
                                <li>Ícone na tela inicial para acesso rápido</li>
                            </ul>
                            
                            <h6>🔒 Segurança:</h6>
                            <ul>
                                <li>Use uma senha forte</li>
                                <li>Faça logout em dispositivos compartilhados</li>
                                <li>Seus dados são armazenados com segurança no Supabase</li>
                                <li>Cada usuário tem acesso apenas aos próprios dados</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <div class="card mt-4 border-info">
                <div class="card-body">
                    <h5 class="card-title"><i class="bi bi-info-circle text-info"></i> Precisa de mais ajuda?</h5>
                    <p class="card-text">Este aplicativo foi desenvolvido para facilitar o controle financeiro pessoal de forma simples e eficiente.</p>
                    <p class="mb-0"><strong>Versão:</strong> 2.0 | <strong>Última Atualização:</strong> Novembro 2025</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// AUTENTICAÇÃO
// ============================================

function getLoginHTML() {
    return `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card shadow-lg">
                        <div class="card-body p-5">
                            <div class="text-center mb-4">
                                <i class="bi bi-cash-coin" style="font-size: 4rem; color: #4CAF50;"></i>
                                <h2 class="mt-3">Finanças em Dia</h2>
                                <p class="text-muted">Controle Financeiro PWA</p>
                            </div>
                            
                            <form onsubmit="handleLogin(event)">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="loginEmail" required 
                                           placeholder="seu@email.com">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="loginPassword" required
                                           placeholder="••••••••">
                                </div>
                                <button type="submit" class="btn btn-success w-100 mb-3">
                                    <i class="bi bi-box-arrow-in-right"></i> Entrar
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <button class="btn btn-link" onclick="showPage('register')">
                                    Criar nova conta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getRegisterHTML() {
    return `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card shadow-lg">
                        <div class="card-body p-5">
                            <h2 class="text-center mb-4">Criar Conta</h2>
                            
                            <form onsubmit="handleRegister(event)">
                                <div class="mb-3">
                                    <label class="form-label">Nome</label>
                                    <input type="text" class="form-control" id="registerName" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" id="registerEmail" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Senha</label>
                                    <input type="password" class="form-control" id="registerPassword" 
                                           required minlength="6">
                                </div>
                                <button type="submit" class="btn btn-success w-100 mb-3">
                                    <i class="bi bi-person-plus"></i> Criar Conta
                                </button>
                            </form>
                            
                            <div class="text-center">
                                <button class="btn btn-link" onclick="showPage('login')">
                                    Já tenho conta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !data) {
            showAlert('Email ou senha incorretos!', 'danger');
            return;
        }
        
        currentUser = { id: data.id, nome: data.nome };
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.nome);
        
        showAlert(`Bem-vindo(a), ${data.nome}!`, 'success');
        showPage('home');
    } catch (err) {
        showAlert('Erro ao fazer login: ' + err.message, 'danger');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const nome = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nome, email, senha: password }])
            .select()
            .single();
        
        if (error) {
            showAlert('Erro ao criar conta: ' + error.message, 'danger');
            return;
        }
        
        // Criar categorias padrão
        await criarCategoriasIniciais(data.id);
        
        showAlert('Conta criada com sucesso!', 'success');
        showPage('login');
    } catch (err) {
        showAlert('Erro: ' + err.message, 'danger');
    }
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    currentUser = null;
    showPage('login');
}

// ============================================
// NAVBAR
// ============================================

function getNavbar(activePage) {
    return `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="#" onclick="showPage('home')">
                    <i class="bi bi-cash-coin"></i> Finanças em Dia
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="#" onclick="showPage('home')">
                                <i class="bi bi-house-door"></i> Home
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'lancamentos' ? 'active' : ''}" href="#" onclick="showPage('lancamentos')">
                                <i class="bi bi-journal-text"></i> Lançamentos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'categorias' ? 'active' : ''}" href="#" onclick="showPage('categorias')">
                                <i class="bi bi-tags"></i> Categorias
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'contas_fixas' ? 'active' : ''}" href="#" onclick="showPage('contas_fixas')">
                                <i class="bi bi-arrow-repeat"></i> Contas Fixas
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'contas_parceladas' ? 'active' : ''}" href="#" onclick="showPage('contas_parceladas')">
                                <i class="bi bi-credit-card"></i> Parceladas
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'relatorios' ? 'active' : ''}" href="#" onclick="showPage('relatorios')">
                                <i class="bi bi-file-earmark-bar-graph"></i> Relatórios
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'importar_ofx' ? 'active' : ''}" href="#" onclick="showPage('importar_ofx')">
                                <i class="bi bi-file-earmark-arrow-up"></i> Importar OFX
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link ${activePage === 'ajuda' ? 'active' : ''}" href="#" onclick="showPage('ajuda')">
                                <i class="bi bi-question-circle"></i> Ajuda
                            </a>
                        </li>
                    </ul>
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <span class="nav-link" id="status-conexao">
                                <i class="bi bi-wifi"></i> Online
                            </span>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                <i class="bi bi-person-circle"></i> ${currentUser.nome}
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item" href="#" onclick="logout()">
                                    <i class="bi bi-box-arrow-right"></i> Sair
                                </a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

// ============================================
// HOME / DASHBOARD
// ============================================

function getHomeHTML() {
    return `
        ${getNavbar('home')}
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="mb-0"><i class="bi bi-graph-up"></i> Dashboard</h2>
                <div class="d-flex align-items-center gap-2">
                    <label class="mb-0 me-2"><i class="bi bi-calendar3"></i> Mês:</label>
                    <input type="month" class="form-control" id="filtro-mes-dashboard" 
                           value="${mesAtual}" onchange="atualizarDashboard()" style="width: 180px;">
                </div>
            </div>
            
            <!-- Cards principais (4 primeiros) -->
            <div id="dashboard-cards" class="row mt-4">
                <div class="col-12 text-center">
                    <div class="spinner-border text-success"></div>
                </div>
            </div>
            
            <!-- Avisos e Previsão -->
            <div class="mt-4">
                <div id="avisos-vencimento" class="row"></div>
            </div>
            
            <!-- Análises (Comparativo e Categorias) -->
            <div class="mt-4">
                <div id="dashboard-analises" class="row"></div>
            </div>
        </div>
    `;
}

async function loadDashboard() {
    try {
        console.log('Carregando dashboard para usuário:', currentUser);
        
        // Usar o mês do filtro se disponível, senão usar mesAtual
        const mesSelecionado = document.getElementById('filtro-mes-dashboard')?.value || mesAtual;
        
        // Calcular o último dia do mês corretamente
        const [ano, mes] = mesSelecionado.split('-').map(Number);
        const ultimoDia = new Date(ano, mes, 0).getDate();
        
        const mesInicio = `${mesSelecionado}-01`;
        const mesFim = `${mesSelecionado}-${String(ultimoDia).padStart(2, '0')}`;
        
        // Calcular mês anterior para comparativo
        const mesAnteriorDate = new Date(ano, mes - 2, 1); // mes-2 porque Date usa 0-11
        const anoAnterior = mesAnteriorDate.getFullYear();
        const mesAnteriorNum = mesAnteriorDate.getMonth() + 1;
        const ultimoDiaAnterior = new Date(anoAnterior, mesAnteriorNum, 0).getDate();
        const mesAnteriorInicio = `${anoAnterior}-${String(mesAnteriorNum).padStart(2, '0')}-01`;
        const mesAnteriorFim = `${anoAnterior}-${String(mesAnteriorNum).padStart(2, '0')}-${String(ultimoDiaAnterior).padStart(2, '0')}`;
        
        console.log('Período atual:', mesInicio, 'até', mesFim);
        console.log('Período anterior:', mesAnteriorInicio, 'até', mesAnteriorFim);
        
        // Buscar lançamentos do mês atual
        const { data, error } = await supabase
            .from('lancamentos')
            .select('*, categorias(nome)')
            .eq('usuario_id', currentUser.id)
            .gte('data', mesInicio)
            .lte('data', mesFim);
        
        if (error) {
            console.error('Erro na query Supabase:', error);
            throw error;
        }
        
        // Buscar lançamentos do mês anterior
        const { data: dataAnterior, error: errorAnterior } = await supabase
            .from('lancamentos')
            .select('id, valor, tipo, status')
            .eq('usuario_id', currentUser.id)
            .gte('data', mesAnteriorInicio)
            .lte('data', mesAnteriorFim);
        
        if (errorAnterior) {
            console.error('Erro ao buscar mês anterior:', errorAnterior);
        }
        
        console.log('Lançamentos carregados:', data?.length || 0);
        
        const receitas = data.filter(l => l.tipo === 'receita' && l.status === 'pago');
        const receitasPendentes = data.filter(l => l.tipo === 'receita' && l.status === 'pendente');
        const despesas = data.filter(l => l.tipo === 'despesa' && l.status === 'pago');
        const despesasPendentes = data.filter(l => l.tipo === 'despesa' && l.status === 'pendente');
        
        const totalReceitas = receitas.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const totalReceitasPendentes = receitasPendentes.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const totalDespesas = despesas.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const totalDespesasPendentes = despesasPendentes.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const saldo = totalReceitas - totalDespesas;
        const saldoPrevisto = (totalReceitas + totalReceitasPendentes) - (totalDespesas + totalDespesasPendentes);
        
        // Calcular comparativo com mês anterior
        const despesasAnterior = dataAnterior ? dataAnterior.filter(l => l.tipo === 'despesa' && l.status === 'pago') : [];
        const receitasAnterior = dataAnterior ? dataAnterior.filter(l => l.tipo === 'receita' && l.status === 'pago') : [];
        const totalDespesasAnterior = despesasAnterior.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const totalReceitasAnterior = receitasAnterior.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        
        const variacao = totalDespesasAnterior > 0 ? ((totalDespesas - totalDespesasAnterior) / totalDespesasAnterior * 100) : 0;
        const variacaoReceitas = totalReceitasAnterior > 0 ? ((totalReceitas - totalReceitasAnterior) / totalReceitasAnterior * 100) : 0;
        
        // Agrupar gastos por categoria (incluindo pendentes e pagas)
        const gastosPorCategoria = {};
        // Incluir todas as despesas do mês (pagas e pendentes)
        const todasDespesasMes = data.filter(l => l.tipo === 'despesa');
        todasDespesasMes.forEach(l => {
            const catNome = l.categorias?.nome || 'Sem Categoria';
            if (!gastosPorCategoria[catNome]) {
                gastosPorCategoria[catNome] = 0;
            }
            gastosPorCategoria[catNome] += parseFloat(l.valor);
        });
        
        const topCategorias = Object.entries(gastosPorCategoria)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Preencher cards principais (4 primeiros)
        document.getElementById('dashboard-cards').innerHTML = `
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title text-success"><i class="bi bi-arrow-up-circle"></i> Receitas Recebidas</h6>
                        <h4>R$ ${totalReceitas.toFixed(2)}</h4>
                        <small class="text-muted">${receitas.length} lançamentos</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title text-danger"><i class="bi bi-arrow-down-circle"></i> Despesas Pagas</h6>
                        <h4>R$ ${totalDespesas.toFixed(2)}</h4>
                        <small class="text-muted">${despesas.length} lançamentos</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title ${saldo >= 0 ? 'text-primary' : 'text-warning'}"><i class="bi bi-wallet2"></i> Saldo Atual</h6>
                        <h4 class="${saldo >= 0 ? 'text-primary' : 'text-warning'}">R$ ${saldo.toFixed(2)}</h4>
                        <small class="text-muted">${saldo >= 0 ? 'Positivo' : 'Negativo'}</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-3 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title text-info"><i class="bi bi-calendar-check"></i> Saldo Previsto</h6>
                        <h4>R$ ${saldoPrevisto.toFixed(2)}</h4>
                        <small class="text-muted">Final do mês</small>
                    </div>
                </div>
            </div>
        `;
        
        // Preencher análises (comparativo e categorias)
        document.getElementById('dashboard-analises').innerHTML = `
            <!-- Comparativo Mensal -->
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title"><i class="bi bi-graph-up"></i> Comparativo de Gastos</h6>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span>Mês Atual</span>
                            <strong>R$ ${totalDespesas.toFixed(2)}</strong>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span>Mês Anterior</span>
                            <strong>R$ ${totalDespesasAnterior.toFixed(2)}</strong>
                        </div>
                        <hr>
                        <div class="text-center">
                            <h5 class="${variacao > 0 ? 'text-danger' : 'text-success'}">
                                <i class="bi bi-${variacao > 0 ? 'arrow-up' : 'arrow-down'}-circle"></i>
                                ${Math.abs(variacao).toFixed(1)}%
                            </h5>
                            <small class="text-muted">${variacao > 0 ? 'Aumento' : 'Redução'} nos gastos</small>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Gastos por Categoria -->
            <div class="col-md-6 mb-3">
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title"><i class="bi bi-pie-chart"></i> Top 5 Categorias</h6>
                        ${topCategorias.length > 0 ? topCategorias.map(([cat, val]) => {
                            const percentual = totalDespesas > 0 ? (val / totalDespesas * 100) : 0;
                            return `
                                <div class="mb-2">
                                    <div class="d-flex justify-content-between mb-1">
                                        <small>${cat}</small>
                                        <small><strong>R$ ${val.toFixed(2)}</strong> (${percentual.toFixed(1)}%)</small>
                                    </div>
                                    <div class="progress" style="height: 8px;">
                                        <div class="progress-bar bg-primary" style="width: ${percentual}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('') : '<p class="text-muted mb-0">Nenhuma despesa registrada</p>'}
                    </div>
                </div>
            </div>
        `;
        
        // Carregar avisos de vencimento e previsão de saldo (vai no meio)
        await loadAvisosVencimento(data, saldo, totalDespesasPendentes, totalReceitasPendentes);
    } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        console.error('Stack trace:', err.stack);
        console.error('Erro completo:', JSON.stringify(err, null, 2));
        
        const dashboardEl = document.getElementById('dashboard-cards');
        if (dashboardEl) {
            const errorMsg = err.message || err.msg || JSON.stringify(err);
            dashboardEl.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> <strong>Erro ao carregar dashboard</strong>
                        <br>${errorMsg}
                        <br><small>Verifique o console (F12) para mais detalhes</small>
                    </div>
                </div>
            `;
        }
        showAlert('Erro ao carregar dashboard', 'danger');
    }
}

async function loadAvisosVencimento(lancamentos, saldoAtual, despesasPendentes, receitasPendentes) {
    try {
        console.log('Carregando avisos de vencimento...');
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const proximos3Dias = new Date(hoje);
        proximos3Dias.setDate(proximos3Dias.getDate() + 3);
        
        const proximos7Dias = new Date(hoje);
        proximos7Dias.setDate(proximos7Dias.getDate() + 7);
        
        // Filtrar apenas contas pendentes
        const contasPendentes = lancamentos.filter(l => l.status === 'pendente');
        
        // Classificar por prioridade
        const vencidas = [];
        const vencemHoje = [];
        const vencem3Dias = [];
        const vencem7Dias = [];
        
        contasPendentes.forEach(conta => {
            const dataVenc = new Date(conta.data + 'T00:00:00');
            
            if (dataVenc < hoje) {
                vencidas.push(conta);
            } else if (dataVenc.getTime() === hoje.getTime()) {
                vencemHoje.push(conta);
            } else if (dataVenc <= proximos3Dias) {
                vencem3Dias.push(conta);
            } else if (dataVenc <= proximos7Dias) {
                vencem7Dias.push(conta);
            }
        });
        
        // Calcular previsão de saldo
        const saldoProjetado = saldoAtual + receitasPendentes - despesasPendentes;
        
        let avisosHTML = `
            <!-- Previsão de Saldo -->
            <div class="col-12 mb-3">
                <div class="card border-info">
                    <div class="card-body">
                        <h6 class="card-title text-info"><i class="bi bi-calculator"></i> Previsão de Saldo - Final do Mês</h6>
                        <div class="row">
                            <div class="col-md-4">
                                <small class="text-muted">Saldo Atual</small>
                                <h5>R$ ${saldoAtual.toFixed(2)}</h5>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">A Receber</small>
                                <h5 class="text-success">+ R$ ${receitasPendentes.toFixed(2)}</h5>
                            </div>
                            <div class="col-md-4">
                                <small class="text-muted">A Pagar</small>
                                <h5 class="text-danger">- R$ ${despesasPendentes.toFixed(2)}</h5>
                            </div>
                        </div>
                        <hr>
                        <div class="text-center">
                            <h4 class="${saldoProjetado >= 0 ? 'text-primary' : 'text-warning'}">
                                <i class="bi bi-wallet2"></i> R$ ${saldoProjetado.toFixed(2)}
                            </h4>
                            <small class="text-muted">Saldo projetado</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Avisos de Vencimento
        if (vencidas.length > 0 || vencemHoje.length > 0 || vencem3Dias.length > 0 || vencem7Dias.length > 0) {
            avisosHTML += `
                <div class="col-12 mb-3">
                    <h5><i class="bi bi-bell"></i> Avisos de Vencimento</h5>
                </div>
            `;
            
            // Vencidas
            if (vencidas.length > 0) {
                avisosHTML += `
                    <div class="col-12 mb-3">
                        <div class="card border-danger">
                            <div class="card-header bg-danger text-white" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#collapseVencidas">
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong><i class="bi bi-chevron-right me-2"></i><i class="bi bi-exclamation-triangle"></i> VENCIDAS</strong>
                                    <span class="badge bg-light text-danger">${vencidas.length} ${vencidas.length === 1 ? 'conta' : 'contas'}</span>
                                </div>
                            </div>
                            <div id="collapseVencidas" class="collapse">
                                <div class="card-body p-2">
                                    <div class="list-group list-group-flush">
                                        ${vencidas.map(c => `
                                            <div class="list-group-item list-group-item-danger">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <strong>${c.descricao}</strong>
                                                        <br><small>${c.categorias?.nome || 'Sem categoria'} | ${formatarData(c.data)}</small>
                                                    </div>
                                                    <div class="text-end">
                                                        <strong class="text-danger">R$ ${parseFloat(c.valor).toFixed(2)}</strong>
                                                    </div>
                                                </div>
                                                <div class="d-flex gap-2">
                                                    <button class="btn btn-success btn-sm flex-fill" onclick="pagarLancamento(${c.id})">
                                                        <i class="bi bi-check-circle"></i> Pagar
                                                    </button>
                                                    <button class="btn btn-warning btn-sm flex-fill" onclick="adiarLancamento(${c.id}, '${c.descricao}', '${c.data}')">
                                                        <i class="bi bi-calendar-plus"></i> Adiar
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Vencem Hoje
            if (vencemHoje.length > 0) {
                avisosHTML += `
                    <div class="col-12 mb-3">
                        <div class="card border-warning">
                            <div class="card-header bg-warning text-dark">
                                <strong><i class="bi bi-alarm"></i> VENCEM HOJE (${vencemHoje.length})</strong>
                            </div>
                            <div class="card-body p-2">
                                <div class="list-group list-group-flush">
                                    ${vencemHoje.map(c => `
                                        <div class="list-group-item list-group-item-warning">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <strong>${c.descricao}</strong>
                                                    <br><small>${c.categorias?.nome || 'Sem categoria'}</small>
                                                </div>
                                                <div class="text-end">
                                                    <strong>R$ ${parseFloat(c.valor).toFixed(2)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Próximos 3 dias
            if (vencem3Dias.length > 0) {
                avisosHTML += `
                    <div class="col-12 mb-3">
                        <div class="card border-warning">
                            <div class="card-header" style="background-color: #fff3cd; cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#collapse3Dias">
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong><i class="bi bi-chevron-right me-2"></i><i class="bi bi-clock"></i> Próximos 3 Dias</strong>
                                    <span class="badge bg-warning text-dark">${vencem3Dias.length} ${vencem3Dias.length === 1 ? 'conta' : 'contas'}</span>
                                </div>
                            </div>
                            <div id="collapse3Dias" class="collapse">
                                <div class="card-body p-2">
                                    <div class="list-group list-group-flush">
                                        ${vencem3Dias.map(c => `
                                            <div class="list-group-item">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <strong>${c.descricao}</strong>
                                                        <br><small>${formatarData(c.data)}</small>
                                                    </div>
                                                    <strong>R$ ${parseFloat(c.valor).toFixed(2)}</strong>
                                                </div>
                                                <div class="d-flex gap-2">
                                                    <button class="btn btn-success btn-sm flex-fill" onclick="pagarLancamento(${c.id})">
                                                        <i class="bi bi-check-circle"></i> Pagar
                                                    </button>
                                                    <button class="btn btn-warning btn-sm flex-fill" onclick="adiarLancamento(${c.id}, '${c.descricao}', '${c.data}')">
                                                        <i class="bi bi-calendar-plus"></i> Adiar
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Próximos 7 dias
            if (vencem7Dias.length > 0) {
                avisosHTML += `
                    <div class="col-12 mb-3">
                        <div class="card border-info">
                            <div class="card-header bg-light" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#collapse7Dias">
                                <div class="d-flex justify-content-between align-items-center">
                                    <strong><i class="bi bi-chevron-right me-2"></i><i class="bi bi-calendar-week"></i> Próximos 7 Dias</strong>
                                    <span class="badge bg-info text-dark">${vencem7Dias.length} ${vencem7Dias.length === 1 ? 'conta' : 'contas'}</span>
                                </div>
                            </div>
                            <div id="collapse7Dias" class="collapse">
                                <div class="card-body p-2">
                                    <div class="list-group list-group-flush">
                                        ${vencem7Dias.map(c => `
                                            <div class="list-group-item">
                                                <div class="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <strong>${c.descricao}</strong>
                                                        <br><small>${formatarData(c.data)}</small>
                                                    </div>
                                                    <strong>R$ ${parseFloat(c.valor).toFixed(2)}</strong>
                                                </div>
                                                <div class="d-flex gap-2">
                                                    <button class="btn btn-success btn-sm flex-fill" onclick="pagarLancamento(${c.id})">
                                                        <i class="bi bi-check-circle"></i> Pagar
                                                    </button>
                                                    <button class="btn btn-warning btn-sm flex-fill" onclick="adiarLancamento(${c.id}, '${c.descricao}', '${c.data}')">
                                                        <i class="bi bi-calendar-plus"></i> Adiar
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            avisosHTML += `
                <div class="col-12 mb-3">
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle"></i> <strong>Tudo em dia!</strong> Nenhuma conta próxima do vencimento.
                    </div>
                </div>
            `;
        }
        
        document.getElementById('avisos-vencimento').innerHTML = avisosHTML;
    } catch (err) {
        console.error('Erro ao carregar avisos de vencimento:', err);
        const avisosEl = document.getElementById('avisos-vencimento');
        if (avisosEl) {
            avisosEl.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle"></i> Erro ao carregar avisos: ${err.message}
                    </div>
                </div>
            `;
        }
    }
}

async function pagarLancamento(lancamentoId) {
    try {
        const { error } = await supabase
            .from('lancamentos')
            .update({ status: 'pago' })
            .eq('id', lancamentoId);
        
        if (error) throw error;
        
        showAlert('Lançamento pago com sucesso!', 'success');
        await loadDashboard();
    } catch (err) {
        console.error('Erro ao pagar lançamento:', err);
        showAlert('Erro ao pagar lançamento: ' + err.message, 'danger');
    }
}

async function adiarLancamento(lancamentoId, descricao, dataAtual) {
    // Criar modal para selecionar nova data
    const modalHTML = `
        <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" id="modalAdiar">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-calendar-plus"></i> Adiar Lançamento</h5>
                        <button type="button" class="btn-close" onclick="fecharModalAdiar()"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>${descricao}</strong></p>
                        <p class="text-muted">Data atual: ${formatarData(dataAtual)}</p>
                        <div class="mb-3">
                            <label class="form-label">Nova Data de Vencimento:</label>
                            <input type="date" class="form-control" id="nova-data-vencimento" value="${dataAtual}" min="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="fecharModalAdiar()">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="confirmarAdiar(${lancamentoId})">
                            <i class="bi bi-check"></i> Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-adiar-container';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

function fecharModalAdiar() {
    const modal = document.getElementById('modal-adiar-container');
    if (modal) {
        modal.remove();
    }
}

async function confirmarAdiar(lancamentoId) {
    try {
        const novaData = document.getElementById('nova-data-vencimento').value;
        
        if (!novaData) {
            showAlert('Selecione uma data!', 'warning');
            return;
        }
        
        const { error } = await supabase
            .from('lancamentos')
            .update({ data: novaData })
            .eq('id', lancamentoId);
        
        if (error) throw error;
        
        showAlert('Data adiada com sucesso!', 'success');
        fecharModalAdiar();
        await loadDashboard();
    } catch (err) {
        console.error('Erro ao adiar lançamento:', err);
        showAlert('Erro ao adiar lançamento: ' + err.message, 'danger');
    }
}

// Função auxiliar para navegar até lançamento específico (wrapper síncrono)
function irParaLancamento(lancamentoId) {
    console.log('Navegando para lançamento:', lancamentoId);
    
    // Executar a versão assíncrona sem bloquear
    irParaLancamentoAsync(lancamentoId).catch(err => {
        console.error('Erro ao navegar:', err);
    });
}

// Função assíncrona real
async function irParaLancamentoAsync(lancamentoId) {
    try {
        console.log('Iniciando navegação assíncrona para:', lancamentoId);
        
        // Mudar para aba de lançamentos e aguardar carregamento completo
        await showPage('lancamentos');
        
        console.log('Página de lançamentos carregada, aguardando elementos...');
        
        // Aguardar até que todos os elementos estejam disponíveis (máximo 5 segundos)
        const maxTentativas = 25; // 25 x 200ms = 5 segundos
        let tentativa = 0;
        let elementosCarregados = false;
        
        while (tentativa < maxTentativas && !elementosCarregados) {
            const elemData = document.getElementById('lanc-data');
            const elemDescricao = document.getElementById('lanc-descricao');
            const elemCategoria = document.getElementById('lanc-categoria');
            const elemValor = document.getElementById('lanc-valor');
            const elemTipo = document.getElementById('lanc-tipo');
            const elemStatus = document.getElementById('lanc-status');
            
            if (elemData && elemDescricao && elemCategoria && elemValor && elemTipo && elemStatus) {
                elementosCarregados = true;
                console.log(`✅ Todos os elementos carregados após ${tentativa * 200}ms`);
            } else {
                console.log(`⏳ Tentativa ${tentativa + 1}/${maxTentativas} - aguardando elementos...`);
                await new Promise(resolve => setTimeout(resolve, 200));
                tentativa++;
            }
        }
        
        if (!elementosCarregados) {
            console.error('❌ Timeout: elementos não carregaram após 5 segundos');
            throw new Error('Timeout ao carregar formulário');
        }
        
        console.log('✅ Formulário pronto, editando lançamento...');
        
        // Editar o lançamento
        await editarLancamento(lancamentoId);
        
    } catch (err) {
        console.error('❌ Erro ao navegar para lançamento:', err);
        showAlert('Erro ao carregar lançamento: ' + err.message, 'danger');
    }
}

// Função auxiliar para formatar data
function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Função para atualizar dashboard quando o mês é alterado
async function atualizarDashboard() {
    await loadDashboard();
}

// ============================================
// LANÇAMENTOS
// ============================================

function getLancamentosHTML() {
    return `
        ${getNavbar('lancamentos')}
        <div class="container mt-4">
            <h2><i class="bi bi-journal-text"></i> Lançamentos</h2>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Adicionar Lançamento</h5>
                    <form onsubmit="handleAddLancamento(event)">
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <label class="form-label"><strong>Tipo de Lançamento</strong></label>
                                <div class="d-flex gap-4">
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="lanc-tipo" id="lanc-tipo-despesa" value="despesa" checked onchange="filtrarCategoriasPorTipo()">
                                        <label class="form-check-label" for="lanc-tipo-despesa">
                                            <i class="bi bi-arrow-down-circle text-danger"></i> Despesa
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="lanc-tipo" id="lanc-tipo-receita" value="receita" onchange="filtrarCategoriasPorTipo()">
                                        <label class="form-check-label" for="lanc-tipo-receita">
                                            <i class="bi bi-arrow-up-circle text-success"></i> Receita
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Data</label>
                                <input type="date" class="form-control" id="lanc-data" required>
                            </div>
                            <div class="col-md-5 mb-3">
                                <label class="form-label">Descrição</label>
                                <input type="text" class="form-control" id="lanc-descricao" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" id="lanc-categoria" required>
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="lanc-eh-parcelado">
                                    <label class="form-check-label" for="lanc-eh-parcelado">
                                        <strong>Lançamento Parcelado</strong>
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="lanc-eh-conta-fixa">
                                    <label class="form-check-label" for="lanc-eh-conta-fixa">
                                        <strong>Conta Fixa</strong>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div id="campos-parcelamento" style="display: none;">
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Número de Parcelas</label>
                                    <input type="number" class="form-control" id="lanc-parcelas" min="2" value="2">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Data de Vencimento</label>
                                    <input type="date" class="form-control" id="lanc-data-vencimento">
                                    <small class="text-muted">1ª parcela vence nesta data</small>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Tipo de Valor</label>
                                    <select class="form-select" id="lanc-tipo-valor">
                                        <option value="total">Valor Total (dividir)</option>
                                        <option value="parcela">Valor da Parcela</option>
                                    </select>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label" id="label-valor">Valor Total</label>
                                    <input type="number" step="0.01" class="form-control" id="lanc-valor">
                                </div>
                            </div>
                        </div>
                        <div id="campo-valor-simples" class="row">
                            <div class="col-md-12 mb-3">
                                <label class="form-label">Valor</label>
                                <input type="number" step="0.01" class="form-control" id="lanc-valor-simples">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-success">
                            <i class="bi bi-plus-circle"></i> Adicionar
                        </button>
                    </form>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Filtrar</h5>
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Tipo</label>
                            <select class="form-select" id="filtro-tipo" onchange="loadLancamentos()">
                                <option value="">Todos</option>
                                <option value="receita">Receitas</option>
                                <option value="despesa">Despesas</option>
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Status</label>
                            <select class="form-select" id="filtro-status" onchange="loadLancamentos()">
                                <option value="">Todos</option>
                                <option value="pago">Pagos</option>
                                <option value="pendente">Pendentes</option>
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Categoria</label>
                            <select class="form-select" id="filtro-categoria" onchange="loadLancamentos()">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Mês/Ano</label>
                            <input type="month" class="form-control" id="filtro-mes" value="${mesAtual}" onchange="loadLancamentos()">
                        </div>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="gerarContasFixasMesAtual()">
                        <i class="bi bi-arrow-repeat"></i> Gerar Contas Fixas do Mês
                    </button>
                </div>
            </div>
            
            <div id="lancamentos-list" class="mt-4"></div>
        </div>
    `;
}

async function loadCategorias() {
    try {
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .eq('usuario_id', currentUser.id)
            .order('nome');
        
        if (error) throw error;
        
        categorias = data || [];
        
        // Atualizar select de lançamento com filtro por tipo
        filtrarCategoriasPorTipo();
        
        // Atualizar outros selects sem filtro
        const selectsSemFiltro = ['filtro-categoria', 'conta-fixa-categoria'];
        selectsSemFiltro.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Selecione...</option>' +
                    categorias.map(c => `<option value="${c.id}">${c.nome} (${c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)})</option>`).join('');
                if (currentValue) select.value = currentValue;
            }
        });
        
        // Atualizar filtro de categoria
        const filtroCategoria = document.getElementById('filtro-categoria');
        if (filtroCategoria) {
            filtroCategoria.innerHTML = '<option value="">Todas</option>' +
                categorias.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar categorias:', err);
    }
}

function filtrarCategoriasPorTipo() {
    const tipoDespesa = document.getElementById('lanc-tipo-despesa');
    const tipoReceita = document.getElementById('lanc-tipo-receita');
    const selectCategoria = document.getElementById('lanc-categoria');
    
    if (!tipoDespesa || !tipoReceita || !selectCategoria) return;
    
    const tipoSelecionado = tipoDespesa.checked ? 'despesa' : 'receita';
    const categoriasFiltradas = categorias.filter(c => c.tipo === tipoSelecionado);
    
    const currentValue = selectCategoria.value;
    selectCategoria.innerHTML = '<option value="">Selecione...</option>' +
        categoriasFiltradas.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
    
    // Manter valor selecionado se ainda estiver disponível
    const opcaoExiste = categoriasFiltradas.some(c => c.id == currentValue);
    if (currentValue && opcaoExiste) {
        selectCategoria.value = currentValue;
    }
}

function inicializarFormularioLancamento() {
    const checkParcelado = document.getElementById('lanc-eh-parcelado');
    const camposParcelamento = document.getElementById('campos-parcelamento');
    const campoValorSimples = document.getElementById('campo-valor-simples');
    const tipoValor = document.getElementById('lanc-tipo-valor');
    const labelValor = document.getElementById('label-valor');
    
    const checkContaFixa = document.getElementById('lanc-eh-conta-fixa');
    
    checkParcelado.addEventListener('change', function() {
        if (this.checked) {
            camposParcelamento.style.display = 'block';
            campoValorSimples.style.display = 'none';
            // Desmarcar conta fixa (mutuamente exclusivos)
            checkContaFixa.checked = false;
        } else {
            camposParcelamento.style.display = 'none';
            campoValorSimples.style.display = 'block';
        }
    });
    
    checkContaFixa.addEventListener('change', function() {
        if (this.checked) {
            // Desmarcar parcelado (mutuamente exclusivos)
            checkParcelado.checked = false;
            camposParcelamento.style.display = 'none';
            campoValorSimples.style.display = 'block';
        }
    });
    
    tipoValor.addEventListener('change', function() {
        if (this.value === 'total') {
            labelValor.textContent = 'Valor Total (será dividido)';
        } else {
            labelValor.textContent = 'Valor da Parcela';
        }
    });
}

async function gerarContasFixasMesAtual() {
    try {
        const mes = document.getElementById('filtro-mes')?.value || mesAtual;
        const [ano, mesNum] = mes.split('-').map(Number);
        
        // Criar data de referência do mês selecionado
        const mesReferencia = new Date(ano, mesNum - 1, 1);
        mesReferencia.setHours(0, 0, 0, 0);
        
        // Buscar todas as contas fixas ativas
        const { data: contasFixas, error: cfError } = await supabase
            .from('contas_fixas')
            .select('*, lancamentos!inner(id, data, conta_fixa_id)')
            .eq('usuario_id', currentUser.id)
            .eq('ativa', true);
        
        if (cfError) throw cfError;
        
        if (!contasFixas || contasFixas.length === 0) {
            showAlert('Nenhuma conta fixa ativa encontrada para gerar.', 'warning');
            return;
        }
        
        let geradas = 0;
        let jaCriadas = 0;
        let ignoradas = 0;
        
        for (const cf of contasFixas) {
            // Buscar o primeiro lançamento desta conta fixa para determinar data de cadastro
            const { data: primeiroLanc, error: primeiroError } = await supabase
                .from('lancamentos')
                .select('data')
                .eq('usuario_id', currentUser.id)
                .eq('conta_fixa_id', cf.id)
                .order('data', { ascending: true })
                .limit(1);
            
            if (primeiroError) throw primeiroError;
            
            // Se encontrou lançamento anterior, usar como referência de cadastro
            if (primeiroLanc && primeiroLanc.length > 0) {
                const dataCadastro = new Date(primeiroLanc[0].data + 'T00:00:00');
                const mesCadastro = new Date(dataCadastro.getFullYear(), dataCadastro.getMonth(), 1);
                
                // Verificar se a conta foi cadastrada depois do mês de referência
                if (mesCadastro > mesReferencia) {
                    ignoradas++;
                    continue;
                }
            }
            
            // Ajustar dia de vencimento para o mês selecionado
            const ultimoDia = new Date(ano, mesNum, 0).getDate();
            const dia = Math.min(cf.dia_vencimento, ultimoDia);
            const dataLancamento = `${ano}-${String(mesNum).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            
            // Verificar se já existe um lançamento para esta conta fixa neste mês
            const { data: existente, error: checkError } = await supabase
                .from('lancamentos')
                .select('id')
                .eq('usuario_id', currentUser.id)
                .eq('conta_fixa_id', cf.id)
                .gte('data', `${mes}-01`)
                .lte('data', `${mes}-${String(ultimoDia).padStart(2, '0')}`)
                .limit(1);
            
            if (checkError) throw checkError;
            
            if (existente && existente.length > 0) {
                jaCriadas++;
                continue;
            }
            
            // Criar o lançamento
            const { error: insertError } = await supabase
                .from('lancamentos')
                .insert({
                    usuario_id: currentUser.id,
                    data: dataLancamento,
                    descricao: cf.descricao,
                    categoria_id: cf.categoria_id,
                    valor: cf.valor,
                    tipo: cf.tipo,
                    status: 'pendente',
                    conta_fixa_id: cf.id,
                    parcela_atual: null,
                    total_parcelas: null
                });
            
            if (insertError) throw insertError;
            geradas++;
        }
        
        let mensagem = '';
        if (geradas > 0) {
            mensagem = `${geradas} conta(s) fixa(s) gerada(s) com sucesso!`;
        }
        if (jaCriadas > 0) {
            mensagem += (mensagem ? ' ' : '') + `${jaCriadas} já existia(m) neste mês.`;
        }
        if (ignoradas > 0) {
            mensagem += (mensagem ? ' ' : '') + `${ignoradas} ignorada(s) (cadastro posterior ao mês).`;
        }
        if (!mensagem) {
            mensagem = 'Nenhuma ação realizada.';
        }
        
        showAlert(mensagem, geradas > 0 ? 'success' : 'info');
        await loadLancamentos();
        
    } catch (err) {
        console.error('Erro ao gerar contas fixas:', err);
        showAlert('Erro ao gerar contas fixas: ' + err.message, 'danger');
    }
}

async function handleAddLancamento(event) {
    event.preventDefault();
    
    console.log('handleAddLancamento chamado');
    
    const ehParcelado = document.getElementById('lanc-eh-parcelado').checked;
    const ehContaFixa = document.getElementById('lanc-eh-conta-fixa').checked;
    
    const data = document.getElementById('lanc-data').value;
    const descricao = document.getElementById('lanc-descricao').value.trim();
    const categoria_id = parseInt(document.getElementById('lanc-categoria').value);
    
    console.log('Dados do formulário:', { data, descricao, categoria_id, ehParcelado, ehContaFixa });
    
    // Validações básicas
    if (!data || !descricao || !categoria_id) {
        showAlert('Preencha todos os campos obrigatórios!', 'warning');
        return;
    }
    
    // Validar data
    const dataObj = new Date(data + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataMaxima = new Date();
    dataMaxima.setFullYear(dataMaxima.getFullYear() + 10); // Máximo 10 anos no futuro
    
    if (dataObj > dataMaxima) {
        showAlert('Data muito distante no futuro (máximo 10 anos)!', 'warning');
        return;
    }
    
    // Validar descrição
    if (descricao.length < 3) {
        showAlert('Descrição muito curta (mínimo 3 caracteres)!', 'warning');
        return;
    }
    
    if (descricao.length > 200) {
        showAlert('Descrição muito longa (máximo 200 caracteres)!', 'warning');
        return;
    }
    
    let valor, parcelas = 1;
    let dataVencimento = data; // Por padrão usa a data informada
    
    if (ehParcelado) {
        parcelas = parseInt(document.getElementById('lanc-parcelas').value);
        dataVencimento = document.getElementById('lanc-data-vencimento').value;
        const tipoValor = document.getElementById('lanc-tipo-valor').value;
        const valorInput = parseFloat(document.getElementById('lanc-valor').value);
        
        if (!dataVencimento) {
            showAlert('Preencha a data de vencimento para lançamentos parcelados!', 'warning');
            return;
        }
        
        if (!valorInput || isNaN(valorInput)) {
            showAlert('Preencha o valor!', 'warning');
            return;
        }
        
        // Validar valor positivo
        if (valorInput <= 0) {
            showAlert('O valor deve ser maior que zero!', 'warning');
            return;
        }
        
        // Validar valor máximo (1 bilhão)
        if (valorInput > 1000000000) {
            showAlert('Valor muito alto (máximo R$ 1 bilhão)!', 'warning');
            return;
        }
        
        // Validar número de parcelas
        if (parcelas < 1 || parcelas > 360) {
            showAlert('Número de parcelas inválido (1 a 360)!', 'warning');
            return;
        }
        
        if (tipoValor === 'total') {
            // Valor total - dividir pelas parcelas
            valor = valorInput / parcelas;
        } else {
            // Valor já é da parcela
            valor = valorInput;
        }
    } else {
        valor = parseFloat(document.getElementById('lanc-valor-simples').value);
        
        if (!valor || isNaN(valor)) {
            showAlert('Preencha o valor!', 'warning');
            return;
        }
        
        // Validar valor positivo
        if (valor <= 0) {
            showAlert('O valor deve ser maior que zero!', 'warning');
            return;
        }
        
        // Validar valor máximo
        if (valor > 1000000000) {
            showAlert('Valor muito alto (máximo R$ 1 bilhão)!', 'warning');
            return;
        }
    }
    
    try {
        // Pegar o tipo selecionado no radio button
        const tipoDespesa = document.getElementById('lanc-tipo-despesa');
        const tipo = tipoDespesa.checked ? 'despesa' : 'receita';
        
        let contaFixaId = null;
        
        // Se é conta fixa, criar cadastro primeiro
        if (ehContaFixa) {
            const diaVencimento = parseInt(data.split('-')[2]);
            
            // Criar conta fixa
            const { data: novaContaFixa, error: cfError } = await supabase
                .from('contas_fixas')
                .insert([{
                    usuario_id: currentUser.id,
                    descricao,
                    categoria_id,
                    valor,
                    dia_vencimento: diaVencimento,
                    tipo,
                    ativa: true
                }])
                .select()
                .single();
            
            if (cfError) throw cfError;
            contaFixaId = novaContaFixa.id;
        }
        
        if (parcelas > 1) {
            // Criar lançamento parcelado (sempre pendente)
            await criarLancamentoParcelado(dataVencimento, descricao, categoria_id, valor, tipo, parcelas, contaFixaId);
        } else {
            // Criar lançamento simples (sempre pendente)
            const { error } = await supabase
                .from('lancamentos')
                .insert([{
                    usuario_id: currentUser.id,
                    data,
                    descricao,
                    categoria_id,
                    valor,
                    tipo,
                    status: 'pendente',
                    conta_fixa_id: contaFixaId,
                    parcela_atual: null,
                    total_parcelas: null
                }]);
            
            if (error) throw error;
        }
        
        let msg;
        if (ehContaFixa) {
            msg = 'Conta fixa criada e lançamento adicionado!';
        } else if (ehParcelado) {
            msg = `${parcelas} parcelas de R$ ${valor.toFixed(2)} adicionadas!`;
        } else {
            msg = 'Lançamento adicionado com sucesso!';
        }
        
        showAlert(msg, 'success');
        event.target.reset();
        const hoje = new Date();
        const dataLocal = hoje.getFullYear() + '-' + 
            String(hoje.getMonth() + 1).padStart(2, '0') + '-' + 
            String(hoje.getDate()).padStart(2, '0');
        document.getElementById('lanc-data').value = dataLocal;
        document.getElementById('lanc-eh-parcelado').checked = false;
        document.getElementById('lanc-eh-conta-fixa').checked = false;
        document.getElementById('campos-parcelamento').style.display = 'none';
        document.getElementById('campo-valor-simples').style.display = 'block';
        await loadLancamentos();
        if (ehContaFixa) await loadContasFixas();
    } catch (err) {
        console.error('Erro completo:', err);
        showAlert('Erro ao adicionar lançamento: ' + err.message, 'danger');
    }
}

// Expor função para o window
window.handleAddLancamento = handleAddLancamento;

async function criarLancamentoParcelado(dataInicial, descricao, categoria_id, valorParcela, tipo, parcelas, contaFixaId = null) {
    const contratoId = `${Date.now()}_${currentUser.id}`;
    // O valorParcela já vem correto da função chamadora
    // Não dividir novamente!
    
    const lancamentos = [];
    const [anoInicial, mesInicial, diaInicial] = dataInicial.split('-').map(Number);
    
    for (let i = 0; i < parcelas; i++) {
        // Calcular mês e ano da parcela
        let ano = anoInicial;
        let mes = mesInicial + i;
        
        // Ajustar ano se o mês ultrapassar 12
        while (mes > 12) {
            mes -= 12;
            ano++;
        }
        
        // Calcular o último dia do mês
        const ultimoDiaMes = new Date(ano, mes, 0).getDate();
        
        // Se o dia inicial for maior que o último dia do mês, usar o último dia
        const dia = Math.min(diaInicial, ultimoDiaMes);
        
        // Formatar data no formato YYYY-MM-DD
        const dataFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        lancamentos.push({
            usuario_id: currentUser.id,
            data: dataFormatada,
            descricao,
            categoria_id,
            valor: valorParcela,
            tipo,
            status: 'pendente',
            conta_fixa_id: contaFixaId,
            parcela_atual: i + 1,
            total_parcelas: parcelas
        });
    }
    
    const { error } = await supabase
        .from('lancamentos')
        .insert(lancamentos);
    
    if (error) throw error;
}

async function loadLancamentos() {
    try {
        console.log('Carregando lançamentos...');
        const mes = document.getElementById('filtro-mes')?.value || mesAtual;
        const tipo = document.getElementById('filtro-tipo')?.value;
        const status = document.getElementById('filtro-status')?.value;
        const categoria_id = document.getElementById('filtro-categoria')?.value;
        
        // Calcular o último dia do mês corretamente
        const [ano, mesNum] = mes.split('-').map(Number);
        const ultimoDia = new Date(ano, mesNum, 0).getDate();
        
        const mesInicio = `${mes}-01`;
        const mesFim = `${mes}-${String(ultimoDia).padStart(2, '0')}`;
        
        console.log('Filtros:', { mes, tipo, status, categoria_id, mesInicio, mesFim });
        
        let query = supabase
            .from('lancamentos')
            .select('*, categorias(nome)')
            .eq('usuario_id', currentUser.id)
            .gte('data', mesInicio)
            .lte('data', mesFim)
            .order('data', { ascending: false });
        
        if (tipo) query = query.eq('tipo', tipo);
        if (status) query = query.eq('status', status);
        if (categoria_id) query = query.eq('categoria_id', parseInt(categoria_id));
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Erro ao buscar lançamentos:', error);
            throw error;
        }
        
        console.log('Lançamentos carregados:', data?.length || 0);
        
        const listEl = document.getElementById('lancamentos-list');
        
        // Se o elemento não existe (ex: não estamos na página de lançamentos), sair
        if (!listEl) {
            console.log('Elemento lancamentos-list não encontrado. Página atual:', currentPage);
            return;
        }
        
        if (data.length === 0) {
            listEl.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Nenhum lançamento encontrado.
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Valor</th>
                            <th>Tipo</th>
                            <th>Parcelas</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.forEach(lanc => {
            const valor = parseFloat(lanc.valor).toFixed(2);
            const classeValor = lanc.tipo === 'receita' ? 'text-success' : 'text-danger';
            const descricaoBase = lanc.descricao.split(' (')[0]; // Remove info de parcela da descrição
            const parcelaDisplay = lanc.parcela_atual && lanc.total_parcelas ? `${lanc.parcela_atual}/${lanc.total_parcelas}` : '-';
            const isQuitacao = lanc.descricao.includes('Quitação');
            
            html += `
                <tr>
                    <td>${formatDate(lanc.data)}</td>
                    <td>${lanc.descricao}</td>
                    <td><span class="badge bg-secondary">${lanc.categorias ? lanc.categorias.nome : '-'}</span></td>
                    <td class="${classeValor}"><strong>R$ ${valor}</strong></td>
                    <td><span class="badge ${lanc.tipo === 'receita' ? 'bg-success' : 'bg-danger'}">${lanc.tipo}</span></td>
                    <td><span class="badge bg-info">${parcelaDisplay}</span></td>
                    <td>
                        <span class="badge ${lanc.status === 'pago' ? 'bg-success' : 'bg-warning'}">${lanc.status === 'pago' ? 'Pago' : 'Pendente'}</span>
                    </td>
                    <td>
                        ${isQuitacao ? `<button class="btn btn-sm btn-info" onclick="verDetalhesQuitacao(${lanc.id})" title="Ver Detalhes da Quitação">
                            <i class="bi bi-info-circle"></i>
                        </button>` : ''}
                        <button class="btn btn-sm ${lanc.status === 'pago' ? 'btn-success' : 'btn-warning'}" 
                                onclick="toggleStatus(${lanc.id}, '${lanc.status}')" 
                                title="${lanc.status === 'pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}">
                            <i class="bi bi-${lanc.status === 'pago' ? 'arrow-counterclockwise' : 'check-circle'}"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editarLancamento(${lanc.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLancamento(${lanc.id})" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        listEl.innerHTML = html;
    } catch (err) {
        console.error('Erro ao carregar lançamentos:', err);
        const listEl = document.getElementById('lancamentos-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Erro ao carregar lançamentos: ${err.message}
                    <br><small>Verifique o console para mais detalhes</small>
                </div>
            `;
        }
        showAlert('Erro ao carregar lançamentos: ' + err.message, 'danger');
    }
}

async function toggleStatus(id, statusAtual) {
    const novoStatus = statusAtual === 'pago' ? 'pendente' : 'pago';
    
    try {
        const { error } = await supabase
            .from('lancamentos')
            .update({ status: novoStatus })
            .eq('id', id);
        
        if (error) throw error;
        
        // Recarregar a página atual
        if (currentPage === 'lancamentos') {
            await loadLancamentos();
        } else if (currentPage === 'contas_parceladas') {
            await loadContasParceladas();
        } else if (currentPage === 'home') {
            await loadDashboard();
        }
        
        showAlert('Status alterado com sucesso!', 'success');
    } catch (err) {
        showAlert('Erro ao alterar status: ' + err.message, 'danger');
    }
}

async function editarLancamento(id) {
    try {
        console.log('Editando lançamento:', id);
        
        // Buscar dados do lançamento
        const { data, error } = await supabase
            .from('lancamentos')
            .select('id, usuario_id, data, descricao, categoria_id, valor, tipo, status, conta_fixa_id, parcela_atual')
            .eq('id', id)
            .single();
        
        if (error) {
            console.error('Erro ao buscar lançamento:', error);
            throw error;
        }
        
        console.log('Lançamento carregado:', data);
        
        // Verificar se elementos existem
        const elemData = document.getElementById('lanc-data');
        const elemDescricao = document.getElementById('lanc-descricao');
        const elemCategoria = document.getElementById('lanc-categoria');
        const elemValorSimples = document.getElementById('lanc-valor-simples');
        const elemEhParcelado = document.getElementById('lanc-eh-parcelado');
        
        if (!elemData || !elemDescricao || !elemCategoria || !elemValorSimples) {
            console.error('Elementos do formulário não encontrados!');
            throw new Error('Formulário não está disponível');
        }
        
        // Garantir que está no modo simples (não parcelado)
        if (elemEhParcelado) {
            elemEhParcelado.checked = false;
        }
        document.getElementById('campos-parcelamento').style.display = 'none';
        document.getElementById('campo-valor-simples').style.display = 'block';
        
        // Preencher formulário com dados
        elemData.value = data.data;
        elemDescricao.value = data.descricao.split(' (')[0]; // Remove info de parcela
        elemCategoria.value = data.categoria_id;
        elemValorSimples.value = data.valor;
        
        // Mudar botão para atualizar
        const form = document.querySelector('form');
        if (!form) {
            throw new Error('Formulário não encontrado');
        }
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            await handleUpdateLancamento(id);
        };
        
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) {
            throw new Error('Botão de submit não encontrado');
        }
        
        btn.innerHTML = '<i class="bi bi-check-circle"></i> Atualizar';
        btn.className = 'btn btn-primary';
        
        // Remover botão cancelar anterior se existir
        const cancelBtnAntigo = form.querySelector('button.btn-secondary');
        if (cancelBtnAntigo) cancelBtnAntigo.remove();
        
        // Adicionar botão cancelar
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-secondary ms-2';
        cancelBtn.innerHTML = '<i class="bi bi-x-circle"></i> Cancelar';
        cancelBtn.onclick = () => {
            form.reset();
            form.onsubmit = handleAddLancamento;
            btn.innerHTML = '<i class="bi bi-plus-circle"></i> Adicionar';
            btn.className = 'btn btn-success';
            cancelBtn.remove();
        };
        btn.after(cancelBtn);
        
        // Scroll para o formulário
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showAlert('Lançamento carregado! Altere os dados e clique em Atualizar.', 'info');
    } catch (err) {
        console.error('Erro ao carregar lançamento:', err);
        showAlert('Erro ao carregar lançamento: ' + err.message, 'danger');
    }
}

async function handleUpdateLancamento(id) {
    const data = document.getElementById('lanc-data').value;
    const descricao = document.getElementById('lanc-descricao').value;
    const categoria_id = parseInt(document.getElementById('lanc-categoria').value);
    const valor = parseFloat(document.getElementById('lanc-valor-simples').value);
    
    if (!data || !descricao || !categoria_id || !valor) {
        showAlert('Preencha todos os campos!', 'warning');
        return;
    }
    
    try {
        const { error } = await supabase
            .from('lancamentos')
            .update({ data, descricao, categoria_id, valor })
            .eq('id', id);
        
        if (error) throw error;
        
        showAlert('Lançamento atualizado com sucesso!', 'success');
        
        // Resetar formulário
        const form = document.querySelector('form');
        form.reset();
        const hoje = new Date();
        const dataLocal = hoje.getFullYear() + '-' + 
            String(hoje.getMonth() + 1).padStart(2, '0') + '-' + 
            String(hoje.getDate()).padStart(2, '0');
        document.getElementById('lanc-data').value = dataLocal;
        
        form.onsubmit = handleAddLancamento;
        const btn = form.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="bi bi-plus-circle"></i> Adicionar';
        btn.className = 'btn btn-success';
        document.querySelector('button.btn-secondary')?.remove();
        
        await loadLancamentos();
    } catch (err) {
        showAlert('Erro ao atualizar lançamento: ' + err.message, 'danger');
    }
}

async function deleteLancamento(id) {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    
    try {
        const { error } = await supabase
            .from('lancamentos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showAlert('Lançamento excluído com sucesso!', 'success');
        await loadLancamentos();
        if (currentPage === 'home') await loadDashboard();
    } catch (err) {
        showAlert('Erro ao excluir lançamento', 'danger');
    }
}

// ============================================
// CATEGORIAS
// ============================================

function getCategoriasHTML() {
    return `
        ${getNavbar('categorias')}
        <div class="container mt-4">
            <h2><i class="bi bi-tags"></i> Categorias</h2>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Nova Categoria</h5>
                    <form onsubmit="handleAddCategoria(event)" class="row g-3">
                        <div class="col-md-6">
                            <input type="text" class="form-control" id="cat-nome" placeholder="Nome da categoria" required>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="cat-tipo" required>
                                <option value="despesa">Despesa</option>
                                <option value="receita">Receita</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <button type="submit" class="btn btn-success w-100">
                                <i class="bi bi-plus-circle"></i> Adicionar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div id="categorias-list"></div>
        </div>
    `;
}

async function loadCategoriasPage() {
    await loadCategorias();
    displayCategorias();
}

function displayCategorias() {
    const listEl = document.getElementById('categorias-list');
    
    if (categorias.length === 0) {
        listEl.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Nenhuma categoria cadastrada.
            </div>
        `;
        return;
    }
    
    const despesas = categorias.filter(c => c.tipo === 'despesa');
    const receitas = categorias.filter(c => c.tipo === 'receita');
    
    let html = '<div class="row">';
    
    // Coluna de Despesas
    html += '<div class="col-md-6">';
    if (despesas.length > 0) {
        html += `
            <h5><i class="bi bi-arrow-down-circle text-danger"></i> Despesas</h5>
            <div class="table-responsive">
                <table class="table table-sm table-hover">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th style="width: 80px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        despesas.forEach(cat => {
            html += `
                <tr>
                    <td>${cat.nome}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-sm" onclick="editarCategoria(${cat.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteCategoria(${cat.id})" title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
    } else {
        html += '<p class="text-muted">Nenhuma categoria de despesa</p>';
    }
    html += '</div>';
    
    // Coluna de Receitas
    html += '<div class="col-md-6">';
    if (receitas.length > 0) {
        html += `
            <h5><i class="bi bi-arrow-up-circle text-success"></i> Receitas</h5>
            <div class="table-responsive">
                <table class="table table-sm table-hover">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th style="width: 80px;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        receitas.forEach(cat => {
            html += `
                <tr>
                    <td>${cat.nome}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-sm" onclick="editarCategoria(${cat.id})" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteCategoria(${cat.id})" title="Excluir">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        html += '</tbody></table></div>';
    } else {
        html += '<p class="text-muted">Nenhuma categoria de receita</p>';
    }
    html += '</div>';
    
    html += '</div>';
    listEl.innerHTML = html;
}

async function handleAddCategoria(event) {
    event.preventDefault();
    
    const nome = document.getElementById('cat-nome').value;
    const tipo = document.getElementById('cat-tipo').value;
    
    try {
        const { error } = await supabase
            .from('categorias')
            .insert([{ usuario_id: currentUser.id, nome, tipo }]);
        
        if (error) throw error;
        
        showAlert('Categoria adicionada com sucesso!', 'success');
        event.target.reset();
        await loadCategoriasPage();
    } catch (err) {
        showAlert('Erro ao adicionar categoria: ' + err.message, 'danger');
    }
}

async function editarCategoria(id) {
    const categoria = categorias.find(c => c.id === id);
    if (!categoria) return;
    
    const novoNome = prompt('Novo nome da categoria:', categoria.nome);
    if (!novoNome || novoNome === categoria.nome) return;
    
    try {
        const { error } = await supabase
            .from('categorias')
            .update({ nome: novoNome })
            .eq('id', id);
        
        if (error) throw error;
        
        showAlert('Categoria atualizada!', 'success');
        await loadCategoriasPage();
    } catch (err) {
        showAlert('Erro ao atualizar categoria', 'danger');
    }
}

async function deleteCategoria(id) {
    if (!confirm('Tem certeza? Lançamentos desta categoria ficarão sem categoria.')) return;
    
    try {
        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showAlert('Categoria excluída!', 'success');
        await loadCategoriasPage();
    } catch (err) {
        showAlert('Erro ao excluir categoria', 'danger');
    }
}

async function criarCategoriasIniciais(usuarioId) {
    const categoriasIniciais = [
        { usuario_id: usuarioId, nome: 'Alimentação', tipo: 'despesa' },
        { usuario_id: usuarioId, nome: 'Transporte', tipo: 'despesa' },
        { usuario_id: usuarioId, nome: 'Moradia', tipo: 'despesa' },
        { usuario_id: usuarioId, nome: 'Saúde', tipo: 'despesa' },
        { usuario_id: usuarioId, nome: 'Lazer', tipo: 'despesa' },
        { usuario_id: usuarioId, nome: 'Salário', tipo: 'receita' },
        { usuario_id: usuarioId, nome: 'Investimentos', tipo: 'receita' },
        { usuario_id: usuarioId, nome: 'Outros', tipo: 'despesa' }
    ];
    
    await supabase.from('categorias').insert(categoriasIniciais);
}

// ============================================
// CONTAS FIXAS
// ============================================

function getContasFixasHTML() {
    return `
        ${getNavbar('contas_fixas')}
        <div class="container mt-4">
            <h2 class="mb-4"><i class="bi bi-arrow-repeat"></i> Contas Fixas</h2>
            
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> 
                <strong>Como usar:</strong> Marque "Conta Fixa" ao criar um lançamento. As contas fixas aparecem aqui para você editar ou excluir.
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div id="contas-fixas-list"></div>
                </div>
            </div>
        </div>
        
        <!-- Modal Criar/Editar Conta Fixa -->
        <div class="modal fade" id="modalEditarContaFixa" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalContaFixaTitulo">Conta Fixa</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="formEditarContaFixa">
                            <input type="hidden" id="edit-conta-fixa-id">
                            <div class="mb-3">
                                <label class="form-label">Descrição</label>
                                <input type="text" class="form-control" id="edit-conta-fixa-descricao" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Categoria</label>
                                <select class="form-select" id="edit-conta-fixa-categoria" required>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Valor</label>
                                <input type="number" step="0.01" class="form-control" id="edit-conta-fixa-valor" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Dia Vencimento</label>
                                <input type="number" min="1" max="31" class="form-control" id="edit-conta-fixa-dia" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="salvarContaFixa()">Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadContasFixas() {
    try {
        console.log('Carregando contas fixas para usuário:', currentUser);
        const { data, error } = await supabase
            .from('contas_fixas')
            .select('*, categorias(nome)')
            .eq('usuario_id', currentUser.id)
            .order('dia_vencimento');
        
        if (error) {
            console.error('Erro na query Supabase (contas fixas):', error);
            throw error;
        }
        
        console.log('Contas fixas carregadas:', data?.length || 0);
        contasFixas = data || [];
        
        // Verificar se elemento existe antes de chamar display
        if (document.getElementById('contas-fixas-list')) {
            displayContasFixas();
        } else {
            console.error('Elemento contas-fixas-list não encontrado no DOM!');
        }
    } catch (err) {
        console.error('Erro ao carregar contas fixas:', err);
        const listEl = document.getElementById('contas-fixas-list');
        if (listEl) {
            listEl.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Erro ao carregar contas fixas: ${err.message}
                    <br><small>Verifique o console para mais detalhes</small>
                </div>
            `;
        } else {
            console.error('Não foi possível mostrar erro: elemento não existe');
        }
        showAlert('Erro ao carregar contas fixas: ' + err.message, 'danger');
    }
}

function displayContasFixas() {
    const listEl = document.getElementById('contas-fixas-list');
    
    if (!listEl) {
        console.error('Elemento contas-fixas-list não encontrado!');
        return;
    }
    
    if (contasFixas.length === 0) {
        listEl.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Nenhuma conta fixa cadastrada.
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Valor</th>
                        <th>Dia</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th style="width: 150px;">Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    contasFixas.forEach(conta => {
        const valor = parseFloat(conta.valor).toFixed(2);
        const classeValor = conta.tipo === 'receita' ? 'text-success' : 'text-danger';
        
        html += `
            <tr class="${!conta.ativa ? 'table-secondary' : ''}">
                <td>${conta.descricao}</td>
                <td><span class="badge bg-secondary">${conta.categorias ? conta.categorias.nome : '-'}</span></td>
                <td class="${classeValor}"><strong>R$ ${valor}</strong></td>
                <td>${conta.dia_vencimento}</td>
                <td><span class="badge ${conta.tipo === 'receita' ? 'bg-success' : 'bg-danger'}">${conta.tipo}</span></td>
                <td>
                    <button class="btn btn-sm ${conta.ativa ? 'btn-success' : 'btn-secondary'}" 
                            onclick="toggleContaFixaStatus(${conta.id}, ${conta.ativa})">
                        ${conta.ativa ? '<i class="bi bi-check-circle"></i>' : '<i class="bi bi-x-circle"></i>'}
                    </button>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editarContaFixa(${conta.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteContaFixa(${conta.id})" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    listEl.innerHTML = html;
}

async function editarContaFixa(id) {
    const conta = contasFixas.find(c => c.id === id);
    if (!conta) return;
    
    // Preencher modal
    document.getElementById('edit-conta-fixa-id').value = conta.id;
    document.getElementById('edit-conta-fixa-descricao').value = conta.descricao;
    document.getElementById('edit-conta-fixa-valor').value = conta.valor;
    document.getElementById('edit-conta-fixa-dia').value = conta.dia_vencimento;
    
    // Carregar categorias no select do modal
    const select = document.getElementById('edit-conta-fixa-categoria');
    select.innerHTML = '<option value="">Selecione...</option>' +
        categorias.map(c => `<option value="${c.id}">${c.nome} (${c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)})</option>`).join('');
    select.value = conta.categoria_id;
    
    // Alterar título do modal
    document.getElementById('modalContaFixaTitulo').textContent = 'Editar Conta Fixa';
    
    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('modalEditarContaFixa'));
    modal.show();
}

async function salvarContaFixa() {
    try {
        const id = document.getElementById('edit-conta-fixa-id').value;
        const descricao = document.getElementById('edit-conta-fixa-descricao').value;
        const categoria_id = parseInt(document.getElementById('edit-conta-fixa-categoria').value);
        const valor = parseFloat(document.getElementById('edit-conta-fixa-valor').value);
        const dia_vencimento = parseInt(document.getElementById('edit-conta-fixa-dia').value);
        
        if (!descricao || !categoria_id || !valor || !dia_vencimento) {
            showAlert('Preencha todos os campos!', 'warning');
            return;
        }
        
        // Buscar tipo da categoria
        const { data: categoria, error: catError } = await supabase
            .from('categorias')
            .select('tipo')
            .eq('id', categoria_id)
            .single();
        
        if (catError) throw catError;
        
        if (id) {
            // Atualizar conta existente
            const { error } = await supabase
                .from('contas_fixas')
                .update({
                    descricao,
                    categoria_id,
                    valor,
                    dia_vencimento,
                    tipo: categoria.tipo
                })
                .eq('id', parseInt(id));
            
            if (error) throw error;
            showAlert('Conta fixa atualizada com sucesso!', 'success');
        } else {
            // Criar nova conta
            const { error } = await supabase
                .from('contas_fixas')
                .insert([{
                    usuario_id: currentUser.id,
                    descricao,
                    categoria_id,
                    valor,
                    dia_vencimento,
                    tipo: categoria.tipo,
                    ativa: true
                }]);
            
            if (error) throw error;
            showAlert('Conta fixa criada com sucesso!', 'success');
        }
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarContaFixa'));
        modal.hide();
        
        await loadContasFixas();
    } catch (err) {
        showAlert('Erro ao salvar conta fixa: ' + err.message, 'danger');
    }
}

// Expor funções para o window para uso no onclick
window.editarContaFixa = editarContaFixa;
window.salvarContaFixa = salvarContaFixa;

async function toggleContaFixaStatus(id, ativaAtual) {
    try {
        const { error } = await supabase
            .from('contas_fixas')
            .update({ ativa: !ativaAtual })
            .eq('id', id);
        
        if (error) throw error;
        
        await loadContasFixas();
    } catch (err) {
        showAlert('Erro ao alterar status', 'danger');
    }
}

async function deleteContaFixa(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta fixa?')) return;
    
    try {
        const { error } = await supabase
            .from('contas_fixas')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        
        showAlert('Conta fixa excluída!', 'success');
        await loadContasFixas();
    } catch (err) {
        showAlert('Erro ao excluir conta fixa', 'danger');
    }
}

async function gerarContasFixasMes() {
    const mes = mesAtual;
    
    if (!confirm(`Gerar lançamentos das contas fixas ativas para ${getNomeMes()}?`)) return;
    
    try {
        const contasAtivas = contasFixas.filter(c => c.ativa);
        
        if (contasAtivas.length === 0) {
            showAlert('Nenhuma conta fixa ativa!', 'warning');
            return;
        }
        
        const lancamentos = [];
        
        for (const conta of contasAtivas) {
            const data = `${mes}-${String(conta.dia_vencimento).padStart(2, '0')}`;
            
            // Verificar se já existe
            const { data: existe } = await supabase
                .from('lancamentos')
                .select('id')
                .eq('usuario_id', currentUser.id)
                .eq('conta_fixa_id', conta.id)
                .eq('data', data)
                .single();
            
            if (!existe) {
                lancamentos.push({
                    usuario_id: currentUser.id,
                    data,
                    descricao: conta.descricao,
                    categoria_id: conta.categoria_id,
                    valor: conta.valor,
                    tipo: conta.tipo,
                    status: 'pendente',
                    conta_fixa_id: conta.id,
                    parcela_atual: null,
                    parcela_total: null,
                    contrato_parcelado: null
                });
            }
        }
        
        if (lancamentos.length === 0) {
            showAlert('Todas as contas fixas já foram geradas para este mês!', 'info');
            return;
        }
        
        const { error } = await supabase
            .from('lancamentos')
            .insert(lancamentos);
        
        if (error) throw error;
        
        showAlert(`${lancamentos.length} lançamentos criados com sucesso!`, 'success');
    } catch (err) {
        showAlert('Erro ao gerar contas fixas: ' + err.message, 'danger');
    }
}

// ============================================
// CONTAS PARCELADAS
// ============================================

function getContasParceladasHTML() {
    return `
        ${getNavbar('contas_parceladas')}
        <div class="container mt-4">
            <h2><i class="bi bi-credit-card"></i> Contas Parceladas</h2>
            
            <div id="contratos-parcelados"></div>
        </div>
    `;
}

async function loadContasParceladas() {
    try {
        console.log('Carregando contas parceladas para usuário:', currentUser);
        
        // Buscar apenas parcelas PENDENTES
        const { data, error } = await supabase
            .from('lancamentos')
            .select('id, usuario_id, data, descricao, categoria_id, valor, tipo, status, conta_fixa_id, parcela_atual')
            .eq('usuario_id', currentUser.id)
            .eq('status', 'pendente')
            .not('parcela_atual', 'is', null)
            .order('data');
        
        if (error) {
            console.error('Erro na query Supabase (parceladas):', error);
            throw error;
        }
        
        console.log('Lançamentos parcelados pendentes encontrados:', data?.length || 0);
        
        // Agrupar por descrição base (sem a parte da parcela)
        const contratos = {};
        data.forEach(lanc => {
            // Extrair descrição base removendo " (X/Y)"
            const descricaoBase = lanc.descricao.replace(/\s*\(\d+\/\d+\)$/, '');
            const contratoKey = `${descricaoBase}_${lanc.categoria_id}_${lanc.tipo}`;
            
            if (!contratos[contratoKey]) {
                contratos[contratoKey] = [];
            }
            contratos[contratoKey].push(lanc);
        });
        
        // Todos os contratos já têm pelo menos 1 parcela pendente (pela query)
        console.log('Contratos com parcelas pendentes:', Object.keys(contratos).length);
        displayContratosParcelados(contratos);
    } catch (err) {
        console.error('Erro ao carregar contas parceladas:', err);
        const listEl = document.getElementById('contratos-parcelados');
        if (listEl) {
            listEl.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Erro ao carregar contas parceladas: ${err.message}
                    <br><small>Verifique o console para mais detalhes</small>
                </div>
            `;
        }
        showAlert('Erro ao carregar contas parceladas: ' + err.message, 'danger');
    }
}

function displayContratosParcelados(contratos) {
    const listEl = document.getElementById('contratos-parcelados');
    
    if (!listEl) {
        console.error('Elemento contratos-parcelados não encontrado!');
        return;
    }
    
    if (Object.keys(contratos).length === 0) {
        console.log('Nenhum contrato parcelado para exibir');
        listEl.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Nenhuma conta parcelada encontrada.
            </div>
        `;
        return;
    }
    
    console.log('Montando HTML para', Object.keys(contratos).length, 'contratos');
    let html = '';
    
    let contratoIndex = 0;
    for (const [contratoId, parcelas] of Object.entries(contratos)) {
        const primeira = parcelas[0];
        const valorTotal = parcelas.reduce((sum, p) => sum + parseFloat(p.valor), 0);
        const pagas = parcelas.filter(p => p.status === 'pago').length;
        const pendentes = parcelas.length - pagas;
        const valorPago = parcelas.filter(p => p.status === 'pago').reduce((sum, p) => sum + parseFloat(p.valor), 0);
        const valorPendente = parcelas.filter(p => p.status === 'pendente').reduce((sum, p) => sum + parseFloat(p.valor), 0);
        
        const collapseId = `collapse-contrato-${contratoIndex}`;
        contratoIndex++;
        
        html += `
            <div class="card mb-4">
                <div class="card-header bg-primary text-white" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="bi bi-chevron-right me-2"></i>
                            ${primeira.descricao.split(' (')[0]}
                        </h5>
                        <div>
                            <span class="badge bg-light text-dark me-2">${pagas}/${parcelas.length} pagas</span>
                            <span class="badge bg-warning">R$ ${valorPendente.toFixed(2)} pendente</span>
                        </div>
                    </div>
                </div>
                <div id="${collapseId}" class="collapse">
                    <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <strong>Valor Total:</strong><br>
                            <span class="text-${primeira.tipo === 'receita' ? 'success' : 'danger'}">R$ ${valorTotal.toFixed(2)}</span>
                        </div>
                        <div class="col-md-3">
                            <strong>Valor Pago:</strong><br>
                            <span class="text-success">R$ ${valorPago.toFixed(2)}</span>
                        </div>
                        <div class="col-md-3">
                            <strong>Valor Pendente:</strong><br>
                            <span class="text-warning">R$ ${valorPendente.toFixed(2)}</span>
                        </div>
                        <div class="col-md-3">
                            <div class="btn-group w-100">
                                <button class="btn btn-success btn-sm" onclick='quitarIntegral(${JSON.stringify(parcelas.filter(p => p.status === "pendente").map(p => p.id))}, ${valorPendente})'>
                                    <i class="bi bi-check-all"></i> Quitar Integral
                                </button>
                                <button class="btn btn-warning btn-sm" onclick='quitarParcial(${JSON.stringify(parcelas.filter(p => p.status === "pendente").map(p => p.id))})'>
                                    <i class="bi bi-check-circle"></i> Quitar Parcial
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th>Parcela</th>
                                    <th>Data</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        parcelas.forEach(parcela => {
            html += `
                <tr class="${parcela.status === 'pago' ? 'table-success' : ''}">
                    <td>Parcela ${parcela.parcela_atual}</td>
                    <td>${formatDate(parcela.data)}</td>
                    <td>R$ ${parseFloat(parcela.valor).toFixed(2)}</td>
                    <td>
                        <span class="badge ${parcela.status === 'pago' ? 'bg-success' : 'bg-warning'}">
                            ${parcela.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm ${parcela.status === 'pago' ? 'btn-warning' : 'btn-success'}" 
                                onclick="toggleStatus(${parcela.id}, '${parcela.status}')">
                            ${parcela.status === 'pago' ? 'Desfazer' : 'Pagar'}
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    listEl.innerHTML = html;
}

async function quitarIntegral(parcelasIds, valorPendente) {
    console.log('Quitação integral - IDs:', parcelasIds, 'Valor pendente:', valorPendente);
    
    if (!parcelasIds || parcelasIds.length === 0) {
        showAlert('Nenhuma parcela pendente!', 'info');
        return;
    }
    
    const desconto = parseFloat(prompt(`Valor pendente: R$ ${valorPendente.toFixed(2)}\n\nInforme o desconto (em R$):`, '0') || 0);
    
    if (desconto < 0 || desconto > valorPendente) {
        showAlert('Desconto inválido!', 'danger');
        return;
    }
    
    const valorFinal = valorPendente - desconto;
    const msg = desconto > 0 
        ? `Quitar por R$ ${valorFinal.toFixed(2)} (desconto de R$ ${desconto.toFixed(2)})?`
        : `Quitar todas as parcelas pendentes por R$ ${valorFinal.toFixed(2)}?`;
    
    if (!confirm(msg)) return;
    
    try {
        console.log('Executando quitação integral...');
        
        // Buscar informações das parcelas
        const { data: parcelas, error: fetchError } = await supabase
            .from('lancamentos')
            .select('id, descricao, categoria_id, tipo, parcela_atual, total_parcelas')
            .in('id', parcelasIds);
        
        if (fetchError) throw fetchError;
        
        // Deletar as parcelas pendentes
        const { error: deleteError } = await supabase
            .from('lancamentos')
            .delete()
            .in('id', parcelasIds);
        
        if (deleteError) throw deleteError;
        
        // Criar lançamento único de quitação com data de hoje
        const hoje = new Date().toISOString().split('T')[0];
        const descricaoBase = parcelas[0].descricao.split(' (')[0];
        const categoria_id = parcelas[0].categoria_id;
        const tipo = parcelas[0].tipo;
        
        const observacoes = JSON.stringify({
            tipo_quitacao: 'integral',
            parcelas_quitadas: parcelasIds.length,
            valor_original: valorPendente,
            desconto_aplicado: desconto,
            valor_pago: valorFinal,
            data_quitacao: hoje,
            parcelas_detalhes: parcelas.map(p => ({
                id: p.id,
                parcela: `${p.parcela_atual}/${p.total_parcelas}`
            }))
        });
        
        const { error: insertError } = await supabase
            .from('lancamentos')
            .insert([{
                usuario_id: currentUser.id,
                data: hoje,
                descricao: `${descricaoBase} - Quitação Integral`,
                categoria_id,
                valor: valorFinal,
                tipo,
                status: 'pago',
                conta_fixa_id: null,
                parcela_atual: null,
                observacoes
            }]);
        
        if (insertError) throw insertError;
        
        console.log('Quitação integral realizada com sucesso');
        showAlert(`Quitação integral realizada! Valor pago: R$ ${valorFinal.toFixed(2)}`, 'success');
        await loadContasParceladas();
        if (currentPage === 'lancamentos') await loadLancamentos();
    } catch (err) {
        console.error('Erro ao quitar:', err);
        showAlert('Erro ao quitar: ' + err.message, 'danger');
    }
}

async function quitarParcial(parcelasIds) {
    console.log('Quitação parcial - IDs disponíveis:', parcelasIds);
    
    if (!parcelasIds || parcelasIds.length === 0) {
        showAlert('Nenhuma parcela pendente!', 'info');
        return;
    }
    
    try {
        // Buscar todas as parcelas pendentes
        const { data: todasParcelas, error } = await supabase
            .from('lancamentos')
            .select('id, descricao, categoria_id, tipo, valor, parcela_atual, total_parcelas, data')
            .in('id', parcelasIds)
            .eq('status', 'pendente')
            .order('parcela_atual');
        
        if (error) throw error;
        
        if (todasParcelas.length === 0) {
            showAlert('Nenhuma parcela pendente!', 'info');
            return;
        }
        
        // Mostrar modal de seleção de parcelas
        mostrarModalSelecaoParcelas(todasParcelas);
        
    } catch (err) {
        console.error('Erro ao buscar parcelas:', err);
        showAlert('Erro ao buscar parcelas: ' + err.message, 'danger');
    }
}

function mostrarModalSelecaoParcelas(parcelas) {
    const modalHTML = `
        <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" id="modalSelecaoParcelas">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="bi bi-check2-square"></i> Selecione as Parcelas para Quitar
                        </h5>
                        <button type="button" class="btn-close" onclick="fecharModalSelecaoParcelas()"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted">Marque as parcelas que deseja quitar:</p>
                        <div class="list-group">
                            ${parcelas.map(p => `
                                <label class="list-group-item">
                                    <input class="form-check-input me-2" type="checkbox" value="${p.id}" data-valor="${p.valor}" data-parcela="${p.parcela_atual}/${p.total_parcelas}">
                                    Parcela ${p.parcela_atual}/${p.total_parcelas} - ${formatDate(p.data)} - R$ ${parseFloat(p.valor).toFixed(2)}
                                </label>
                            `).join('')}
                        </div>
                        <hr>
                        <p><strong>Total selecionado:</strong> <span id="totalSelecionado">R$ 0,00</span></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="fecharModalSelecaoParcelas()">Cancelar</button>
                        <button type="button" class="btn btn-success" onclick="confirmarSelecaoParcelas()">Confirmar Seleção</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
    
    // Atualizar total ao selecionar
    document.querySelectorAll('#modalSelecaoParcelas input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', atualizarTotalSelecionado);
    });
}

function atualizarTotalSelecionado() {
    const checkboxes = document.querySelectorAll('#modalSelecaoParcelas input[type="checkbox"]:checked');
    const total = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.valor), 0);
    document.getElementById('totalSelecionado').textContent = `R$ ${total.toFixed(2)}`;
}

function fecharModalSelecaoParcelas() {
    const modal = document.getElementById('modalSelecaoParcelas');
    if (modal) modal.remove();
}

async function confirmarSelecaoParcelas() {
    const checkboxes = document.querySelectorAll('#modalSelecaoParcelas input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showAlert('Selecione pelo menos uma parcela!', 'warning');
        return;
    }
    
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const valorTotal = Array.from(checkboxes).reduce((sum, cb) => sum + parseFloat(cb.dataset.valor), 0);
    const parcelas = Array.from(checkboxes).map(cb => cb.dataset.parcela);
    
    fecharModalSelecaoParcelas();
    
    // Mostrar modal de desconto
    mostrarModalDesconto(ids, valorTotal, parcelas);
}

function mostrarModalDesconto(parcelasIds, valorTotal, parcelasInfo) {
    const modalHTML = `
        <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" id="modalDesconto">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-cash-coin"></i> Aplicar Desconto?
                        </h5>
                        <button type="button" class="btn-close btn-close-white" onclick="fecharModalDesconto()"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Valor Total:</strong> R$ ${valorTotal.toFixed(2)}</p>
                        <p><strong>Parcelas:</strong> ${parcelasInfo.join(', ')}</p>
                        <hr>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="checkDesconto">
                            <label class="form-check-label" for="checkDesconto">
                                Aplicar desconto
                            </label>
                        </div>
                        <div id="campoDesconto" style="display: none;" class="mt-3">
                            <label class="form-label">Valor do desconto (R$)</label>
                            <input type="number" class="form-control" id="inputDesconto" step="0.01" min="0" max="${valorTotal}" value="0">
                            <small class="text-muted">Valor final: <span id="valorFinal">R$ ${valorTotal.toFixed(2)}</span></small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="fecharModalDesconto()">Cancelar</button>
                        <button type="button" class="btn btn-success" onclick="processarQuitacaoParcial(${JSON.stringify(parcelasIds)}, ${valorTotal})">Confirmar Quitação</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstElementChild);
    
    // Controlar exibição do campo de desconto
    document.getElementById('checkDesconto').addEventListener('change', function() {
        const campo = document.getElementById('campoDesconto');
        campo.style.display = this.checked ? 'block' : 'none';
        if (!this.checked) {
            document.getElementById('inputDesconto').value = 0;
            document.getElementById('valorFinal').textContent = `R$ ${valorTotal.toFixed(2)}`;
        }
    });
    
    document.getElementById('inputDesconto').addEventListener('input', function() {
        const desconto = parseFloat(this.value) || 0;
        const final = valorTotal - desconto;
        document.getElementById('valorFinal').textContent = `R$ ${final.toFixed(2)}`;
    });
}

function fecharModalDesconto() {
    const modal = document.getElementById('modalDesconto');
    if (modal) modal.remove();
}

async function processarQuitacaoParcial(parcelasIds, valorOriginal) {
    try {
        const desconto = document.getElementById('checkDesconto').checked 
            ? parseFloat(document.getElementById('inputDesconto').value) || 0 
            : 0;
        
        if (desconto < 0 || desconto > valorOriginal) {
            showAlert('Desconto inválido!', 'danger');
            return;
        }
        
        const valorFinal = valorOriginal - desconto;
        
        fecharModalDesconto();
        
        // Buscar detalhes das parcelas
        const { data, error: fetchError } = await supabase
            .from('lancamentos')
            .select('id, descricao, categoria_id, tipo, valor, parcela_atual, total_parcelas')
            .in('id', parcelasIds);
        
        if (fetchError) throw fetchError;
        
        // Deletar as parcelas quitadas
        const { error: deleteError } = await supabase
            .from('lancamentos')
            .delete()
            .in('id', parcelasIds);
        
        if (deleteError) throw deleteError;
        
        // Criar lançamento único de quitação com data de hoje
        const hoje = new Date().toISOString().split('T')[0];
        const descricaoBase = data[0].descricao.split(' (')[0];
        const categoria_id = data[0].categoria_id;
        const tipo = data[0].tipo;
        
        const observacoes = JSON.stringify({
            tipo_quitacao: 'parcial',
            parcelas_quitadas: data.length,
            valor_original: valorOriginal,
            desconto_aplicado: desconto,
            valor_pago: valorFinal,
            data_quitacao: hoje,
            parcelas_detalhes: data.map(p => ({
                id: p.id,
                parcela: `${p.parcela_atual}/${p.total_parcelas}`,
                valor: parseFloat(p.valor)
            }))
        });
        
        const { error: insertError } = await supabase
            .from('lancamentos')
            .insert([{
                usuario_id: currentUser.id,
                data: hoje,
                descricao: `${descricaoBase} - Quitação Parcial (${data.length} parcelas)`,
                categoria_id,
                valor: valorFinal,
                tipo,
                status: 'pago',
                conta_fixa_id: null,
                parcela_atual: null,
                observacoes
            }]);
        
        if (insertError) throw insertError;
        
        showAlert(`${data.length} parcelas quitadas! Valor pago: R$ ${valorFinal.toFixed(2)}`, 'success');
        await loadContasParceladas();
        if (currentPage === 'lancamentos') await loadLancamentos();
    } catch (err) {
        console.error('Erro ao quitar parcelas:', err);
        showAlert('Erro ao quitar: ' + err.message, 'danger');
    }
}

// ============================================
// RELATÓRIOS
// ============================================

function getRelatoriosHTML() {
    return `
        ${getNavbar('relatorios')}
        <div class="container mt-4">
            <h2><i class="bi bi-file-earmark-bar-graph"></i> Relatórios</h2>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Filtros</h5>
                    <div class="row">
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Data Início</label>
                            <input type="date" class="form-control" id="rel-data-inicio">
                        </div>
                        <div class="col-md-3 mb-3">
                            <label class="form-label">Data Fim</label>
                            <input type="date" class="form-control" id="rel-data-fim">
                        </div>
                        <div class="col-md-2 mb-3">
                            <label class="form-label">Tipo</label>
                            <select class="form-select" id="rel-tipo">
                                <option value="">Todos</option>
                                <option value="receita">Receitas</option>
                                <option value="despesa">Despesas</option>
                            </select>
                        </div>
                        <div class="col-md-2 mb-3">
                            <label class="form-label">Categoria</label>
                            <select class="form-select" id="rel-categoria">
                                <option value="">Todas</option>
                            </select>
                        </div>
                        <div class="col-md-2 mb-3">
                            <label class="form-label">&nbsp;</label>
                            <button class="btn btn-primary w-100" onclick="gerarRelatorio()">
                                <i class="bi bi-search"></i> Gerar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="relatorio-resultado"></div>
        </div>
    `;
}

async function loadRelatorios() {
    // Definir período padrão: mês atual
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    document.getElementById('rel-data-inicio').valueAsDate = inicio;
    document.getElementById('rel-data-fim').valueAsDate = fim;
    
    // Buscar e carregar categorias no filtro
    try {
        const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .eq('usuario_id', currentUser.id)
            .order('nome');
        
        if (error) throw error;
        
        // Armazenar categorias globalmente para usar no filtro dinâmico
        window.todasCategorias = data || [];
        
        const selectCategoria = document.getElementById('rel-categoria');
        if (selectCategoria && data && data.length > 0) {
            selectCategoria.innerHTML = '<option value="">Todas</option>' +
                data.map(c => `<option value="${c.id}">${c.nome} (${c.tipo === 'receita' ? 'Receita' : 'Despesa'})</option>`).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar categorias:', err);
    }
    
    // Adicionar listener no filtro de tipo para atualizar categorias
    const tipoSelect = document.getElementById('rel-tipo');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', filtrarCategoriasRelatorio);
    }
    
    await gerarRelatorio();
}

async function gerarRelatorio() {
    const dataInicio = document.getElementById('rel-data-inicio').value;
    const dataFim = document.getElementById('rel-data-fim').value;
    const tipo = document.getElementById('rel-tipo').value;
    const categoriaId = document.getElementById('rel-categoria').value;
    
    if (!dataInicio || !dataFim) {
        showAlert('Selecione o período!', 'warning');
        return;
    }
    
    try {
        // Buscar todos os lançamentos pagos com data dentro do período
        // (independente de quando foram criados/lançados no sistema)
        let query = supabase
            .from('lancamentos')
            .select('*, categorias(nome)')
            .eq('usuario_id', currentUser.id)
            .gte('data', dataInicio)
            .lte('data', dataFim)
            .eq('status', 'pago');
        
        if (tipo) query = query.eq('tipo', tipo);
        if (categoriaId) query = query.eq('categoria_id', parseInt(categoriaId));
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        displayRelatorio(data, dataInicio, dataFim);
    } catch (err) {
        console.error('Erro ao gerar relatório:', err);
        showAlert('Erro ao gerar relatório', 'danger');
    }
}

function displayRelatorio(lancamentos, dataInicio, dataFim) {
    const resultEl = document.getElementById('relatorio-resultado');
    
    if (lancamentos.length === 0) {
        resultEl.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> Nenhum lançamento pago no período selecionado.
            </div>
        `;
        return;
    }
    
    const receitas = lancamentos.filter(l => l.tipo === 'receita');
    const despesas = lancamentos.filter(l => l.tipo === 'despesa');
    
    const totalReceitas = receitas.reduce((sum, l) => sum + parseFloat(l.valor), 0);
    const totalDespesas = despesas.reduce((sum, l) => sum + parseFloat(l.valor), 0);
    const saldo = totalReceitas - totalDespesas;
    
    // Agrupar por categoria
    const porCategoria = {};
    lancamentos.forEach(lanc => {
        const catNome = lanc.categorias ? lanc.categorias.nome : 'Sem categoria';
        if (!porCategoria[catNome]) {
            porCategoria[catNome] = { receitas: 0, despesas: 0, total: 0 };
        }
        const valor = parseFloat(lanc.valor);
        if (lanc.tipo === 'receita') {
            porCategoria[catNome].receitas += valor;
        } else {
            porCategoria[catNome].despesas += valor;
        }
        porCategoria[catNome].total += lanc.tipo === 'receita' ? valor : -valor;
    });
    
    let html = `
        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-danger" onclick="exportarRelatorioPDF()">
                <i class="bi bi-file-pdf"></i> Exportar PDF
            </button>
        </div>
        
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Resumo do Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}</h5>
            </div>
            <div class="card-body">
                <div class="row text-center">
                    <div class="col-md-4">
                        <h6 class="text-success">Total Receitas</h6>
                        <h3 class="text-success">R$ ${totalReceitas.toFixed(2)}</h3>
                        <small class="text-muted">${receitas.length} lançamentos</small>
                    </div>
                    <div class="col-md-4">
                        <h6 class="text-danger">Total Despesas</h6>
                        <h3 class="text-danger">R$ ${totalDespesas.toFixed(2)}</h3>
                        <small class="text-muted">${despesas.length} lançamentos</small>
                    </div>
                    <div class="col-md-4">
                        <h6 class="${saldo >= 0 ? 'text-primary' : 'text-warning'}">Saldo</h6>
                        <h3 class="${saldo >= 0 ? 'text-primary' : 'text-warning'}">R$ ${saldo.toFixed(2)}</h3>
                        <small class="text-muted">${saldo >= 0 ? 'Positivo' : 'Negativo'}</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">Por Categoria</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th class="text-success">Receitas</th>
                                <th class="text-danger">Despesas</th>
                                <th>Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    Object.entries(porCategoria)
        .sort((a, b) => Math.abs(b[1].despesas) - Math.abs(a[1].despesas))
        .forEach(([categoria, valores]) => {
            html += `
                <tr>
                    <td><strong>${categoria}</strong></td>
                    <td class="text-success">R$ ${valores.receitas.toFixed(2)}</td>
                    <td class="text-danger">R$ ${valores.despesas.toFixed(2)}</td>
                    <td class="${valores.total >= 0 ? 'text-success' : 'text-danger'}">
                        <strong>R$ ${valores.total.toFixed(2)}</strong>
                    </td>
                </tr>
            `;
        });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Detalhamento</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    lancamentos.forEach(lanc => {
        const valor = parseFloat(lanc.valor).toFixed(2);
        const classeValor = lanc.tipo === 'receita' ? 'text-success' : 'text-danger';
        
        html += `
            <tr>
                <td>${formatDate(lanc.data)}</td>
                <td>${lanc.descricao}</td>
                <td><span class="badge bg-secondary">${lanc.categorias ? lanc.categorias.nome : '-'}</span></td>
                <td><span class="badge ${lanc.tipo === 'receita' ? 'bg-success' : 'bg-danger'}">${lanc.tipo}</span></td>
                <td class="${classeValor}"><strong>R$ ${valor}</strong></td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    resultEl.innerHTML = html;
}

async function exportarRelatorioPDF() {
    const dataInicio = document.getElementById('rel-data-inicio').value;
    const dataFim = document.getElementById('rel-data-fim').value;
    const tipo = document.getElementById('rel-tipo').value;
    const categoriaId = document.getElementById('rel-categoria').value;
    
    if (!dataInicio || !dataFim) {
        showAlert('Gere o relatório primeiro!', 'warning');
        return;
    }
    
    try {
        // Buscar dados novamente para garantir consistência
        let query = supabase
            .from('lancamentos')
            .select('*, categorias(nome)')
            .eq('usuario_id', currentUser.id)
            .gte('data', dataInicio)
            .lte('data', dataFim)
            .eq('status', 'pago');
        
        if (tipo) query = query.eq('tipo', tipo);
        if (categoriaId) query = query.eq('categoria_id', parseInt(categoriaId));
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (data.length === 0) {
            showAlert('Nenhum dado para exportar!', 'info');
            return;
        }
        
        // Calcular totais
        const receitas = data.filter(l => l.tipo === 'receita');
        const despesas = data.filter(l => l.tipo === 'despesa');
        const totalReceitas = receitas.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const totalDespesas = despesas.reduce((sum, l) => sum + parseFloat(l.valor), 0);
        const saldo = totalReceitas - totalDespesas;
        
        // Preparar dados para o PDF
        const dadosPDF = {
            periodo: `${formatDate(dataInicio)} a ${formatDate(dataFim)}`,
            totalReceitas: totalReceitas.toFixed(2),
            totalDespesas: totalDespesas.toFixed(2),
            saldo: saldo.toFixed(2),
            lancamentos: data.map(l => ({
                data: formatDate(l.data),
                descricao: l.descricao,
                categoria: l.categorias?.nome || 'Sem categoria',
                tipo: l.tipo,
                valor: parseFloat(l.valor).toFixed(2)
            }))
        };
        
        // Criar PDF usando jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(18);
        doc.text('Relatório Financeiro', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Período: ${dadosPDF.periodo}`, 105, 25, { align: 'center' });
        
        // Resumo
        let y = 35;
        doc.setFontSize(14);
        doc.text('Resumo', 14, y);
        
        y += 8;
        doc.setFontSize(11);
        doc.text(`Total Receitas: R$ ${dadosPDF.totalReceitas}`, 14, y);
        
        y += 6;
        doc.text(`Total Despesas: R$ ${dadosPDF.totalDespesas}`, 14, y);
        
        y += 6;
        doc.setFont(undefined, 'bold');
        doc.text(`Saldo: R$ ${dadosPDF.saldo}`, 14, y);
        doc.setFont(undefined, 'normal');
        
        // Tabela de lançamentos
        y += 12;
        doc.setFontSize(14);
        doc.text('Lançamentos', 14, y);
        
        y += 8;
        doc.setFontSize(9);
        
        // Cabeçalho da tabela
        doc.setFont(undefined, 'bold');
        doc.text('Data', 14, y);
        doc.text('Descrição', 35, y);
        doc.text('Categoria', 100, y);
        doc.text('Tipo', 150, y);
        doc.text('Valor', 175, y);
        doc.setFont(undefined, 'normal');
        
        y += 5;
        
        // Lançamentos
        dadosPDF.lancamentos.forEach((lanc, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                
                // Repetir cabeçalho
                doc.setFont(undefined, 'bold');
                doc.text('Data', 14, y);
                doc.text('Descrição', 35, y);
                doc.text('Categoria', 100, y);
                doc.text('Tipo', 150, y);
                doc.text('Valor', 175, y);
                doc.setFont(undefined, 'normal');
                y += 5;
            }
            
            doc.text(lanc.data, 14, y);
            doc.text(lanc.descricao.substring(0, 30), 35, y);
            doc.text(lanc.categoria.substring(0, 20), 100, y);
            doc.text(lanc.tipo === 'receita' ? 'Receita' : 'Despesa', 150, y);
            doc.text(`R$ ${lanc.valor}`, 175, y);
            
            y += 5;
        });
        
        // Salvar PDF
        const nomeArquivo = `relatorio_${dataInicio}_${dataFim}.pdf`;
        doc.save(nomeArquivo);
        
        showAlert('PDF gerado com sucesso!', 'success');
    } catch (err) {
        console.error('Erro ao exportar PDF:', err);
        showAlert('Erro ao exportar PDF: ' + err.message, 'danger');
    }
}

function filtrarCategoriasRelatorio() {
    const tipoSelecionado = document.getElementById('rel-tipo').value;
    const selectCategoria = document.getElementById('rel-categoria');
    
    if (!selectCategoria || !window.todasCategorias) return;
    
    let categoriasFiltradas = window.todasCategorias;
    
    // Filtrar por tipo se selecionado
    if (tipoSelecionado) {
        categoriasFiltradas = window.todasCategorias.filter(c => c.tipo === tipoSelecionado);
    }
    
    // Atualizar o select
    selectCategoria.innerHTML = '<option value="">Todas</option>' +
        categoriasFiltradas.map(c => `<option value="${c.id}">${c.nome} (${c.tipo === 'receita' ? 'Receita' : 'Despesa'})</option>`).join('');
}

// ============================================
// IMPORTAÇÃO OFX
// ============================================

let transacoesOFX = [];
let transacoesFiltradas = [];

function getImportarOFXHTML() {
    return `
        ${getNavbar('importar_ofx')}
        <div class="container mt-4">
            <h2><i class="bi bi-file-earmark-arrow-up"></i> Importar Extrato OFX</h2>
            
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Selecionar Arquivo OFX</h5>
                    <div class="mb-3">
                        <input type="file" class="form-control" id="arquivo-ofx" accept=".ofx" onchange="processarArquivoOFX(event)">
                        <small class="text-muted">Selecione um arquivo OFX do seu banco para importar transações</small>
                    </div>
                </div>
            </div>
            
            <div id="area-filtros" style="display: none;">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Filtros</h5>
                        <div class="row">
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Tipo</label>
                                <select class="form-select" id="filtro-ofx-tipo" onchange="aplicarFiltrosOFX()">
                                    <option value="">Todos</option>
                                    <option value="CREDIT">Créditos</option>
                                    <option value="DEBIT">Débitos</option>
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Valor Mínimo</label>
                                <input type="number" step="0.01" class="form-control" id="filtro-ofx-min" placeholder="0.00" onchange="aplicarFiltrosOFX()">
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Valor Máximo</label>
                                <input type="number" step="0.01" class="form-control" id="filtro-ofx-max" placeholder="0.00" onchange="aplicarFiltrosOFX()">
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label">Buscar</label>
                                <input type="text" class="form-control" id="filtro-ofx-busca" placeholder="Descrição..." oninput="aplicarFiltrosOFX()">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="filtro-ofx-agrupar" onchange="aplicarFiltrosOFX()">
                                    <label class="form-check-label" for="filtro-ofx-agrupar">
                                        <strong>Agrupar por Estabelecimento</strong>
                                    </label>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-primary w-100" onclick="selecionarTodosOFX()">
                                    <i class="bi bi-check-all"></i> Selecionar Todos
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-secondary w-100" onclick="desmarcarTodosOFX()">
                                    <i class="bi bi-x"></i> Desmarcar Todos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">Transações Encontradas</h5>
                            <button class="btn btn-success" onclick="importarSelecionadosOFX()">
                                <i class="bi bi-download"></i> Importar Selecionados
                            </button>
                        </div>
                        <div id="lista-transacoes-ofx"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function initImportarOFX() {
    transacoesOFX = [];
    transacoesFiltradas = [];
}

function processarArquivoOFX(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const conteudo = e.target.result;
            transacoesOFX = parseOFX(conteudo);
            
            if (transacoesOFX.length === 0) {
                showAlert('Nenhuma transação encontrada no arquivo OFX', 'warning');
                return;
            }
            
            showAlert(transacoesOFX.length + ' transações encontradas!', 'success');
            document.getElementById('area-filtros').style.display = 'block';
            aplicarFiltrosOFX();
        } catch (err) {
            console.error('Erro ao processar OFX:', err);
            showAlert('Erro ao processar arquivo OFX: ' + err.message, 'danger');
        }
    };
    reader.readAsText(file);
}

function parseOFX(conteudo) {
    const transacoes = [];
    
    // Extrair todas as transações (STMTTRN)
    const regex = /<STMTTRN>(.*?)<\/STMTTRN>/gs;
    let match;
    
    while ((match = regex.exec(conteudo)) !== null) {
        const trn = match[1];
        
        // Extrair campos
        const tipo = extrairCampoOFX(trn, 'TRNTYPE');
        const data = extrairCampoOFX(trn, 'DTPOSTED');
        const valor = parseFloat(extrairCampoOFX(trn, 'TRNAMT'));
        const fitid = extrairCampoOFX(trn, 'FITID');
        const memo = extrairCampoOFX(trn, 'MEMO') || extrairCampoOFX(trn, 'NAME') || 'Sem descrição';
        
        if (data && valor !== 0) {
            // Converter data YYYYMMDD para YYYY-MM-DD
            const dataFormatada = data.substring(0, 4) + '-' + data.substring(4, 6) + '-' + data.substring(6, 8);
            
            // Extrair estabelecimento (primeira parte antes de números ou caracteres especiais)
            const estabelecimento = extrairEstabelecimento(memo);
            
            transacoes.push({
                id: fitid || Date.now() + Math.random(),
                tipo: tipo,
                data: dataFormatada,
                valor: Math.abs(valor),
                valorOriginal: valor,
                descricao: memo.trim(),
                estabelecimento: estabelecimento,
                selecionado: false
            });
        }
    }
    
    return transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
}

function extrairCampoOFX(texto, campo) {
    const regex = new RegExp('<' + campo + '>(.*?)(?:<|\\r|\\n)', 'i');
    const match = texto.match(regex);
    return match ? match[1].trim() : '';
}

function extrairEstabelecimento(descricao) {
    // Remove números, datas e caracteres especiais para extrair o nome do estabelecimento
    let estabelecimento = descricao
        .replace(/\\d{2}\\/\\d{2}\\/\\d{2,4}/g, '') // Remove datas
        .replace(/\\d{2}\\/\\d{2}/g, '') // Remove datas parciais
        .replace(/\\d{2}:\\d{2}/g, '') // Remove horários
        .replace(/[0-9]+/g, '') // Remove números
        .replace(/[^a-zA-ZÀ-ÿ\\s]/g, ' ') // Remove caracteres especiais
        .replace(/\\s+/g, ' ') // Remove espaços duplicados
        .trim();
    
    // Pegar primeiras palavras (máximo 3)
    const palavras = estabelecimento.split(' ').filter(p => p.length > 2).slice(0, 3);
    return palavras.join(' ') || descricao.substring(0, 30);
}

function aplicarFiltrosOFX() {
    const tipo = document.getElementById('filtro-ofx-tipo').value;
    const min = parseFloat(document.getElementById('filtro-ofx-min').value) || 0;
    const max = parseFloat(document.getElementById('filtro-ofx-max').value) || Infinity;
    const busca = document.getElementById('filtro-ofx-busca').value.toLowerCase();
    const agrupar = document.getElementById('filtro-ofx-agrupar').checked;
    
    // Filtrar transações
    transacoesFiltradas = transacoesOFX.filter(t => {
        if (tipo && t.tipo !== tipo) return false;
        if (t.valor < min || t.valor > max) return false;
        if (busca && !t.descricao.toLowerCase().includes(busca)) return false;
        return true;
    });
    
    if (agrupar) {
        displayTransacoesAgrupadasOFX();
    } else {
        displayTransacoesOFX();
    }
}

function displayTransacoesOFX() {
    const lista = document.getElementById('lista-transacoes-ofx');
    
    if (transacoesFiltradas.length === 0) {
        lista.innerHTML = '<div class="alert alert-info">Nenhuma transação encontrada com os filtros aplicados</div>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-hover"><thead><tr>';
    html += '<th width="50"><input type="checkbox" id="check-all-ofx" onchange="toggleTodosOFX(this.checked)"></th>';
    html += '<th>Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>';
    
    transacoesFiltradas.forEach((t, index) => {
        const tipoTexto = t.tipo === 'CREDIT' ? 'Crédito' : 'Débito';
        const tipoClasse = t.tipo === 'CREDIT' ? 'text-success' : 'text-danger';
        const checked = t.selecionado ? 'checked' : '';
        
        html += '<tr>';
        html += '<td><input type="checkbox" ' + checked + ' onchange="toggleTransacaoOFX(' + index + ')"></td>';
        html += '<td>' + formatarData(t.data) + '</td>';
        html += '<td>' + t.descricao + '</td>';
        html += '<td class="' + tipoClasse + '">' + tipoTexto + '</td>';
        html += '<td class="' + tipoClasse + '">R$ ' + t.valor.toFixed(2) + '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    lista.innerHTML = html;
}

function displayTransacoesAgrupadasOFX() {
    const lista = document.getElementById('lista-transacoes-ofx');
    
    if (transacoesFiltradas.length === 0) {
        lista.innerHTML = '<div class="alert alert-info">Nenhuma transação encontrada com os filtros aplicados</div>';
        return;
    }
    
    // Agrupar por estabelecimento
    const grupos = {};
    transacoesFiltradas.forEach((t, index) => {
        if (!grupos[t.estabelecimento]) {
            grupos[t.estabelecimento] = [];
        }
        grupos[t.estabelecimento].push({...t, indexOriginal: index});
    });
    
    let html = '';
    let grupoIndex = 0;
    
    for (const [estabelecimento, transacoes] of Object.entries(grupos)) {
        const total = transacoes.reduce((sum, t) => sum + (t.tipo === 'CREDIT' ? t.valor : -t.valor), 0);
        const totalTexto = total >= 0 ? ('+R$ ' + total.toFixed(2)) : ('-R$ ' + Math.abs(total).toFixed(2));
        const totalClasse = total >= 0 ? 'text-success' : 'text-danger';
        
        const indices = transacoes.map(t => t.indexOriginal).join(',');
        
        html += '<div class="card mb-3">';
        html += '<div class="card-header" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#grupo-' + grupoIndex + '">';
        html += '<div class="d-flex justify-content-between align-items-center">';
        html += '<div><i class="bi bi-chevron-right me-2"></i>';
        html += '<strong>' + estabelecimento + '</strong>';
        html += '<span class="badge bg-secondary ms-2">' + transacoes.length + ' transações</span></div>';
        html += '<strong class="' + totalClasse + '">' + totalTexto + '</strong>';
        html += '</div></div>';
        html += '<div id="grupo-' + grupoIndex + '" class="collapse">';
        html += '<div class="card-body p-0">';
        html += '<table class="table table-sm mb-0"><thead><tr>';
        html += '<th width="50"><input type="checkbox" onchange="toggleGrupoOFX(this.checked, [' + indices + '])"></th>';
        html += '<th>Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th>';
        html += '</tr></thead><tbody>';
        
        transacoes.forEach(t => {
            const tipoTexto = t.tipo === 'CREDIT' ? 'Crédito' : 'Débito';
            const tipoClasse = t.tipo === 'CREDIT' ? 'text-success' : 'text-danger';
            const checked = t.selecionado ? 'checked' : '';
            
            html += '<tr>';
            html += '<td><input type="checkbox" ' + checked + ' onchange="toggleTransacaoOFX(' + t.indexOriginal + ')"></td>';
            html += '<td>' + formatarData(t.data) + '</td>';
            html += '<td>' + t.descricao + '</td>';
            html += '<td class="' + tipoClasse + '">' + tipoTexto + '</td>';
            html += '<td class="' + tipoClasse + '">R$ ' + t.valor.toFixed(2) + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table></div></div></div>';
        grupoIndex++;
    }
    
    lista.innerHTML = html;
}

function toggleTransacaoOFX(index) {
    transacoesFiltradas[index].selecionado = !transacoesFiltradas[index].selecionado;
}

function toggleTodosOFX(checked) {
    transacoesFiltradas.forEach(t => t.selecionado = checked);
    aplicarFiltrosOFX();
}

function toggleGrupoOFX(checked, indices) {
    indices.forEach(i => {
        transacoesFiltradas[i].selecionado = checked;
    });
    aplicarFiltrosOFX();
}

function selecionarTodosOFX() {
    transacoesFiltradas.forEach(t => t.selecionado = true);
    aplicarFiltrosOFX();
}

function desmarcarTodosOFX() {
    transacoesFiltradas.forEach(t => t.selecionado = false);
    aplicarFiltrosOFX();
}

async function importarSelecionadosOFX() {
    const selecionados = transacoesFiltradas.filter(t => t.selecionado);
    
    if (selecionados.length === 0) {
        showAlert('Nenhuma transação selecionada!', 'warning');
        return;
    }
    
    try {
        // Buscar lançamentos existentes para evitar duplicatas
        const { data: lancamentosExistentes, error: erroBusca } = await supabase
            .from('lancamentos')
            .select('data, descricao, valor')
            .eq('usuario_id', currentUser.id);
        
        if (erroBusca) throw erroBusca;
        
        let importados = 0;
        let duplicados = 0;
        let erros = 0;
        
        for (const transacao of selecionados) {
            // Verificar duplicata (mesma data, descrição similar e valor)
            const isDuplicado = lancamentosExistentes.some(l => {
                return l.data === transacao.data && 
                       Math.abs(parseFloat(l.valor) - transacao.valor) < 0.01 &&
                       l.descricao.toLowerCase().includes(transacao.descricao.toLowerCase().substring(0, 20));
            });
            
            if (isDuplicado) {
                duplicados++;
                continue;
            }
            
            // Determinar tipo (receita ou despesa)
            const tipo = transacao.tipo === 'CREDIT' ? 'receita' : 'despesa';
            
            // Buscar categoria padrão
            const { data: categoriasPadrao } = await supabase
                .from('categorias')
                .select('id')
                .eq('usuario_id', currentUser.id)
                .eq('tipo', tipo)
                .limit(1);
            
            if (!categoriasPadrao || categoriasPadrao.length === 0) {
                erros++;
                continue;
            }
            
            // Inserir lançamento
            const { error: erroInsert } = await supabase
                .from('lancamentos')
                .insert({
                    usuario_id: currentUser.id,
                    data: transacao.data,
                    descricao: transacao.descricao,
                    categoria_id: categoriasPadrao[0].id,
                    valor: transacao.valor,
                    tipo: tipo,
                    status: 'pago', // Importações OFX são consideradas pagas
                    conta_fixa_id: null,
                    parcela_atual: null,
                    total_parcelas: null
                });
            
            if (erroInsert) {
                console.error('Erro ao importar:', erroInsert);
                erros++;
            } else {
                importados++;
            }
        }
        
        let mensagem = 'Importação concluída! ' + importados + ' transações importadas.';
        if (duplicados > 0) mensagem += ' ' + duplicados + ' duplicatas ignoradas.';
        if (erros > 0) mensagem += ' ' + erros + ' erros.';
        
        showAlert(mensagem, importados > 0 ? 'success' : 'warning');
        
        // Limpar seleções
        transacoesFiltradas.forEach(t => t.selecionado = false);
        aplicarFiltrosOFX();
        
    } catch (err) {
        console.error('Erro ao importar transações:', err);
        showAlert('Erro ao importar transações: ' + err.message, 'danger');
    }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

function formatDate(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

async function verDetalhesQuitacao(lancamentoId) {
    try {
        const { data, error } = await supabase
            .from('lancamentos')
            .select('*')
            .eq('id', lancamentoId)
            .single();
        
        if (error) throw error;
        
        if (!data.observacoes) {
            showAlert('Este lançamento não possui detalhes de quitação.', 'info');
            return;
        }
        
        const obs = JSON.parse(data.observacoes);
        
        let detalhesHTML = `
            <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" id="modalQuitacao">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-info-circle"></i> Detalhes da Quitação
                            </h5>
                            <button type="button" class="btn-close btn-close-white" onclick="fecharModalQuitacao()"></button>
                        </div>
                        <div class="modal-body">
                            <h6><strong>Lançamento:</strong> ${data.descricao}</h6>
                            <hr>
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Tipo:</strong> <span class="badge ${obs.tipo_quitacao === 'integral' ? 'bg-success' : 'bg-warning'}">${obs.tipo_quitacao.toUpperCase()}</span></p>
                                    <p><strong>Data da Quitação:</strong> ${formatDate(obs.data_quitacao)}</p>
                                    <p><strong>Parcelas Quitadas:</strong> ${obs.parcelas_quitadas}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Valor Original:</strong> <span class="text-muted">R$ ${obs.valor_original.toFixed(2)}</span></p>
                                    <p><strong>Desconto Aplicado:</strong> <span class="text-danger">R$ ${obs.desconto_aplicado.toFixed(2)}</span></p>
                                    <p><strong>Valor Pago:</strong> <span class="text-success"><strong>R$ ${obs.valor_pago.toFixed(2)}</strong></span></p>
                                </div>
                            </div>
                            <hr>
                            <h6>Parcelas Quitadas:</h6>
                            <ul>
                                ${obs.parcelas_detalhes.map(p => `
                                    <li>Parcela ${p.parcela}${p.valor ? ` - R$ ${p.valor.toFixed(2)}` : ''}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="fecharModalQuitacao()">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Adicionar modal ao body
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = detalhesHTML;
        document.body.appendChild(modalDiv.firstElementChild);
        
    } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
        showAlert('Erro ao carregar detalhes da quitação', 'danger');
    }
}

function fecharModalQuitacao() {
    const modal = document.getElementById('modalQuitacao');
    if (modal) {
        modal.remove();
    }
}

function getNomeMes(mesAno = mesAtual) {
    const [year, month] = mesAno.split('-');
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(month) - 1]} ${year}`;
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Expor funções globalmente
window.showPage = showPage;
window.logout = logout;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleAddLancamento = handleAddLancamento;
window.toggleStatus = toggleStatus;
window.editarLancamento = editarLancamento;
window.deleteLancamento = deleteLancamento;
window.loadLancamentos = loadLancamentos;
window.handleAddCategoria = handleAddCategoria;
window.editarCategoria = editarCategoria;
window.deleteCategoria = deleteCategoria;
window.toggleContaFixaStatus = toggleContaFixaStatus;
window.deleteContaFixa = deleteContaFixa;
window.gerarContasFixasMes = gerarContasFixasMes;
window.quitarIntegral = quitarIntegral;
window.quitarParcial = quitarParcial;
window.verDetalhesQuitacao = verDetalhesQuitacao;
window.fecharModalQuitacao = fecharModalQuitacao;
window.fecharModalSelecaoParcelas = fecharModalSelecaoParcelas;
window.confirmarSelecaoParcelas = confirmarSelecaoParcelas;
window.fecharModalDesconto = fecharModalDesconto;
window.processarQuitacaoParcial = processarQuitacaoParcial;
window.gerarRelatorio = gerarRelatorio;
