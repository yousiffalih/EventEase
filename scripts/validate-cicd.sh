#!/bin/bash

# ========================================
# ✅ Script de Validation CI/CD
# ========================================
# 
# Vérifie que tous les fichiers et configurations
# nécessaires pour le CI/CD sont en place
# 
# Usage:
#   ./scripts/validate-cicd.sh
# 
# ========================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0
SUCCESS=0

log_check() {
    echo -e "${BLUE}🔍 Vérification: $1${NC}"
}

log_success() {
    echo -e "${GREEN}  ✅ $1${NC}"
    ((SUCCESS++))
}

log_warning() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
    ((WARNINGS++))
}

log_error() {
    echo -e "${RED}  ❌ $1${NC}"
    ((ERRORS++))
}

echo ""
echo "=========================================="
echo "✅ Validation de la Configuration CI/CD"
echo "=========================================="
echo ""

# 1. Vérifier les fichiers de pipeline
log_check "Fichiers de pipeline GitHub Actions"

if [ -f ".github/workflows/ci-cd.yml" ]; then
    log_success "Pipeline principale trouvée"
else
    log_error "Pipeline principale manquante: .github/workflows/ci-cd.yml"
fi

if [ -f ".github/workflows/README.md" ]; then
    log_success "Documentation pipeline trouvée"
else
    log_warning "Documentation pipeline manquante"
fi

# 2. Vérifier les scripts
log_check "Scripts de déploiement"

if [ -f "scripts/deploy.sh" ]; then
    log_success "Script de déploiement trouvé"
    if [ -x "scripts/deploy.sh" ]; then
        log_success "Script exécutable"
    else
        log_warning "Script non exécutable (chmod +x scripts/deploy.sh)"
    fi
else
    log_error "Script de déploiement manquant: scripts/deploy.sh"
fi

if [ -f "scripts/setup-server.sh" ]; then
    log_success "Script de configuration serveur trouvé"
    if [ -x "scripts/setup-server.sh" ]; then
        log_success "Script exécutable"
    else
        log_warning "Script non exécutable (chmod +x scripts/setup-server.sh)"
    fi
else
    log_error "Script de configuration manquant: scripts/setup-server.sh"
fi

# 3. Vérifier la documentation
log_check "Documentation"

if [ -f "o10_CICD_SABTI_Yousif.md" ]; then
    log_success "Documentation CI/CD trouvée"
else
    log_error "Documentation CI/CD manquante: o10_CICD_SABTI_Yousif.md"
fi

if [ -f "QUICKSTART_CICD.md" ]; then
    log_success "Guide de démarrage rapide trouvé"
else
    log_warning "Guide de démarrage rapide manquant"
fi

if [ -f "scripts/README.md" ]; then
    log_success "Documentation scripts trouvée"
else
    log_warning "Documentation scripts manquante"
fi

# 4. Vérifier les fichiers Docker
log_check "Fichiers Docker"

if [ -f "EventEase/backend/Dockerfile" ]; then
    log_success "Dockerfile trouvé"
else
    log_error "Dockerfile manquant: EventEase/backend/Dockerfile"
fi

if [ -f "EventEase/backend/docker-compose.yml" ]; then
    log_success "docker-compose.yml trouvé"
else
    log_error "docker-compose.yml manquant"
fi

if [ -f "EventEase/backend/.env" ]; then
    log_success "Fichier .env trouvé"
else
    log_warning "Fichier .env manquant (peut être créé plus tard)"
fi

# 5. Vérifier le projet backend
log_check "Projet Backend"

if [ -f "EventEase/backend/pom.xml" ]; then
    log_success "pom.xml trouvé"
else
    log_error "pom.xml manquant"
fi

if [ -f "EventEase/backend/mvnw" ]; then
    log_success "Maven wrapper trouvé"
    if [ -x "EventEase/backend/mvnw" ]; then
        log_success "Maven wrapper exécutable"
    else
        log_warning "Maven wrapper non exécutable"
    fi
else
    log_error "Maven wrapper manquant"
fi

# 6. Vérifier les tests
log_check "Tests d'intégration"

if [ -f "EventEase/backend/src/test/java/com/eventease/backend/AbstractIntegrationTest.java" ]; then
    log_success "Classe de base des tests trouvée"
else
    log_error "AbstractIntegrationTest.java manquant"
fi

if [ -f "EventEase/backend/src/test/java/com/eventease/backend/admin/AdminReservationIntegrationTest.java" ]; then
    log_success "Tests admin trouvés"
else
    log_warning "Tests admin manquants"
fi

if [ -f "EventEase/backend/src/test/java/com/eventease/backend/reservation/ReservationIntegrationTest.java" ]; then
    log_success "Tests réservations trouvés"
else
    log_warning "Tests réservations manquants"
fi

# 7. Vérifier les prérequis système
log_check "Prérequis système"

if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    log_success "Java installé: $JAVA_VERSION"
else
    log_error "Java non installé"
fi

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    log_success "Docker installé: $DOCKER_VERSION"
else
    log_warning "Docker non installé (requis pour déploiement)"
fi

if command -v docker compose &> /dev/null; then
    log_success "Docker Compose installé"
else
    log_warning "Docker Compose non installé (requis pour déploiement)"
fi

if command -v git &> /dev/null; then
    log_success "Git installé"
else
    log_error "Git non installé"
fi

# 8. Vérifier la structure du projet
log_check "Structure du projet"

REQUIRED_DIRS=(
    ".github/workflows"
    "scripts"
    "EventEase/backend/src/main/java"
    "EventEase/backend/src/test/java"
    "docs"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Répertoire trouvé: $dir"
    else
        log_error "Répertoire manquant: $dir"
    fi
done

# 9. Vérifier le contenu de la pipeline
log_check "Contenu de la pipeline"

if [ -f ".github/workflows/ci-cd.yml" ]; then
    if grep -q "build-and-test" ".github/workflows/ci-cd.yml"; then
        log_success "Stage BUILD trouvé"
    else
        log_error "Stage BUILD manquant dans la pipeline"
    fi
    
    if grep -q "docker-build" ".github/workflows/ci-cd.yml"; then
        log_success "Stage DOCKER BUILD trouvé"
    else
        log_error "Stage DOCKER BUILD manquant dans la pipeline"
    fi
    
    if grep -q "deploy" ".github/workflows/ci-cd.yml"; then
        log_success "Stage DEPLOY trouvé"
    else
        log_error "Stage DEPLOY manquant dans la pipeline"
    fi
    
    if grep -q "code-quality" ".github/workflows/ci-cd.yml"; then
        log_success "Stage QUALITY trouvé"
    else
        log_warning "Stage QUALITY manquant dans la pipeline"
    fi
fi

# 10. Vérifier les secrets GitHub (simulation)
log_check "Configuration GitHub Secrets"

echo "  ℹ️  Secrets requis (à configurer dans GitHub):"
echo "     - SERVER_HOST"
echo "     - SERVER_USER"
echo "     - SSH_PRIVATE_KEY"
log_warning "Vérifiez manuellement dans GitHub → Settings → Secrets"

# Résumé
echo ""
echo "=========================================="
echo "📊 Résumé de la Validation"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ Succès: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Avertissements: $WARNINGS${NC}"
echo -e "${RED}❌ Erreurs: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Configuration CI/CD valide!${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. Configurer les secrets GitHub"
    echo "  2. Pousser le code sur GitHub"
    echo "  3. Vérifier l'exécution dans Actions"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Configuration CI/CD incomplète${NC}"
    echo ""
    echo "Veuillez corriger les erreurs ci-dessus avant de continuer."
    echo ""
    exit 1
fi
