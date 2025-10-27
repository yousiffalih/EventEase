# o8 - Tests Automatiques - SABTI Yousif

## User Story

### Rappel de la user story

**En tant que :** Organisateur/Admin

**Je voudrais :** Accepter ou refuser les demandes de réservation

**Afin de :** Gérer l'accès des utilisateurs aux événements

### Critères d'acceptation
1. L'admin doit pouvoir consulter la liste des demandes
2. Chaque demande contient : nom utilisateur, événement, statut
3. L'admin peut accepter une réservation → confirmation à l'utilisateur
4. L'admin peut refuser une réservation → message de refus
5. Le statut est mis à jour en temps réel
6. Les utilisateurs ne voient que leurs réservations

---

## Prérequis

### Jeu de tests initial à injecter

**Utilisateurs :**
- **Admin :** 
  - Username: `admin`
  - Email: `admin@eventease.com`
  - Password: `admin123`
  - Role: `ADMIN`

- **Utilisateur normal :**
  - Username: `normaluser`
  - Email: `user@eventease.com`
  - Password: `password123`
  - Role: `USER`

- **Utilisateur 2 (pour tests multi-utilisateurs) :**
  - Username: `user2`
  - Email: `user2@eventease.com`
  - Password: `pass123`
  - Role: `USER`

**Événement :**
- Title: `Tech Conference 2025`
- Description: `Annual tech conference`
- Date: `2025-12-15T09:00:00Z`
- Location: `Berlin`
- Capacity: `100`
- ReservedCount: `1`
- Status: `ACTIVE`

**Réservation initiale :**
- EventId: `{testEvent.id}`
- UserId: `{normalUser.id}`
- Status: `PENDING`

### Lancement de l'application

L'application utilise **Testcontainers** avec MongoDB dans Docker. Le conteneur démarre automatiquement lors de l'exécution des tests.

**Commande de lancement des tests :**
```bash
mvn test -Dtest=AdminReservationIntegrationTest
```

---

## Descriptions des cas de tests

### Phase 1 : Appel à l'API
Chaque test contient :
- Description des paramètres en entrée (Token JWT et autres variables)
- Résultat en sortie (format JSON/DTO)
- Code de retour HTTP

### Phase 2 : Validation
Vérification programmatique des résultats attendus via :
- Requêtes directes au Repository (ORM)
- Assertions sur l'état de la base de données

---

## Tableau des Tests

| Scenarii | Jeu de test | Résultats attendus | API utilisées pour la validation | Remarques / état actuel |
|----------|-------------|-------------------|----------------------------------|------------------------|
| **TC1 - Cas nominal (200) : Admin accepte une réservation** | **Entrée :**<br>- Endpoint: `POST /api/reservations/{id}/approve`<br>- Header: `Authorization: Bearer {adminToken}`<br>- Réservation existante avec status `PENDING` | **Sortie :**<br>- Code: `200 OK`<br>- JSON: `{"status": "APPROVED", "id": "{reservationId}"}`<br><br>**Validation BDD :**<br>- Status de la réservation = `APPROVED` | `ReservationRepository.findById()` | ✅ **PASS** - Test fonctionnel |
| **TC2 - Cas nominal (200) : Admin refuse une réservation avec raison** | **Entrée :**<br>- Endpoint: `POST /api/reservations/{id}/reject`<br>- Header: `Authorization: Bearer {adminToken}`<br>- Body: `{"reason": "Événement annulé"}`<br>- Réservation existante avec status `PENDING` | **Sortie :**<br>- Code: `200 OK`<br>- JSON: `{"status": "REFUSED", "reason": "Événement annulé"}`<br><br>**Validation BDD :**<br>- Status = `REFUSED`<br>- Reason = `Événement annulé` | `ReservationRepository.findById()` | ✅ **PASS** - Test fonctionnel |
| **TC3 - Cas nominal (200) : Admin se connecte avec identifiants corrects** | **Entrée :**<br>- Endpoint: `POST /api/users/login`<br>- Body: `{"email": "admin@eventease.com", "password": "admin123"}` | **Sortie :**<br>- Code: `200 OK`<br>- JSON: `{"token": "{jwt}", "role": "ADMIN", "userId": "{adminId}"}`<br><br>**Validation :**<br>- Token JWT existe<br>- Role = `ADMIN` | Validation directe de la réponse JSON | ✅ **PASS** - Test fonctionnel |
| **TC4 - Cas d'erreur (401) : Admin avec mot de passe incorrect** | **Entrée :**<br>- Endpoint: `POST /api/users/login`<br>- Body: `{"email": "admin@eventease.com", "password": "wrongpassword"}` | **Sortie :**<br>- Code: `401 Unauthorized`<br>- Message: `"Invalid credentials"`<br><br>**Validation :**<br>- Aucun token généré<br>- Message d'erreur présent | Validation directe de la réponse | ✅ **PASS** - Test fonctionnel |
| **TC5 - Cas nominal (200) : Admin consulte toutes les réservations** | **Entrée :**<br>- Endpoint: `GET /api/reservations/admin/all`<br>- Header: `Authorization: Bearer {adminToken}`<br>- BDD contient 2 réservations de 2 utilisateurs différents | **Sortie :**<br>- Code: `200 OK`<br>- JSON: Array de 2 réservations<br>- Chaque réservation contient: `username`, `eventId`, `status`<br><br>**Validation :**<br>- Taille du tableau = 2<br>- Champs `username` présents | Validation directe de la réponse JSON | ✅ **PASS** - Test fonctionnel |
| **TC7 - Cas limite (403 attendu, 200 actuel) : Utilisateur normal tente d'accepter une réservation** | **Entrée :**<br>- Endpoint: `POST /api/reservations/{id}/approve`<br>- Header: `Authorization: Bearer {userToken}` (token USER, pas ADMIN)<br>- Réservation existante | **Sortie attendue :**<br>- Code: `403 Forbidden`<br><br>**Sortie actuelle :**<br>- Code: `200 OK` (pas de contrôle d'autorisation) | N/A | ⚠️ **TODO** - Nécessite ajout de `@PreAuthorize("hasRole('ADMIN')")` dans le contrôleur |
| **TC8 - Cas nominal (200) : Utilisateur ne voit que ses propres réservations** | **Entrée :**<br>- Endpoint: `GET /api/reservations/user/{userId}`<br>- Header: `Authorization: Bearer {userToken}`<br>- BDD contient 2 réservations : 1 pour normalUser, 1 pour user2 | **Sortie :**<br>- Code: `200 OK`<br>- JSON: Array de 1 réservation<br>- `userId` = `{normalUser.id}`<br><br>**Validation :**<br>- Taille du tableau = 1<br>- UserId correspond à l'utilisateur connecté | Validation directe de la réponse JSON | ✅ **PASS** - Test fonctionnel |

---

## Cas de tests aux limites

| Scenario | Description | Statut |
|----------|-------------|--------|
| **Liste vide** | Admin consulte les réservations quand aucune n'existe | ⚠️ **À IMPLÉMENTER** |
| **Grande volumétrie** | Admin consulte 100+ réservations | ⚠️ **À IMPLÉMENTER** |
| **Réservation inexistante** | Admin tente d'approuver une réservation avec ID invalide | ⚠️ **À IMPLÉMENTER** |
| **Token expiré** | Requête avec un token JWT expiré | ⚠️ **À IMPLÉMENTER** |
| **Token invalide** | Requête avec un token JWT malformé | ⚠️ **À IMPLÉMENTER** |
| **Réservation déjà approuvée** | Admin tente d'approuver une réservation déjà `APPROVED` | ⚠️ **À IMPLÉMENTER** |
| **Capacité événement atteinte** | Accepter une réservation quand l'événement est complet | ⚠️ **À IMPLÉMENTER** |

---

## Autres codes de retour à tester

| Code HTTP | Scenario | Statut implémentation |
|-----------|----------|----------------------|
| **200 OK** | Opérations réussies (approve, reject, login, list) | ✅ Implémenté (TC1, TC2, TC3, TC5, TC8) |
| **401 Unauthorized** | Identifiants incorrects | ✅ Implémenté (TC4) |
| **403 Forbidden** | Utilisateur sans permissions suffisantes | ⚠️ À implémenter (TC7 note le besoin) |
| **404 Not Found** | Réservation/Événement inexistant | ⚠️ À implémenter |
| **400 Bad Request** | Données invalides (ex: raison de refus vide) | ⚠️ À implémenter |
| **409 Conflict** | Conflit d'état (ex: réservation déjà traitée) | ⚠️ À implémenter |
| **500 Internal Server Error** | Erreur serveur | ⚠️ À implémenter |

---

## Technologies utilisées

- **Framework de test :** JUnit 5
- **Mock HTTP :** Spring MockMvc
- **Base de données de test :** MongoDB via Testcontainers (Docker)
- **Sérialisation JSON :** Jackson ObjectMapper
- **Sécurité :** JWT (JwtUtil)
- **Assertions :** Hamcrest Matchers + JUnit Assertions

---

## Notes importantes

1. **Testcontainers :** Les tests utilisent un conteneur Docker MongoDB qui démarre automatiquement. Aucune configuration manuelle nécessaire.

2. **Isolation des tests :** Chaque test utilise `@BeforeEach` et `@AfterEach` pour garantir un état propre de la base de données.

3. **Ordre d'exécution :** Les tests sont ordonnés avec `@Order` pour faciliter le débogage.

4. **Sécurité à améliorer :** Le test TC7 révèle que l'autorisation basée sur les rôles n'est pas encore implémentée. Il faut ajouter `@PreAuthorize("hasRole('ADMIN')")` sur les endpoints admin.

5. **Couverture actuelle :** 8 tests implémentés couvrant les cas nominaux et quelques cas limites. Des tests supplémentaires sont nécessaires pour une couverture complète.
