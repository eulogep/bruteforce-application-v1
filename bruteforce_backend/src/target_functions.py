import hashlib
import requests
from requests.auth import HTTPBasicAuth

class TargetFunctions:
    @staticmethod
    def hash_target(target_hash, hash_type='md5'):
        """
        Fonction cible pour cracker un hash.
        """
        def check_password(password):
            if hash_type == 'md5':
                return hashlib.md5(password.encode()).hexdigest() == target_hash
            elif hash_type == 'sha1':
                return hashlib.sha1(password.encode()).hexdigest() == target_hash
            elif hash_type == 'sha256':
                return hashlib.sha256(password.encode()).hexdigest() == target_hash
            else:
                raise ValueError(f"Type de hash non supporté : {hash_type}")
        return check_password

    @staticmethod
    def http_basic_auth_target(url, username):
        """
        Fonction cible pour cracker une authentification HTTP Basic.
        """
        def check_password(password):
            try:
                response = requests.get(url, auth=HTTPBasicAuth(username, password), timeout=5)
                return response.status_code == 200
            except requests.exceptions.RequestException:
                return False
        return check_password

    @staticmethod
    def simple_string_target(target_string):
        """
        Fonction cible simple pour comparer avec une chaîne de caractères.
        """
        def check_password(password):
            return password == target_string
        return check_password

# Exemple d'utilisation
if __name__ == '__main__':
    # Test avec un hash MD5
    target_hash = hashlib.md5('test'.encode()).hexdigest()
    print(f"Hash cible : {target_hash}")
    
    hash_checker = TargetFunctions.hash_target(target_hash, 'md5')
    print(f"Test avec 'test' : {hash_checker('test')}")
    print(f"Test avec 'wrong' : {hash_checker('wrong')}")
    
    # Test avec une chaîne simple
    string_checker = TargetFunctions.simple_string_target('password123')
    print(f"Test avec 'password123' : {string_checker('password123')}")
    print(f"Test avec 'wrong' : {string_checker('wrong')}")

