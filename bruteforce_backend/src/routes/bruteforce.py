
from flask import Blueprint, request, jsonify
from src.bruteforce_engine import BruteForceEngine
from src.target_functions import TargetFunctions
import threading
import string

bruteforce_bp = Blueprint("bruteforce", __name__)

# Stockage temporaire pour les moteurs d'attaque et leurs threads
# Dans une application réelle, cela devrait être géré de manière plus robuste (par ex. base de données, file d'attente)
active_attacks = {}

@bruteforce_bp.route("/start_attack", methods=["POST"])
def start_attack():
    data = request.json
    attack_id = data.get("attack_id")
    attack_type = data.get("attack_type")
    charset_name = data.get("charset")
    min_length = data.get("min_length")
    max_length = data.get("max_length")
    target_params = data.get("target_params")

    if not all([attack_id, attack_type, charset_name, min_length, max_length, target_params]):
        return jsonify({"error": "Paramètres manquants"}), 400

    if attack_id in active_attacks:
        return jsonify({"error": f"Attaque avec l'ID {attack_id} déjà en cours"}), 409

    # Définir le jeu de caractères
    charset = ""
    if charset_name == "ascii_lowercase":
        charset = string.ascii_lowercase
    elif charset_name == "ascii_uppercase":
        charset = string.ascii_uppercase
    elif charset_name == "digits":
        charset = string.digits
    elif charset_name == "punctuation":
        charset = string.punctuation
    elif charset_name == "printable":
        charset = string.printable.strip()
    elif charset_name == "custom":
        charset = data.get("custom_charset", "")
    else:
        return jsonify({"error": "Jeu de caractères non valide"}), 400

    engine = BruteForceEngine(charset, min_length, max_length)

    target_function = None
    if attack_type == "hash_crack":
        target_hash = target_params.get("hash")
        hash_type = target_params.get("hash_type", "md5")
        if not target_hash:
            return jsonify({"error": "Hash cible manquant pour l'attaque de hash"}), 400
        target_function = TargetFunctions.hash_target(target_hash, hash_type)
    elif attack_type == "http_basic_auth":
        url = target_params.get("url")
        username = target_params.get("username")
        if not all([url, username]):
            return jsonify({"error": "URL ou nom d'utilisateur manquant pour l'authentification HTTP"}), 400
        target_function = TargetFunctions.http_basic_auth_target(url, username)
    elif attack_type == "simple_string":
        target_string = target_params.get("target_string")
        if not target_string:
            return jsonify({"error": "Chaîne cible manquante pour l'attaque simple"}), 400
        target_function = TargetFunctions.simple_string_target(target_string)
    else:
        return jsonify({"error": "Type d'attaque non supporté"}), 400

    if target_function is None:
        return jsonify({"error": "Impossible de créer la fonction cible"}), 500

    # Lancer l'attaque dans un thread séparé
    thread = threading.Thread(target=engine.start_attack, args=(target_function,))
    thread.daemon = True # Permet au thread de se terminer avec le programme principal
    thread.start()

    active_attacks[attack_id] = {"engine": engine, "thread": thread}

    return jsonify({"message": "Attaque démarrée", "attack_id": attack_id}), 200

@bruteforce_bp.route("/stop_attack", methods=["POST"])
def stop_attack():
    data = request.json
    attack_id = data.get("attack_id")

    if not attack_id:
        return jsonify({"error": "ID d'attaque manquant"}), 400

    if attack_id not in active_attacks:
        return jsonify({"error": f"Attaque avec l'ID {attack_id} non trouvée"}), 404

    engine = active_attacks[attack_id]["engine"]
    engine.stop_attack()
    # On ne supprime pas l'attaque tout de suite pour pouvoir récupérer son statut final
    return jsonify({"message": "Attaque arrêtée", "attack_id": attack_id}), 200

@bruteforce_bp.route("/attack_status/<attack_id>", methods=["GET"])
def get_attack_status(attack_id):
    if attack_id not in active_attacks:
        return jsonify({"error": f"Attaque avec l'ID {attack_id} non trouvée"}), 404

    engine = active_attacks[attack_id]["engine"]
    status = engine.get_status()

    # Si l'attaque est terminée et que le thread n'est plus actif, on peut la nettoyer
    if not status["running"] and not active_attacks[attack_id]["thread"].is_alive():
        del active_attacks[attack_id]

    return jsonify(status), 200


