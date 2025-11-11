"""
Script de teste para o Finanças em Dia
Cria dados de exemplo para facilitar os testes
"""

import database
import models
from datetime import datetime, timedelta

def criar_dados_exemplo():
    """Cria dados de exemplo no banco de dados"""
    
    print("Inicializando banco de dados...")
    database.inicializar_banco()
    
    print("\n1. Criando usuário de teste...")
    # Criar usuário: admin / admin123
    if models.criar_usuario('admin', 'admin123'):
        print("   ✓ Usuário 'admin' criado (senha: admin123)")
    else:
        print("   ✗ Usuário 'admin' já existe")
    
    # Autenticar para pegar o ID
    user = models.autenticar('admin', 'admin123')
    if not user:
        print("   ✗ Erro ao autenticar")
        return
    
    user_id = user['id']
    print(f"   ✓ User ID: {user_id}")
    
    print("\n2. Verificando categorias...")
    categorias = models.listar_categorias(user_id)
    if categorias:
        print(f"   ✓ {len(categorias)} categorias já existem")
    else:
        print("   ! Nenhuma categoria encontrada")
    
    print("\n3. Criando lançamentos de exemplo...")
    
    # Data base: mês atual
    hoje = datetime.now()
    primeiro_dia = hoje.replace(day=1)
    
    # Buscar IDs de categorias
    cat_salario = next((c for c in categorias if c['nome'] == 'Salário'), None)
    cat_alimentacao = next((c for c in categorias if c['nome'] == 'Alimentação'), None)
    cat_transporte = next((c for c in categorias if c['nome'] == 'Transporte'), None)
    cat_moradia = next((c for c in categorias if c['nome'] == 'Moradia'), None)
    
    if not all([cat_salario, cat_alimentacao, cat_transporte, cat_moradia]):
        print("   ✗ Categorias padrão não encontradas")
        return
    
    # Receita: Salário
    data_salario = (primeiro_dia + timedelta(days=4)).strftime('%Y-%m-%d')
    models.inserir_lancamento(
        user_id, data_salario, 'Receita', 5000.00,
        'Salário Mensal', cat_salario['id'], 1, 'Pagamento mensal'
    )
    print("   ✓ Lançamento: Salário (R$ 5.000,00)")
    
    # Marcar como recebido
    lancamentos = models.listar_lancamentos_mes(user_id, hoje.month, hoje.year)
    if lancamentos:
        models.alternar_status(lancamentos[0]['id'])
    
    # Despesas variadas
    despesas = [
        ((primeiro_dia + timedelta(days=2)).strftime('%Y-%m-%d'), 'Despesa', 150.00, 
         'Supermercado', cat_alimentacao['id'], 'Compras mensais'),
        
        ((primeiro_dia + timedelta(days=5)).strftime('%Y-%m-%d'), 'Despesa', 80.00, 
         'Combustível', cat_transporte['id'], 'Posto XYZ'),
        
        ((primeiro_dia + timedelta(days=8)).strftime('%Y-%m-%d'), 'Despesa', 200.00, 
         'Restaurante', cat_alimentacao['id'], 'Jantar família'),
        
        ((primeiro_dia + timedelta(days=10)).strftime('%Y-%m-%d'), 'Despesa', 1200.00, 
         'Aluguel', cat_moradia['id'], 'Aluguel mensal'),
    ]
    
    for data, tipo, valor, desc, cat_id, obs in despesas:
        models.inserir_lancamento(user_id, data, tipo, valor, desc, cat_id, 1, obs)
        print(f"   ✓ Lançamento: {desc} (R$ {valor:.2f})")
    
    print("\n4. Criando lançamento parcelado...")
    # Compra parcelada em 3x
    data_parcelado = primeiro_dia.strftime('%Y-%m-%d')
    models.inserir_lancamento(
        user_id, data_parcelado, 'Despesa', 300.00,
        'Notebook', cat_alimentacao['id'], 3, 'Parcelado 3x sem juros'
    )
    print("   ✓ Lançamento Parcelado: Notebook (3x de R$ 300,00)")
    
    print("\n5. Criando conta fixa...")
    # Internet como conta fixa
    models.criar_conta_fixa(
        user_id, 'Internet Fibra', cat_moradia['id'], 
        'Despesa', 99.90, 15, 'Conta fixa mensal', True
    )
    print("   ✓ Conta Fixa: Internet Fibra (R$ 99,90 - dia 15)")
    
    print("\n" + "="*50)
    print("✓ DADOS DE EXEMPLO CRIADOS COM SUCESSO!")
    print("="*50)
    print("\n📝 Credenciais de acesso:")
    print("   Usuário: admin")
    print("   Senha:   admin123")
    print("\n🚀 Execute: python app.py")
    print("🌐 Acesse:  http://127.0.0.1:5000")
    print("="*50 + "\n")

if __name__ == '__main__':
    criar_dados_exemplo()
