#!/bin/bash

# ========================================
# 🔧 Script de Configuration du Serveur
# ========================================
# 
# Ce script prépare un serveur Ubuntu/Debian
# pour le déploiement d'EventEase
# 
# Usage:
#   bash setup-server.sh
# 
# ========================================

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "=========================================="
echo "🔧 Configuration du Serveur EventEase"
echo "=========================================="
echo ""

# 1. Mise à jour du système
log_info "Mise à jour du système..."
sudo apt-get update
sudo apt-get upgrade -y
log_success "Système mis à jour"

# 2. Installation de Docker
log_info "Installation de Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_success "Docker installé"
else
    log_success "Docker déjà installé: $(docker --version)"
fi

# 3. Installation de Docker Compose
log_info "Installation de Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
    log_success "Docker Compose installé"
else
    log_success "Docker Compose déjà installé: $(docker compose version)"
fi

# 4. Création du répertoire de déploiement
log_info "Création du répertoire de déploiement..."
mkdir -p ~/eventease
cd ~/eventease
log_success "Répertoire créé: ~/eventease"

# 5. Configuration du firewall (UFW)
log_info "Configuration du firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 9020/tcp  # API EventEase
    sudo ufw allow 27018/tcp # MongoDB (optionnel)
    log_success "Firewall configuré"
else
    log_warning "UFW non installé, ignoré"
fi

# 6. Configuration SSH pour GitHub Actions
log_info "Configuration SSH..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
log_success "SSH configuré"

# 7. Génération de la clé SSH pour GitHub Actions
log_info "Génération de la clé SSH pour GitHub Actions..."
if [ ! -f ~/.ssh/github_deploy ]; then
    ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
    cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
    log_success "Clé SSH générée"
    
    echo ""
    echo "=========================================="
    echo "🔑 CLÉ PRIVÉE SSH (à copier dans GitHub Secrets)"
    echo "=========================================="
    echo ""
    cat ~/.ssh/github_deploy
    echo ""
    echo "=========================================="
    echo ""
    log_warning "Copiez cette clé dans GitHub → Settings → Secrets → SSH_PRIVATE_KEY"
else
    log_success "Clé SSH déjà existante"
fi

# 8. Installation d'outils utiles
log_info "Installation d'outils utiles..."
sudo apt-get install -y curl wget git htop vim
log_success "Outils installés"

# 9. Configuration de Docker pour démarrer au boot
log_info "Configuration de Docker au démarrage..."
sudo systemctl enable docker
sudo systemctl start docker
log_success "Docker configuré pour démarrer au boot"

# 10. Test de Docker
log_info "Test de Docker..."
docker run --rm hello-world > /dev/null 2>&1
log_success "Docker fonctionne correctement"

# Résumé
echo ""
echo "=========================================="
echo "✅ Configuration Terminée!"
echo "=========================================="
echo ""
echo "📋 Informations du serveur:"
echo "  - Hostname: $(hostname)"
echo "  - IP: $(hostname -I | awk '{print $1}')"
echo "  - Docker: $(docker --version)"
echo "  - Docker Compose: $(docker compose version)"
echo ""
echo "📁 Répertoire de déploiement: ~/eventease"
echo ""
echo "🔑 Prochaines étapes:"
echo "  1. Copier la clé SSH privée ci-dessus dans GitHub Secrets"
echo "  2. Configurer les secrets GitHub:"
echo "     - SERVER_HOST: $(hostname -I | awk '{print $1}')"
echo "     - SERVER_USER: $USER"
echo "     - SSH_PRIVATE_KEY: (clé affichée ci-dessus)"
echo "  3. Pousser du code sur GitHub pour déclencher la pipeline"
echo ""
echo "⚠️  IMPORTANT: Déconnectez-vous et reconnectez-vous pour que"
echo "    les permissions Docker prennent effet!"
echo ""
