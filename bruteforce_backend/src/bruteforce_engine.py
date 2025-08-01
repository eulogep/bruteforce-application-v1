
import itertools
import string
import time

class BruteForceEngine:
    def __init__(self, charset, min_length, max_length):
        self.charset = charset
        self.min_length = min_length
        self.max_length = max_length
        self.running = False
        self.found_password = None
        self.attempts = 0
        self.start_time = None

    def _generate_passwords(self):
        for length in range(self.min_length, self.max_length + 1):
            for attempt in itertools.product(self.charset, repeat=length):
                yield ''.join(attempt)

    def start_attack(self, target_function):
        self.running = True
        self.found_password = None
        self.attempts = 0
        self.start_time = time.time()

        for password in self._generate_passwords():
            if not self.running:
                break
            self.attempts += 1
            if target_function(password):
                self.found_password = password
                self.running = False
                break
        return self.found_password

    def stop_attack(self):
        self.running = False

    def get_status(self):
        elapsed_time = time.time() - self.start_time if self.start_time else 0
        return {
            'running': self.running,
            'found_password': self.found_password,
            'attempts': self.attempts,
            'elapsed_time': elapsed_time
        }

# Exemple d'utilisation (pour les tests)
if __name__ == '__main__':
    def dummy_target(password):
        # Simule une vérification de mot de passe
        return password == 'abc'

    engine = BruteForceEngine(string.ascii_lowercase, 1, 3)
    print("Démarrage de l'attaque...")
    found = engine.start_attack(dummy_target)
    if found:
        print(f"Mot de passe trouvé : {found}")
    else:
        print("Mot de passe non trouvé.")
    print(engine.get_status())

    engine = BruteForceEngine(string.digits, 1, 4)
    print("Démarrage d'une nouvelle attaque...")
    found = engine.start_attack(lambda p: p == '1234')
    if found:
        print(f"Mot de passe trouvé : {found}")
    else:
        print("Mot de passe non trouvé.")
    print(engine.get_status())


