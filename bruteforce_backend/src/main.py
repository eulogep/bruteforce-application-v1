"""
BruteForce Tool - Application de Test de Sécurité Avancée
==========================================================

Développé par : MABIALA EULOGE JUNIOR
Date de création : 2025
Description : Application complète de brute force avec support GPU,
              attaques basées sur des règles, et gestion avancée des dictionnaires.

Fonctionnalités principales :
- Attaques basées sur des règles personnalisables
- Craquage de hash avec support GPU (Hashcat)
- Gestion complète des dictionnaires
- Interface utilisateur moderne React
- API REST Flask pour le backend

Copyright (c) 2025 MABIALA EULOGE JUNIOR
Tous droits réservés.
"""

import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from src.models.user import db
from src.routes.user import user_bp
from src.routes.bruteforce import bruteforce_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Configuration des métadonnées de l'application
app.config['APP_AUTHOR'] = 'MABIALA EULOGE JUNIOR'
app.config['APP_VERSION'] = '1.0.0'
app.config['APP_DESCRIPTION'] = 'Application de Brute Force Avancée'

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(bruteforce_bp, url_prefix='/api')

# uncomment if you need to use database
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/credits')
def get_credits():
    """Endpoint pour récupérer les informations sur le développeur"""
    return {
        'author': 'MABIALA EULOGE JUNIOR',
        'version': '1.0.0',
        'description': 'Application de Brute Force Avancée',
        'features': [
            'Attaques basées sur des règles',
            'Craquage de hash GPU',
            'Gestion des dictionnaires',
            'Interface utilisateur moderne'
        ]
    }

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 BruteForce Tool - Développé par MABIALA EULOGE JUNIOR")
    print("=" * 60)
    print("📋 Fonctionnalités disponibles:")
    print("   • Attaques basées sur des règles")
    print("   • Craquage de hash avec support GPU")
    print("   • Gestion avancée des dictionnaires")
    print("   • Interface utilisateur moderne")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
