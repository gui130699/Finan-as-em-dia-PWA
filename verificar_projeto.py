"""
SCRIPT DE VERIFICAÇÃO DO PROJETO
Verifica se todos os arquivos necessários estão presentes
"""

import os
from pathlib import Path

def verificar_projeto():
    print("=" * 60)
    print("🔍 VERIFICAÇÃO DO PROJETO - FINANÇAS EM DIA")
    print("=" * 60)
    print()
    
    # Diretório raiz
    raiz = Path(__file__).parent
    
    # Arquivos que devem existir
    arquivos_necessarios = {
        'Backend': [
            'app.py',
            'database.py',
            'models.py',
        ],
        'Configuração': [
            'requirements.txt',
            '.gitignore',
        ],
        'Documentação': [
            'README.md',
            'INSTALACAO.md',
            'COMO_USAR.md',
            'FAQ.md',
            'ESTRUTURA.md',
            'INDICE.md',
        ],
        'Scripts': [
            'iniciar.bat',
            'criar_dados_exemplo.py',
        ],
    }
    
    # Diretórios que devem existir
    diretorios_necessarios = [
        'templates',
        'static',
        'static/css',
        'static/js',
    ]
    
    # Templates HTML que devem existir
    templates_necessarios = [
        'base.html',
        'login.html',
        'registrar.html',
        'home.html',
        'lancamentos.html',
        'editar_lancamento.html',
        'categorias.html',
        'contas_fixas.html',
        'editar_conta_fixa.html',
        'contas_parceladas.html',
        'quitar_parcelado.html',
        'relatorios.html',
    ]
    
    # Arquivos estáticos que devem existir
    estaticos_necessarios = [
        'static/css/estilo.css',
        'static/js/scripts.js',
    ]
    
    erros = []
    avisos = []
    
    # Verificar arquivos principais
    print("📄 Verificando arquivos principais...")
    for categoria, arquivos in arquivos_necessarios.items():
        print(f"\n   {categoria}:")
        for arquivo in arquivos:
            caminho = raiz / arquivo
            if caminho.exists():
                print(f"      ✅ {arquivo}")
            else:
                print(f"      ❌ {arquivo} - NÃO ENCONTRADO")
                erros.append(f"Arquivo ausente: {arquivo}")
    
    # Verificar diretórios
    print("\n\n📁 Verificando diretórios...")
    for diretorio in diretorios_necessarios:
        caminho = raiz / diretorio
        if caminho.exists() and caminho.is_dir():
            print(f"   ✅ {diretorio}/")
        else:
            print(f"   ❌ {diretorio}/ - NÃO ENCONTRADO")
            erros.append(f"Diretório ausente: {diretorio}")
    
    # Verificar templates
    print("\n\n🎨 Verificando templates HTML...")
    for template in templates_necessarios:
        caminho = raiz / 'templates' / template
        if caminho.exists():
            print(f"   ✅ {template}")
        else:
            print(f"   ❌ {template} - NÃO ENCONTRADO")
            erros.append(f"Template ausente: {template}")
    
    # Verificar arquivos estáticos
    print("\n\n💅 Verificando arquivos estáticos...")
    for arquivo in estaticos_necessarios:
        caminho = raiz / arquivo
        if caminho.exists():
            print(f"   ✅ {arquivo}")
        else:
            print(f"   ❌ {arquivo} - NÃO ENCONTRADO")
            erros.append(f"Arquivo estático ausente: {arquivo}")
    
    # Verificar dependências Python
    print("\n\n📦 Verificando módulos Python...")
    modulos = [
        ('flask', 'Flask'),
        ('bcrypt', 'BCrypt'),
        ('reportlab', 'ReportLab'),
    ]
    
    for modulo, nome in modulos:
        try:
            __import__(modulo)
            print(f"   ✅ {nome}")
        except ImportError:
            print(f"   ⚠️  {nome} - NÃO INSTALADO (execute: pip install -r requirements.txt)")
            avisos.append(f"Módulo Python não instalado: {nome}")
    
    # Resumo final
    print("\n")
    print("=" * 60)
    print("📊 RESUMO DA VERIFICAÇÃO")
    print("=" * 60)
    
    total_arquivos = sum(len(v) for v in arquivos_necessarios.values())
    total_arquivos += len(templates_necessarios) + len(estaticos_necessarios)
    arquivos_ok = total_arquivos - len([e for e in erros if 'ausente' in e])
    
    print(f"\n✅ Arquivos verificados: {arquivos_ok}/{total_arquivos}")
    print(f"📁 Diretórios verificados: {len(diretorios_necessarios)}")
    
    if erros:
        print(f"\n❌ Erros encontrados: {len(erros)}")
        for erro in erros:
            print(f"   • {erro}")
    
    if avisos:
        print(f"\n⚠️  Avisos: {len(avisos)}")
        for aviso in avisos:
            print(f"   • {aviso}")
    
    if not erros and not avisos:
        print("\n" + "=" * 60)
        print("🎉 PROJETO COMPLETO E PRONTO PARA USO!")
        print("=" * 60)
        print("\n📝 Próximos passos:")
        print("   1. Execute: iniciar.bat")
        print("   2. Ou execute: python app.py")
        print("   3. Acesse: http://127.0.0.1:5000")
        print("   4. Crie sua conta e comece a usar!")
        print("\n📚 Documentação:")
        print("   • README.md - Documentação completa")
        print("   • INDICE.md - Índice de todos documentos")
        print("   • COMO_USAR.md - Tutorial de uso")
        print()
    elif not erros:
        print("\n" + "=" * 60)
        print("✅ ESTRUTURA OK - Apenas avisos")
        print("=" * 60)
        print("\n⚠️  Instale as dependências:")
        print("   pip install -r requirements.txt")
        print()
    else:
        print("\n" + "=" * 60)
        print("❌ PROJETO INCOMPLETO")
        print("=" * 60)
        print("\nCorreja os erros acima antes de executar.")
        print()
    
    print("=" * 60)
    return len(erros) == 0

if __name__ == '__main__':
    try:
        verificar_projeto()
    except Exception as e:
        print(f"\n❌ Erro ao verificar projeto: {e}")
    
    input("\nPressione ENTER para sair...")
