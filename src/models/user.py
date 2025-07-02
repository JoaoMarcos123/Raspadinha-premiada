# -*- coding: utf-8 -*-
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()

# Tabela de Associação para Rastrear Indicações bem-sucedidas (opcional, mas bom para auditoria)
# Poderíamos apenas usar o contador, mas isso permite saber *quem* indicou quem.
# Por simplicidade inicial, vamos usar apenas o contador e o referred_by_user_id.

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    telefone = db.Column(db.String(20), nullable=False) # Já era obrigatório
    password_hash = db.Column(db.String(200), nullable=False)
    saldo = db.Column(db.Float, default=0.0)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_login = db.Column(db.DateTime, nullable=True)
    
    # --- Campos para Sistema de Indicação de Usuários ---
    referral_code = db.Column(db.String(36), unique=True, nullable=False, index=True) # Código que este usuário compartilha
    referred_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Quem indicou este usuário
    referral_count = db.Column(db.Integer, default=0) # Quantos se cadastraram com o código DESTE usuário
    referral_bonus_awarded_count = db.Column(db.Integer, default=0) # Quantas vezes o bônus de 3 indicações foi concedido
    bonus_raspadinhas_available = db.Column(db.Integer, default=0) # Quantas raspadinhas bônus o usuário tem
    
    # --- Campo para Sistema de Cupons de Parceiros ---
    partner_coupon_id = db.Column(db.Integer, db.ForeignKey('partner_coupons.id'), nullable=True) # Cupom de parceiro usado no cadastro
    
    # Relacionamentos
    jogos = db.relationship('Jogo', backref='user', lazy=True)
    saques = db.relationship('Saque', backref='user', lazy=True)
    # Relacionamento para buscar quem este usuário indicou (opcional)
    # referrals_made = db.relationship('User', backref=db.backref('referrer', remote_side=[id]), lazy='dynamic')
    # Relacionamento para buscar o cupom de parceiro usado
    partner_coupon_used = db.relationship('PartnerCoupon', backref='users_registered', lazy=True)
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4()) # Gera código único no cadastro
            
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def add_saldo(self, valor):
        self.saldo = (self.saldo or 0) + valor
        
    def remove_saldo(self, valor):
        if (self.saldo or 0) >= valor:
            self.saldo -= valor
            return True
        return False
        
    def add_bonus_raspadinha(self, quantidade=1):
        self.bonus_raspadinhas_available = (self.bonus_raspadinhas_available or 0) + quantidade
        
    def use_bonus_raspadinha(self):
        if (self.bonus_raspadinhas_available or 0) > 0:
            self.bonus_raspadinhas_available -= 1
            return True
        return False

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'telefone': self.telefone,
            'saldo': self.saldo,
            'data_cadastro': self.data_cadastro.strftime('%Y-%m-%d %H:%M:%S'),
            'ultimo_login': self.ultimo_login.strftime('%Y-%m-%d %H:%M:%S') if self.ultimo_login else None,
            'referral_code': self.referral_code,
            'referral_count': self.referral_count,
            'bonus_raspadinhas_available': self.bonus_raspadinhas_available,
            # Não expor referred_by_user_id ou partner_coupon_id diretamente na API geral
        }

class PartnerCoupon(db.Model):
    __tablename__ = 'partner_coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    partner_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    usage_count = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'partner_name': self.partner_name,
            'description': self.description,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': self.is_active,
            'usage_count': self.usage_count
        }

class Jogo(db.Model):
    __tablename__ = 'jogos'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quantidade_raspadinhas = db.Column(db.Integer, nullable=False)
    valor_total = db.Column(db.Float, nullable=False)
    premio_total = db.Column(db.Float, nullable=False)
    data_jogo = db.Column(db.DateTime, default=datetime.utcnow)
    origem_saldo = db.Column(db.Boolean, default=False)  # True se comprado com saldo interno
    usou_bonus = db.Column(db.Boolean, default=False) # Indica se uma raspadinha bônus foi usada neste jogo
    
    # Relacionamentos
    raspadinhas = db.relationship('Raspadinha', backref='jogo', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quantidade_raspadinhas': self.quantidade_raspadinhas,
            'valor_total': self.valor_total,
            'premio_total': self.premio_total,
            'data_jogo': self.data_jogo.strftime('%Y-%m-%d %H:%M:%S'),
            'origem_saldo': self.origem_saldo,
            'usou_bonus': self.usou_bonus,
            'raspadinhas': [r.to_dict() for r in self.raspadinhas]
        }

class Raspadinha(db.Model):
    __tablename__ = 'raspadinhas'
    
    id = db.Column(db.Integer, primary_key=True)
    jogo_id = db.Column(db.Integer, db.ForeignKey('jogos.id'), nullable=False)
    premio = db.Column(db.Float, nullable=False)
    extra = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'jogo_id': self.jogo_id,
            'premio': self.premio,
            'extra': self.extra
        }

class Saque(db.Model):
    __tablename__ = 'saques'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    chave_pix = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pendente')  # pendente, processando, concluido, cancelado
    data_solicitacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_processamento = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'valor': self.valor,
            'chave_pix': self.chave_pix,
            'status': self.status,
            'data_solicitacao': self.data_solicitacao.strftime('%Y-%m-%d %H:%M:%S'),
            'data_processamento': self.data_processamento.strftime('%Y-%m-%d %H:%M:%S') if self.data_processamento else None
        }

class Configuracao(db.Model):
    __tablename__ = 'configuracoes'
    
    id = db.Column(db.Integer, primary_key=True)
    chave = db.Column(db.String(50), unique=True, nullable=False)
    valor = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.String(255), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'chave': self.chave,
            'valor': self.valor,
            'descricao': self.descricao
        }

