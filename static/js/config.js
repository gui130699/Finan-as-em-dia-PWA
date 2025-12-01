// ============================================
// CONFIGURAÇÃO - SUPABASE
// ============================================

// IMPORTANTE: Em produção, use variáveis de ambiente
// Configure no seu servidor ou plataforma de hospedagem

// Para desenvolvimento local, você pode criar um arquivo config.local.js
// e importá-lo no index.html ANTES deste arquivo

const CONFIG = {
    SUPABASE_URL: window.SUPABASE_CONFIG?.url || 'SUA_URL_AQUI',
    SUPABASE_KEY: window.SUPABASE_CONFIG?.key || 'SUA_CHAVE_AQUI'
};

// Validar configuração
if (CONFIG.SUPABASE_URL === 'SUA_URL_AQUI' || CONFIG.SUPABASE_KEY === 'SUA_CHAVE_AQUI') {
    console.error('⚠️ CONFIGURAÇÃO NECESSÁRIA: Configure SUPABASE_URL e SUPABASE_KEY');
    console.info('💡 Crie um arquivo config.local.js com suas credenciais');
}

// Exportar para uso no app.js
window.SUPABASE_CONFIG = {
    url: CONFIG.SUPABASE_URL,
    key: CONFIG.SUPABASE_KEY
};
