#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para inicializar o banco de dados
"""

import os
import sys
from flask import Flask
from src.models.user import db, User, PartnerCoupon, Configuracao
from werkzeug.security import generate_password_hash

def create_app():
    app = Flask(__name__)
    
    # Configuração do banco de dados
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERRO: DATABASE_URL não encontrada nas variáveis de ambiente")
        sys.exit(1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key')
    
    db.init_app(app)
    return app

def init_database():
    """Inicializa o banco de dados com tabelas e dados iniciais"""
    app = create_app()
    
    with app.app_context():
        try:
            # Criar todas as tabelas
            print("Criando tabelas...")
            db.create_all()
            print("✓ Tabelas criadas com sucesso!")
            
            # Verificar se já existe um usuário admin
            admin_email = os.getenv('ADMIN_EMAIL', 'admin@raspadinha.com')
            admin_user = User.query.filter_by(email=admin_email).first()
            
            if not admin_user:
                print(f"Criando usuário administrador: {admin_email}")
                admin_user = User(
                    nome='Administrador',
                    email=admin_email,
                    telefone='(11) 99999-9999'
                )
                admin_user.set_password('admin123')  # Altere esta senha em produção!
                db.session.add(admin_user)
                print("✓ Usuário administrador criado!")
            else:
                print("✓ Usuário administrador já existe!")
            
            # Criar configurações padrão
            configuracoes_padrao = [
                {'chave': 'valor_raspadinha', 'valor': '5.00', 'descricao': 'Valor unitário da raspadinha em reais'},
                {'chave': 'min_saque', 'valor': '10.00', 'descricao': 'Valor mínimo para saque em reais'},
                {'chave': 'pix_enabled', 'valor': 'true', 'descricao': 'Habilitar pagamento via PIX'},
                {'chave': 'card_enabled', 'valor': 'false', 'descricao': 'Habilitar pagamento via cartão'},
                {'chave': 'pix_key', 'valor': '', 'descricao': 'Chave PIX principal para recebimentos'},
                {'chave': 'card_api_key', 'valor': '', 'descricao': 'Chave da API do processador de cartão'}
            ]
            
            for config_data in configuracoes_padrao:
                config = Configuracao.query.filter_by(chave=config_data['chave']).first()
                if not config:
                    config = Configuracao(**config_data)
                    db.session.add(config)
                    print(f"✓ Configuração '{config_data['chave']}' criada!")
            
            # Criar cupons de exemplo
            cupons_exemplo = [
                {'code': 'PARCEIRO1', 'partner_name': 'Parceiro Exemplo 1', 'description': 'Cupom de exemplo para testes'},
                {'code': 'INFLUENCER', 'partner_name': 'Influencer Digital', 'description': 'Cupom para influenciadores digitais'},
                {'code': 'PROMOCAO2024', 'partner_name': 'Promoção Especial', 'description': 'Cupom promocional 2024'}
            ]
            
            for cupom_data in cupons_exemplo:
                cupom = PartnerCoupon.query.filter_by(code=cupom_data['code']).first()
                if not cupom:
                    cupom = PartnerCoupon(**cupom_data)
                    db.session.add(cupom)
                    print(f"✓ Cupom '{cupom_data['code']}' criado!")
            
            # Salvar todas as alterações
            db.session.commit()
            print("\n✅ Banco de dados inicializado com sucesso!")
            print(f"📧 Email do admin: {admin_email}")
            print("🔑 Senha do admin: admin123 (ALTERE EM PRODUÇÃO!)")
            
        except Exception as e:
            print(f"❌ Erro ao inicializar banco de dados: {e}")
            db.session.rollback()
            sys.exit(1)

if __name__ == '__main__':
    init_database()

