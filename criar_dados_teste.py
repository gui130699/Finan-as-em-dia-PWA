"""
Script para criar usuário e categorias de teste no Supabase
"""

import database
import models
import bcrypt

print("=" * 60)
print("CRIANDO DADOS DE TESTE NO SUPABASE")
print("=" * 60)

# Conectar
supabase = database.conectar()

# 1. Criar usuário de teste
print("\n1. Criando usuário de teste...")
try:
    # Verificar se já existe
    response = supabase.table('usuarios').select('*').eq('email', 'teste@financas.com').execute()
    
    if response.data:
        print(f"✓ Usuário já existe: ID = {response.data[0]['id']}")
        user_id = response.data[0]['id']
    else:
        # Criar novo usuário
        senha_hash = bcrypt.hashpw('123456'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        response = supabase.table('usuarios').insert({
            'nome': 'Usuário Teste',
            'email': 'teste@financas.com',
            'senha': senha_hash
        }).execute()
        
        if response.data:
            user_id = response.data[0]['id']
            print(f"✓ Usuário criado com sucesso! ID = {user_id}")
            print("  Email: teste@financas.com")
            print("  Senha: 123456")
        else:
            print("✗ Erro ao criar usuário")
            exit(1)
            
except Exception as e:
    print(f"✗ Erro: {e}")
    exit(1)

# 2. Criar categorias padrão
print(f"\n2. Criando categorias para o usuário {user_id}...")

categorias_padrao = [
    {'nome': 'Salário', 'tipo': 'receita'},
    {'nome': 'Freelance', 'tipo': 'receita'},
    {'nome': 'Investimentos', 'tipo': 'receita'},
    {'nome': 'Outros Ganhos', 'tipo': 'receita'},
    {'nome': 'Alimentação', 'tipo': 'despesa'},
    {'nome': 'Transporte', 'tipo': 'despesa'},
    {'nome': 'Moradia', 'tipo': 'despesa'},
    {'nome': 'Saúde', 'tipo': 'despesa'},
    {'nome': 'Educação', 'tipo': 'despesa'},
    {'nome': 'Lazer', 'tipo': 'despesa'},
    {'nome': 'Vestuário', 'tipo': 'despesa'},
    {'nome': 'Outros Gastos', 'tipo': 'despesa'}
]

try:
    # Verificar se já tem categorias
    response = supabase.table('categorias').select('*').eq('usuario_id', user_id).execute()
    
    if response.data and len(response.data) > 0:
        print(f"✓ Usuário já possui {len(response.data)} categoria(s)")
    else:
        # Inserir categorias
        categorias = [{'usuario_id': user_id, **cat} for cat in categorias_padrao]
        response = supabase.table('categorias').insert(categorias).execute()
        
        if response.data:
            print(f"✓ {len(response.data)} categorias criadas com sucesso!")
            for cat in response.data:
                print(f"  - {cat['nome']} ({cat['tipo']})")
        else:
            print("✗ Erro ao criar categorias")
            
except Exception as e:
    print(f"✗ Erro ao criar categorias: {e}")

# 3. Listar resultado final
print("\n3. Verificando resultado...")
try:
    response = supabase.table('categorias').select('*').eq('usuario_id', user_id).execute()
    print(f"✓ Total de categorias no banco: {len(response.data)}")
    
except Exception as e:
    print(f"✗ Erro: {e}")

print("\n" + "=" * 60)
print("CONCLUÍDO!")
print("=" * 60)
print("\nAgora você pode fazer login com:")
print("Email: teste@financas.com")
print("Senha: 123456")
print("=" * 60)
