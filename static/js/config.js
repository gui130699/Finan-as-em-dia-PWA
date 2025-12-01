// ============================================
// CONFIGURAÇÃO - SUPABASE
// ============================================

// IMPORTANTE: Em produção, use variáveis de ambiente
// Configure no seu servidor ou plataforma de hospedagem

// Para desenvolvimento local, você pode criar um arquivo config.local.js
// e importá-lo no index.html ANTES deste arquivo

// Inicializar se ainda não existe (config.local.js pode ter definido)
if (!window.SUPABASE_CONFIG) {
    window.SUPABASE_CONFIG = {
        url: 'SUA_URL_AQUI',
        key: 'SUA_CHAVE_AQUI'
    };
}

// Validar configuração
if (window.SUPABASE_CONFIG.url === 'SUA_URL_AQUI' || window.SUPABASE_CONFIG.key === 'SUA_CHAVE_AQUI') {
    console.error('⚠️ CONFIGURAÇÃO NECESSÁRIA: Configure SUPABASE_URL e SUPABASE_KEY');
    console.info('💡 Crie um arquivo config.local.js com suas credenciais');
    console.info('📖 Veja o arquivo config.local.example.js para exemplo');
}
