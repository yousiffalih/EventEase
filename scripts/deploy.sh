#!/bin/bash

# ========================================
# 🚀 Script de Déploiement EventEase
# ========================================
# 
# Usage:
#   ./scripts/deploy.sh [environment]
# 
# Environments:
#   - local    : Déploiement local (Docker Compose)
#   - remote   : Déploiement sur serveur distant
#   - test     : Tests uniquement
# 
# ========================================

set -e  # Exit on error

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-local}
BACKEND_DIR="EventEase/backend"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Java
    if ! command -v java &> /dev/null; then
        log_error "Java n'est pas installé"
        exit 1
    fi
    log_success "Java: $(java -version 2>&1 | head -n 1)"
    
    # Vérifier Maven
    if [ ! -f "$PROJECT_ROOT/$BACKEND_DIR/mvnw" ]; then
        log_error "Maven wrapper non trouvé"
        exit 1
    fi
    log_success "Maven wrapper trouvé"
    
    # Vérifier Docker (pour local/remote)
    if [ "$ENVIRONMENT" != "test" ]; then
        if ! command -v docker &> /dev/null; then
            log_error "Docker n'est pas installé"
            exit 1
        fi
        log_success "Docker: $(docker --version)"
        
        if ! command -v docker compose &> /dev/null; then
            log_error "Docker Compose n'est pas installé"
            exit 1
        fi
        log_success "Docker Compose: $(docker compose version)"
    fi
}

# Compiler le projet
build_project() {
    log_info "Compilation du projet..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    
    ./mvnw clean compile -DskipTests
    log_success "Compilation réussie"
}

# Exécuter les tests
run_tests() {
    log_info "Exécution des tests..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    
    ./mvnw test
    log_success "Tests réussis"
    
    # Afficher le résumé
    log_info "Résumé des tests:"
    grep -A 5 "Tests run:" target/surefire-reports/*.txt | tail -n 6 || true
}

# Créer le package
package_application() {
    log_info "Création du package..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    
    ./mvnw package -DskipTests
    log_success "Package créé: target/backend-*.jar"
}

# Construire l'image Docker
build_docker_image() {
    log_info "Construction de l'image Docker..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    
    docker build -t eventease-backend:latest .
    log_success "Image Docker créée: eventease-backend:latest"
}

# Déploiement local
deploy_local() {
    log_info "Déploiement local avec Docker Compose..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    
    # Arrêter les containers existants
    docker compose down || true
    
    # Démarrer les services
    docker compose up -d
    
    log_success "Services démarrés"
    
    # Attendre que l'API soit prête
    log_info "Attente du démarrage de l'API..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:9020/health &> /dev/null; then
        log_success "API opérationnelle: http://localhost:9020"
    else
        log_warning "L'API n'est pas encore prête, vérifiez les logs"
    fi
    
    # Afficher les containers
    docker compose ps
}

# Déploiement distant
deploy_remote() {
    log_info "Déploiement sur serveur distant..."
    
    # Vérifier les variables d'environnement
    if [ -z "$SERVER_HOST" ] || [ -z "$SERVER_USER" ]; then
        log_error "Variables SERVER_HOST et SERVER_USER requises"
        log_info "Usage: SERVER_HOST=192.168.1.100 SERVER_USER=ubuntu ./scripts/deploy.sh remote"
        exit 1
    fi
    
    log_info "Serveur: $SERVER_USER@$SERVER_HOST"
    
    # Copier les fichiers
    log_info "Copie des fichiers de configuration..."
    scp "$PROJECT_ROOT/$BACKEND_DIR/docker-compose.yml" \
        "$PROJECT_ROOT/$BACKEND_DIR/.env" \
        "$SERVER_USER@$SERVER_HOST:~/eventease/"
    
    # Déployer sur le serveur
    log_info "Déploiement des containers..."
    ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
        cd ~/eventease
        docker compose pull
        docker compose down
        docker compose up -d
        docker compose ps
EOF
    
    log_success "Déploiement distant réussi"
    
    # Health check
    log_info "Vérification de l'API..."
    sleep 10
    if curl -f "http://$SERVER_HOST:9020/health" &> /dev/null; then
        log_success "API opérationnelle: http://$SERVER_HOST:9020"
    else
        log_warning "Health check échoué, vérifiez les logs sur le serveur"
    fi
}

# Afficher les logs
show_logs() {
    log_info "Affichage des logs..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    docker compose logs -f
}

# Arrêter les services
stop_services() {
    log_info "Arrêt des services..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    docker compose down
    log_success "Services arrêtés"
}

# Nettoyage
cleanup() {
    log_info "Nettoyage..."
    cd "$PROJECT_ROOT/$BACKEND_DIR"
    
    # Arrêter les containers
    docker compose down || true
    
    # Nettoyer Maven
    ./mvnw clean || true
    
    # Nettoyer les images Docker non utilisées
    docker image prune -f || true
    
    log_success "Nettoyage terminé"
}

# Menu principal
main() {
    echo ""
    echo "=========================================="
    echo "🚀 EventEase - Script de Déploiement"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    
    case "$ENVIRONMENT" in
        local)
            log_info "Déploiement LOCAL"
            build_project
            run_tests
            package_application
            build_docker_image
            deploy_local
            ;;
        
        remote)
            log_info "Déploiement DISTANT"
            build_project
            run_tests
            package_application
            build_docker_image
            deploy_remote
            ;;
        
        test)
            log_info "Mode TEST uniquement"
            build_project
            run_tests
            ;;
        
        logs)
            show_logs
            ;;
        
        stop)
            stop_services
            ;;
        
        clean)
            cleanup
            ;;
        
        *)
            log_error "Environnement invalide: $ENVIRONMENT"
            echo ""
            echo "Usage: $0 [environment]"
            echo ""
            echo "Environments disponibles:"
            echo "  local   - Déploiement local (Docker Compose)"
            echo "  remote  - Déploiement sur serveur distant"
            echo "  test    - Tests uniquement"
            echo "  logs    - Afficher les logs"
            echo "  stop    - Arrêter les services"
            echo "  clean   - Nettoyage complet"
            echo ""
            exit 1
            ;;
    esac
    
    echo ""
    log_success "Déploiement terminé avec succès! 🎉"
    echo ""
}

# Gestion des signaux
trap 'log_error "Script interrompu"; exit 1' INT TERM

# Exécution
main
