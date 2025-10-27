# 📜 Scripts de Déploiement EventEase

Ce dossier contient les scripts pour automatiser le déploiement et la configuration d'EventEase.

## 📋 Scripts Disponibles

### 1. `deploy.sh` - Script de Déploiement Principal

Déploie l'application EventEase dans différents environnements.

#### Usage

```bash
# Déploiement local (Docker Compose)
./scripts/deploy.sh local

# Déploiement sur serveur distant
SERVER_HOST=192.168.1.100 SERVER_USER=ubuntu ./scripts/deploy.sh remote

# Tests uniquement
./scripts/deploy.sh test

# Afficher les logs
./scripts/deploy.sh logs

# Arrêter les services
./scripts/deploy.sh stop

# Nettoyage complet
./scripts/deploy.sh clean
```

#### Fonctionnalités

- ✅ Vérification des prérequis (Java, Maven, Docker)
- ✅ Compilation du projet
- ✅ Exécution des tests
- ✅ Construction de l'image Docker
- ✅ Déploiement local ou distant
- ✅ Health check automatique
- ✅ Gestion des logs

---

### 2. `setup-server.sh` - Configuration du Serveur

Prépare un serveur Ubuntu/Debian pour recevoir l'application.

#### Usage

```bash
# Sur le serveur distant
bash setup-server.sh
```

#### Ce que fait le script

1. ✅ Met à jour le système
2. ✅ Installe Docker et Docker Compose
3. ✅ Crée le répertoire de déploiement (`~/eventease`)
4. ✅ Configure le firewall (ports 22, 9020, 27018)
5. ✅ Génère une clé SSH pour GitHub Actions
6. ✅ Installe des outils utiles (curl, wget, git, htop, vim)
7. ✅ Configure Docker pour démarrer au boot
8. ✅ Affiche la clé SSH à copier dans GitHub Secrets

---

## 🚀 Guide de Démarrage Rapide

### Déploiement Local

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/EventEase.git
cd EventEase

# 2. Déployer localement
./scripts/deploy.sh local

# 3. Vérifier l'application
curl http://localhost:9020/health

# 4. Accéder à l'API
open http://localhost:9020
```

### Déploiement sur Serveur Distant

#### Étape 1: Préparer le Serveur

```bash
# Sur le serveur distant
wget https://raw.githubusercontent.com/VOTRE_USERNAME/EventEase/main/scripts/setup-server.sh
bash setup-server.sh
```

#### Étape 2: Configurer GitHub Secrets

1. Copier la clé SSH affichée par le script
2. Aller dans GitHub → Settings → Secrets → Actions
3. Ajouter les secrets:
   - `SERVER_HOST`: IP du serveur
   - `SERVER_USER`: Nom d'utilisateur SSH
   - `SSH_PRIVATE_KEY`: Clé SSH copiée

#### Étape 3: Déployer

```bash
# Option 1: Via GitHub Actions (automatique)
git push origin main

# Option 2: Manuellement depuis votre machine
SERVER_HOST=192.168.1.100 SERVER_USER=ubuntu ./scripts/deploy.sh remote
```

---

## 🔧 Configuration

### Variables d'Environnement

#### Pour le déploiement distant

```bash
export SERVER_HOST="192.168.1.100"    # IP ou domaine du serveur
export SERVER_USER="ubuntu"            # Utilisateur SSH
```

#### Pour l'application

Modifier `EventEase/backend/.env`:

```env
API_PORT=9020
MONGO_PORT=27018
MONGO_DB=eventease
MONGO_USER=root
MONGO_PASSWORD=rootpass
```

---

## 📊 Monitoring et Logs

### Afficher les Logs

```bash
# Tous les services
./scripts/deploy.sh logs

# Ou directement avec Docker Compose
cd EventEase/backend
docker compose logs -f

# API seulement
docker compose logs -f api

# MongoDB seulement
docker compose logs -f mongo
```

### Vérifier le Statut

```bash
# Statut des containers
cd EventEase/backend
docker compose ps

# Health check
curl http://localhost:9020/health
```

### Statistiques des Containers

```bash
# Utilisation CPU/Mémoire
docker stats

# Logs en temps réel
docker compose logs -f --tail=100
```

---

## 🐛 Dépannage

### Problème: Tests échouent

```bash
# Exécuter les tests manuellement
cd EventEase/backend
./mvnw clean test

# Vérifier les logs
cat target/surefire-reports/*.txt
```

### Problème: Docker build échoue

```bash
# Vérifier le Dockerfile
cd EventEase/backend
docker build -t test .

# Nettoyer le cache Docker
docker builder prune -a
```

### Problème: Connexion SSH échoue

```bash
# Tester la connexion
ssh -i ~/.ssh/id_rsa user@server

# Vérifier les permissions
chmod 600 ~/.ssh/id_rsa
chmod 700 ~/.ssh
```

### Problème: Application ne démarre pas

```bash
# Vérifier les logs
docker compose logs api

# Vérifier MongoDB
docker compose logs mongo

# Redémarrer les services
docker compose restart
```

---

## 🧹 Nettoyage

### Arrêter les Services

```bash
./scripts/deploy.sh stop
```

### Nettoyage Complet

```bash
# Nettoie tout (containers, images, build)
./scripts/deploy.sh clean

# Ou manuellement
cd EventEase/backend
docker compose down -v
./mvnw clean
docker image prune -a -f
```

---

## 📚 Ressources

### Documentation

- [Guide CI/CD](../o10_CICD_SABTI_Yousif.md)
- [Guide des Tests](../docs/TESTS_README.md)
- [Pipeline GitHub Actions](../.github/workflows/README.md)

### Commandes Utiles

```bash
# Vérifier Java
java -version

# Vérifier Maven
./EventEase/backend/mvnw --version

# Vérifier Docker
docker --version
docker compose version

# Vérifier les ports utilisés
sudo netstat -tuln | grep -E '9020|27018'

# Vérifier l'espace disque
df -h
docker system df
```

---

## 🎯 Checklist de Déploiement

### Avant le Déploiement

- [ ] Java 17+ installé
- [ ] Docker et Docker Compose installés
- [ ] Ports 9020 et 27018 disponibles
- [ ] Variables d'environnement configurées
- [ ] Tests passent localement

### Après le Déploiement

- [ ] Health check réussi
- [ ] API accessible
- [ ] MongoDB connecté
- [ ] Logs sans erreurs
- [ ] Backup configuré (optionnel)

---

## 📞 Support

En cas de problème:

1. Consulter les logs: `./scripts/deploy.sh logs`
2. Vérifier la documentation dans `/docs`
3. Tester localement: `./scripts/deploy.sh test`
4. Vérifier les issues GitHub

---

**Dernière mise à jour:** 2025-10-27  
**Version:** 1.0
