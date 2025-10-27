# 🚀 GitHub Actions CI/CD - Configuration

## 📋 Secrets Requis

Pour que la pipeline fonctionne, vous devez configurer les secrets suivants dans GitHub:

### Configuration des Secrets

**Aller dans:** `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret | Description | Exemple |
|--------|-------------|---------|
| `SERVER_HOST` | Adresse IP ou domaine du serveur | `192.168.1.100` ou `eventease.example.com` |
| `SERVER_USER` | Nom d'utilisateur SSH | `ubuntu` ou `deploy` |
| `SSH_PRIVATE_KEY` | Clé privée SSH pour connexion | Contenu de `~/.ssh/id_rsa` |

### Génération de la Clé SSH

Sur votre serveur de déploiement:

```bash
# 1. Générer une paire de clés SSH
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# 2. Ajouter la clé publique aux authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# 3. Copier la clé privée (à mettre dans GitHub Secrets)
cat ~/.ssh/github_deploy
```

## 🔧 Configuration du Serveur

### Prérequis sur le Serveur

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Installer Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# 3. Créer le répertoire de déploiement
mkdir -p ~/eventease
cd ~/eventease

# 4. Vérifier l'installation
docker --version
docker compose version
```

## 🚀 Déclenchement de la Pipeline

### Automatique

La pipeline se déclenche automatiquement sur:
- **Push** sur `main` ou `develop`
- **Pull Request** vers `main`

### Manuel

1. Aller dans l'onglet **Actions**
2. Sélectionner **EventEase CI/CD Pipeline**
3. Cliquer sur **Run workflow**
4. Choisir la branche
5. Cliquer sur **Run workflow**

## 📊 Stages de la Pipeline

### Stage 1: Build & Test (≈ 5-7 min)
- ✅ Compilation Maven
- ✅ Tests d'intégration avec Testcontainers
- ✅ Génération de rapports
- ✅ Upload des artifacts

### Stage 2: Docker Build (≈ 3-5 min)
- ✅ Construction de l'image Docker
- ✅ Push vers GitHub Container Registry
- ✅ Tagging automatique (latest, branch, sha)

### Stage 3: Deploy (≈ 2-3 min)
- ✅ Connexion SSH au serveur
- ✅ Copie des fichiers de configuration
- ✅ Pull de l'image Docker
- ✅ Redémarrage des services
- ✅ Health check

### Stage 4: Quality & Security (≈ 3-5 min)
- ✅ Analyse de sécurité des dépendances
- ✅ Rapport de couverture de code

**Durée totale:** ≈ 13-20 minutes

## 🔍 Visualisation des Résultats

### Artifacts Disponibles

Après chaque exécution, vous pouvez télécharger:

1. **test-results** - Rapports de tests JUnit
2. **eventease-backend-jar** - Fichier JAR compilé
3. **coverage-report** - Rapport de couverture Jacoco

### Accès aux Artifacts

1. Aller dans **Actions**
2. Cliquer sur un workflow exécuté
3. Descendre jusqu'à **Artifacts**
4. Télécharger l'artifact souhaité

## 🐛 Dépannage

### Erreur: "Tests failed"

```bash
# Vérifier localement
cd EventEase/backend
./mvnw clean test
```

### Erreur: "SSH connection failed"

Vérifier:
- Le secret `SSH_PRIVATE_KEY` est correctement configuré
- Le serveur est accessible: `ping $SERVER_HOST`
- L'utilisateur a les permissions: `ssh $SERVER_USER@$SERVER_HOST`

### Erreur: "Docker build failed"

```bash
# Tester localement
cd EventEase/backend
docker build -t eventease-test .
```

### Erreur: "Health check failed"

```bash
# Sur le serveur
docker compose logs api
curl http://localhost:9020/health
```

## 📈 Monitoring

### Vérifier le Statut de l'Application

```bash
# Sur le serveur
cd ~/eventease
docker compose ps
docker compose logs -f api
```

### Vérifier les Logs

```bash
# Logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f api
docker compose logs -f mongo
```

## 🔄 Rollback

En cas de problème après déploiement:

```bash
# Sur le serveur
cd ~/eventease

# Revenir à la version précédente
docker compose down
docker pull ghcr.io/VOTRE_USERNAME/eventease-backend:previous-tag
docker compose up -d
```

## 📞 Support

En cas de problème:
1. Vérifier les logs dans GitHub Actions
2. Vérifier les logs sur le serveur
3. Consulter la documentation dans `/docs`

---

**Dernière mise à jour:** 2025-10-27  
**Version:** 1.0
