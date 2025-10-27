# 🚀 Guide de Démarrage Rapide - CI/CD EventEase

## ⚡ Démarrage en 5 Minutes

### Prérequis

- ✅ Compte GitHub
- ✅ Serveur Ubuntu/Debian (optionnel pour déploiement distant)
- ✅ Java 17+
- ✅ Docker et Docker Compose

---

## 📋 Option 1: Déploiement Local (Développement)

### Étape 1: Cloner le Projet

```bash
git clone https://github.com/VOTRE_USERNAME/EventEase.git
cd EventEase
```

### Étape 2: Déployer

```bash
# Rendre le script exécutable
chmod +x scripts/deploy.sh

# Déployer localement
./scripts/deploy.sh local
```

### Étape 3: Vérifier

```bash
# Health check
curl http://localhost:9020/health

# Voir les logs
./scripts/deploy.sh logs
```

**✅ C'est tout!** L'application est disponible sur `http://localhost:9020`

---

## 🌐 Option 2: Déploiement avec GitHub Actions (Production)

### Étape 1: Préparer le Serveur

Sur votre serveur distant:

```bash
# Télécharger le script de configuration
wget https://raw.githubusercontent.com/VOTRE_USERNAME/EventEase/main/scripts/setup-server.sh

# Exécuter
bash setup-server.sh
```

Le script va:
- ✅ Installer Docker et Docker Compose
- ✅ Créer le répertoire de déploiement
- ✅ Générer une clé SSH
- ✅ Afficher la clé à copier

### Étape 2: Configurer GitHub Secrets

1. **Copier la clé SSH** affichée par le script

2. **Aller dans GitHub:**
   - Votre repo → `Settings` → `Secrets and variables` → `Actions`

3. **Ajouter 3 secrets:**

   | Nom | Valeur | Exemple |
   |-----|--------|---------|
   | `SERVER_HOST` | IP du serveur | `192.168.1.100` |
   | `SERVER_USER` | Utilisateur SSH | `ubuntu` |
   | `SSH_PRIVATE_KEY` | Clé SSH copiée | `-----BEGIN RSA PRIVATE KEY-----...` |

### Étape 3: Déclencher le Déploiement

```bash
# Faire un commit
git add .
git commit -m "feat: activer CI/CD"
git push origin main
```

### Étape 4: Suivre la Pipeline

1. Aller dans l'onglet **Actions** sur GitHub
2. Voir la pipeline en cours d'exécution
3. Attendre ≈ 15-20 minutes

### Étape 5: Vérifier le Déploiement

```bash
# Health check
curl http://VOTRE_SERVER_IP:9020/health

# Réponse attendue
{
  "status": "UP",
  "timestamp": "2025-10-27T10:00:00Z"
}
```

**✅ Déploiement réussi!** L'application est en production.

---

## 🔄 Workflow Quotidien

### Développement Local

```bash
# 1. Faire des modifications
vim EventEase/backend/src/main/java/...

# 2. Tester localement
./scripts/deploy.sh test

# 3. Déployer localement
./scripts/deploy.sh local

# 4. Vérifier
curl http://localhost:9020/health
```

### Déploiement en Production

```bash
# 1. Commit et push
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 2. GitHub Actions fait le reste automatiquement:
#    - Compile le code
#    - Exécute les tests
#    - Build l'image Docker
#    - Déploie sur le serveur
#    - Vérifie le health check

# 3. Vérifier sur le serveur
curl http://VOTRE_SERVER_IP:9020/health
```

---

## 📊 Visualisation de la Pipeline

### Dans GitHub Actions

1. **Onglet Actions** → Voir toutes les exécutions
2. **Cliquer sur une exécution** → Voir les détails
3. **4 stages visibles:**
   - 🏗️ Build & Test (5-7 min)
   - 🐳 Docker Build (3-5 min)
   - 🚀 Deploy (2-3 min)
   - 📊 Quality & Security (3-5 min)

### Artifacts Téléchargeables

Après chaque build:
- 📦 `test-results` - Rapports de tests
- 📦 `eventease-backend-jar` - JAR compilé
- 📦 `coverage-report` - Couverture de code

---

## 🐛 Résolution Rapide des Problèmes

### ❌ Tests échouent

```bash
cd EventEase/backend
./mvnw clean test
# Vérifier les logs
```

### ❌ SSH échoue

```bash
# Vérifier la connexion
ssh SERVER_USER@SERVER_HOST

# Vérifier la clé dans GitHub Secrets
```

### ❌ Docker build échoue

```bash
cd EventEase/backend
docker build -t test .
# Vérifier les erreurs
```

### ❌ Health check échoue

```bash
# Sur le serveur
docker compose logs api
docker compose ps
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez:

- 📖 [Guide CI/CD Complet](o10_CICD_SABTI_Yousif.md)
- 📖 [Documentation Pipeline](.github/workflows/README.md)
- 📖 [Scripts de Déploiement](scripts/README.md)
- 📖 [Guide des Tests](docs/TESTS_README.md)

---

## 🎯 Checklist de Vérification

### ✅ Configuration Initiale

- [ ] Serveur préparé avec `setup-server.sh`
- [ ] Secrets GitHub configurés (3 secrets)
- [ ] Clé SSH testée
- [ ] Ports ouverts (9020, 27018)

### ✅ Premier Déploiement

- [ ] Code poussé sur GitHub
- [ ] Pipeline exécutée avec succès
- [ ] Health check réussi
- [ ] API accessible

### ✅ Monitoring

- [ ] Logs vérifiés
- [ ] Containers en cours d'exécution
- [ ] MongoDB connecté
- [ ] Pas d'erreurs dans les logs

---

## 🚀 Prochaines Étapes

Une fois le CI/CD en place:

1. **Ajouter des tests** - Augmenter la couverture
2. **Configurer des notifications** - Slack/Discord
3. **Ajouter des environnements** - Dev/Staging/Prod
4. **Monitoring avancé** - Prometheus/Grafana
5. **Backup automatique** - Base de données

---

## 💡 Conseils

### Performance

- ✅ Utilisez le cache Maven dans GitHub Actions
- ✅ Optimisez le Dockerfile (multi-stage builds)
- ✅ Utilisez Docker layer caching

### Sécurité

- ✅ Ne commitez jamais les secrets
- ✅ Utilisez GitHub Secrets
- ✅ Changez les mots de passe par défaut
- ✅ Activez le firewall sur le serveur

### Maintenance

- ✅ Vérifiez les logs régulièrement
- ✅ Mettez à jour les dépendances
- ✅ Faites des backups de la base de données
- ✅ Testez les rollbacks

---

## 📞 Besoin d'Aide?

1. **Consulter les logs:**
   ```bash
   ./scripts/deploy.sh logs
   ```

2. **Tester localement:**
   ```bash
   ./scripts/deploy.sh test
   ```

3. **Nettoyer et recommencer:**
   ```bash
   ./scripts/deploy.sh clean
   ./scripts/deploy.sh local
   ```

---

**Temps total de mise en place:** ≈ 30 minutes  
**Temps de déploiement:** ≈ 15-20 minutes  
**Niveau de difficulté:** ⭐⭐⭐☆☆ (Intermédiaire)

---

**Auteur:** SABTI Yousif  
**Date:** 2025-10-27  
**Version:** 1.0  
**Statut:** ✅ Production Ready
