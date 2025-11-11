"""
Configurações do Supabase
Usa variáveis de ambiente em produção ou valores padrão em desenvolvimento
"""
import os

# Credenciais do Supabase (usar variáveis de ambiente em produção)
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://otyekylihpzscqwxeoiy.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90eWVreWxpaHB6c2Nxd3hlb2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4ODgzNjEsImV4cCI6MjA3ODQ2NDM2MX0.EzjwRxXMJbo_z-ENIwvHyN-AzqxBrsZfuga3F1tdsKg')

# Senha do banco (para referência administrativa)
# 9331077093.Gui
