import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from src.models.user import db
from src.routes.auth import auth_bp
from src.routes.jogos import jogos_bp
from src.routes.admin import admin_bp
import os

app = Flask(__name__, static_folder='static')

# Configuração CORS
CORS(app, origins="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configuração da chave secreta
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'raspadinha-premiada-secret-key-2024')

# Configuração do banco de dados - Supabase PostgreSQL
database_url = os.getenv('DATABASE_URL')
if database_url:
    # Para Supabase/PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Fallback para MySQL local
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{os.getenv('DB_USERNAME', 'root')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'mydb')}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar o banco de dados
db.init_app(app)

# Registrar blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(jogos_bp, url_prefix='/api/jogos')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Rota para servir arquivos estáticos
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Rota de verificação de saúde
@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "API Raspadinha Premiada funcionando!"})

# Manipulador de erros para rotas não encontradas
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Rota não encontrada"}), 404

# Manipulador de erros para erros internos
@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Erro interno do servidor"}), 500

# Criar tabelas do banco de dados
with app.app_context():
    try:
        db.create_all()
        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

