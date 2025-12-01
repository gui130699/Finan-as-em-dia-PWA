// ============================================
// CONFIGURAÇÃO - SUPABASE
// ============================================

// IMPORTANTE: Em produção, use variáveis de ambiente
// Configure no seu servidor ou plataforma de hospedagem

// Para desenvolvimento local, você pode criar um arquivo config.local.js
// e importá-lo no index.html ANTES deste arquivo

// Validar configuração (apenas para debug)
if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.key) {
    console.error('⚠️ CONFIGURAÇÃO NECESSÁRIA: Configure SUPABASE_URL e SUPABASE_KEY');
    console.info('💡 Para desenvolvimento local: crie config.local.js');
    console.info('💡 Para GitHub Pages: edite as credenciais no index.html');
    console.info('📖 Veja o arquivo config.local.example.js para exemplo');
} else {
    console.log('✅ Supabase configurado corretamente');
}
