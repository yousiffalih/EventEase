# 📋 Scénarios de Tests - EventEase MVP

**Date de création:** 2025-10-20  
**Projet:** EventEase - Plateforme de gestion d'événements  
**Lien Jira:** https://uha4point0.atlassian.net/jira/software/projects/EV/boards/576

---

## 📊 User Story 1: Réserver une place pour un événement

### Informations de la User Story

**En tant que:** Utilisateur connecté  
**Je voudrais:** Réserver une place pour un événement  
**Afin de:** Participer à l'événement si des places sont disponibles

### Critères d'Acceptation

1. ✅ L'utilisateur doit être connecté pour réserver
2. ✅ Le système doit vérifier si des places sont disponibles
3. ✅ Si une place est disponible → la réservation est confirmée et enregistrée
4. ✅ Si aucune place n'est disponible → un message d'erreur clair doit s'afficher
5. ✅ Une confirmation de réservation est affichée à l'utilisateur

### Tableau des Cas de Tests

| ID Test | Type de Cas | Scénario | Données d'Entrée | Actions | Résultat Attendu | Statut | Commentaires |
|---------|-------------|----------|------------------|---------|------------------|--------|--------------|
| **TC1** | Cas nominal | L'utilisateur est connecté, choisit un événement avec des places disponibles, et clique sur "Réserver" | - User: `test@eventease.com`<br>- Event: "AI Conference"<br>- Capacité: 50<br>- Réservés: 0<br>- Token JWT valide | POST `/api/reservations`<br>Body: `{eventId, userId}` | - HTTP 200 OK<br>- Réservation créée avec status "PENDING"<br>- Message de confirmation affiché<br>- Places réservées: 1 | ✅ PASS | Test automatisé: `testCasNominal_ReservationAvecPlacesDisponibles()` |
| **TC2** | Cas alternatif 1 | L'utilisateur est connecté mais l'événement est complet | - User: `test@eventease.com`<br>- Event: "AI Conference"<br>- Capacité: 10<br>- Réservés: 10<br>- Token JWT valide | POST `/api/reservations`<br>Body: `{eventId, userId}` | - HTTP 400 Bad Request<br>- Message "No more places available"<br>- Aucune réservation enregistrée | ✅ PASS | Test automatisé: `testCasAlternatif1_EvenementComplet()` |
| **TC3** | Cas alternatif 2 | L'utilisateur n'est pas connecté et essaie de réserver | - Pas de token JWT<br>- Event: "AI Conference" | POST `/api/reservations`<br>Sans header `Authorization` | - HTTP 401/403<br>- Redirection vers page de connexion<br>- Aucune réservation enregistrée | ✅ PASS | Test automatisé: `testCasAlternatif2_UtilisateurNonConnecte()` |
| **TC4** | Cas alternatif 3 | L'utilisateur est connecté et tente de réserver le même événement une 2ᵉ fois | - User: `test@eventease.com`<br>- Event: "AI Conference"<br>- Réservation existante: PENDING | POST `/api/reservations`<br>Body: `{eventId, userId}` (doublon) | - HTTP 500 (Duplicate key error)<br>- Message "Demande déjà effectuée"<br>- Aucune nouvelle réservation créée | ✅ PASS | Test automatisé: `testCasAlternatif3_ReservationDupliquee()`<br>⚠️ Index unique MongoDB |
| **TC5** | Cas limite | Deux utilisateurs essaient de réserver la dernière place en même temps | - User1: `test@eventease.com`<br>- User2: `user2@eventease.com`<br>- Event: Capacité 1, Réservés 0<br>- Requêtes simultanées | 2 threads parallèles<br>POST `/api/reservations` | - 1 réservation acceptée (HTTP 200)<br>- 1 réservation refusée (HTTP 400)<br>- Le 2ᵉ reçoit "Complet"<br>- Total réservations: 1 | ✅ PASS | Test automatisé: `testCasLimite_ConcurrenceLastPlace()`<br>Utilise `ExecutorService` |

### Validation Manuelle

- **Date de validation:** ___________
- **Personne en charge:** ___________
- **Résultat:** ☐ Tous les tests passent ☐ Échecs à corriger

---

## 📊 User Story 2: Accepter/Refuser les Réservations (Admin)

### Informations de la User Story

**En tant que:** Organisateur/Admin  
**Je voudrais:** Accepter ou refuser les demandes de réservation des utilisateurs  
**Afin de:** Gérer l'accès des utilisateurs aux événements disponibles

### Critères d'Acceptation

1. ✅ L'admin doit pouvoir consulter la liste des demandes de réservation
2. ✅ Chaque demande doit contenir le nom de l'utilisateur, l'événement concerné et le statut actuel
3. ✅ L'admin doit pouvoir accepter une réservation → l'utilisateur reçoit une confirmation
4. ✅ L'admin doit pouvoir refuser une réservation → l'utilisateur reçoit un message de refus
5. ✅ Après chaque action, le statut de la demande doit être mis à jour en temps réel
6. ✅ Les utilisateurs ne voient que leurs réservations et leur statut

### Tableau des Cas de Tests

| ID Test | Type de Cas | Scénario | Données d'Entrée | Actions | Résultat Attendu | Statut | Commentaires |
|---------|-------------|----------|------------------|---------|------------------|--------|--------------|
| **TC1** | Cas nominal (accepter) | L'admin accepte une demande de réservation d'un utilisateur | - Admin: `admin@eventease.com`<br>- Réservation: ID valide<br>- Status actuel: PENDING<br>- Token JWT admin | POST `/api/reservations/{id}/approve`<br>Header: `Authorization: Bearer {token}` | - HTTP 200 OK<br>- Réservation validée<br>- Status: "APPROVED"<br>- L'utilisateur voit le statut "acceptée" | ✅ PASS | Test automatisé: `testCasNominal_AdminAccepteReservation()` |
| **TC2** | Cas nominal (refuser) | L'admin refuse une demande de réservation d'un utilisateur | - Admin: `admin@eventease.com`<br>- Réservation: ID valide<br>- Status actuel: PENDING<br>- Raison: "Événement annulé" | POST `/api/reservations/{id}/reject`<br>Body: `{reason: "Événement annulé"}` | - HTTP 200 OK<br>- Réservation refusée<br>- Status: "REFUSED"<br>- Raison enregistrée<br>- L'utilisateur voit le statut "refusée" | ✅ PASS | Test automatisé: `testCasNominal_AdminRefuseReservation()` |
| **TC3** | Cas normal (connexion) | L'admin saisit un login et mot de passe corrects | - Email: `admin@eventease.com`<br>- Password: `admin123` | POST `/api/users/login`<br>Body: `{email, password}` | - HTTP 200 OK<br>- Token JWT retourné<br>- Role: "ADMIN"<br>- Connexion réussie<br>- Accès à l'espace d'administration | ✅ PASS | Test automatisé: `testCasNormal_AdminLoginSuccess()` |
| **TC4** | Cas normal (mauvais identifiants) | L'admin saisit un login ou mot de passe incorrect | - Email: `admin@eventease.com`<br>- Password: `wrongpassword` | POST `/api/users/login`<br>Body: `{email, password}` | - HTTP 401 Unauthorized<br>- Message d'erreur "Invalid credentials"<br>- Aucun accès à l'espace Organisateur | ✅ PASS | Test automatisé: `testCasNormal_AdminLoginFailed()` |
| **TC5** | Cas normal | L'admin consulte toutes les réservations | - Admin: `admin@eventease.com`<br>- Plusieurs réservations de différents users | GET `/api/reservations/admin/all`<br>Header: `Authorization: Bearer {token}` | - HTTP 200 OK<br>- Liste de toutes les réservations<br>- Chaque réservation contient: username, email, eventId, status | ✅ PASS | Test automatisé: `testCasNormal_AdminVoitToutesLesReservations()` |
| **TC6** | Cas limite | L'admin tente d'accepter une réservation inexistante | - Admin: `admin@eventease.com`<br>- Réservation ID: `507f1f77bcf86cd799439011` (fake) | POST `/api/reservations/{fakeId}/approve` | - HTTP 500 Internal Server Error<br>- Message "Reservation not found" | ✅ PASS | Test automatisé: `testCasLimite_AdminAccepteReservationInexistante()` |
| **TC7** | Cas limite | Un utilisateur normal tente d'accéder aux fonctions admin | - User normal: `user@eventease.com`<br>- Role: "USER"<br>- Tente d'approuver une réservation | POST `/api/reservations/{id}/approve`<br>Header: `Authorization: Bearer {userToken}` | - HTTP 403 Forbidden<br>- Message "Access denied" | ⚠️ TODO | **Action requise:** Ajouter `@PreAuthorize("hasRole('ADMIN')")` dans les controllers |
| **TC8** | Cas normal | L'utilisateur ne voit que ses propres réservations | - User: `user@eventease.com`<br>- Autres users avec réservations | GET `/api/reservations/user/{userId}` | - HTTP 200 OK<br>- Liste contenant uniquement les réservations de cet utilisateur | ✅ PASS | Test automatisé: `testCasNormal_UtilisateurVoitSeulementSesReservations()` |

### Validation Manuelle

- **Date de validation:** ___________
- **Personne en charge:** ___________
- **Résultat:** ☐ Tous les tests passent ☐ Échecs à corriger

---

## 🛠️ Configuration des Tests

### Prérequis

```bash
# Démarrer MongoDB pour les tests
docker-compose up -d mongo

# Ou utiliser MongoDB embarqué (Testcontainers)
```

### Lancer les Tests

```bash
# Tous les tests
mvn test

# Tests de réservation uniquement
mvn test -Dtest=ReservationIntegrationTest

# Tests admin uniquement
mvn test -Dtest=AdminReservationIntegrationTest

# Avec rapport détaillé
mvn test -Dtest=ReservationIntegrationTest -DforkCount=0
```

### Structure des Tests

```
src/test/java/com/eventease/backend/
├── reservation/
│   └── ReservationIntegrationTest.java (5 tests)
├── admin/
│   └── AdminReservationIntegrationTest.java (8 tests)
└── resources/
    └── application-test.properties
```

---

## 📈 Résumé des Tests

| User Story | Nombre de Tests | Tests Passés | Tests Échoués | Couverture |
|------------|-----------------|--------------|---------------|------------|
| US1: Réservation | 5 | 5 ✅ | 0 ❌ | 100% |
| US2: Admin | 8 | 7 ✅ | 1 ⚠️ (TODO) | 87.5% |
| **TOTAL** | **13** | **12 ✅** | **1 ⚠️** | **92.3%** |

### Actions Requises

1. ⚠️ **TC7 (US2):** Ajouter l'autorisation basée sur les rôles
   - Ajouter `@PreAuthorize("hasRole('ADMIN')")` dans `ReservationController`
   - Activer `@EnableGlobalMethodSecurity` dans `SecurityConfig`

2. 🔧 **Amélioration:** Gérer les erreurs de manière plus explicite
   - Créer des exceptions personnalisées (`ReservationNotFoundException`, `EventFullException`)
   - Retourner des codes HTTP appropriés (404 au lieu de 500)

3. 📝 **Documentation:** Ajouter des commentaires Swagger/OpenAPI

---

## 🧪 Explication du Code de Test

### Pattern AAA (Arrange-Act-Assert)

Tous les tests suivent ce pattern:

```java
@Test
void testExample() {
    // GIVEN (Arrange) - Préparation des données
    User user = createTestUser();
    Event event = createTestEvent();
    
    // WHEN (Act) - Action à tester
    MvcResult result = mockMvc.perform(post("/api/reservations")
        .content(requestBody))
        .andReturn();
    
    // THEN (Assert) - Vérification des résultats
    assertEquals(200, result.getResponse().getStatus());
    assertEquals(1, reservationRepo.count());
}
```

### Technologies Utilisées

- **JUnit 5** - Framework de test
- **Spring Boot Test** - Tests d'intégration
- **MockMvc** - Simulation des requêtes HTTP
- **@SpringBootTest** - Charge le contexte Spring complet
- **@AutoConfigureMockMvc** - Configure MockMvc automatiquement
- **@TestPropertySource** - Utilise `application-test.properties`
- **@BeforeEach / @AfterEach** - Setup et cleanup

### Gestion de la Concurrence (TC5)

```java
ExecutorService executor = Executors.newFixedThreadPool(2);
CountDownLatch latch = new CountDownLatch(2);

// Thread 1 et Thread 2 exécutent en parallèle
executor.submit(() -> { /* réservation */ });
executor.submit(() -> { /* réservation */ });

latch.await(); // Attendre la fin des 2 threads
```

---

## 📞 Contact

**Contributeurs:**  
- Équipe EventEase

**Liens:**  
- Jira: https://uha4point0.atlassian.net/jira/software/projects/EV/boards/576  
- Repository: [Lien GitHub/GitLab]

---

**Dernière mise à jour:** 2025-10-20  
**Version:** 1.0
