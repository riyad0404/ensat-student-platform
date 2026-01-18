# Nouvelles Fonctionnalités - Conversations

## Résumé des changements

Trois nouvelles fonctionnalités ont été ajoutées à l'API des conversations pour améliorer la gestion des messages.

---

## 1. **Masquer une conversation** - `POST /api/conversations/:id/hide`

### Description
Permet à un utilisateur de masquer une conversation privée de sa liste sans la supprimer pour l'autre personne. C'est un "soft delete" qui utilise la colonne `leftAt` existante dans la table `conversation_members`.

### Requête
```bash
POST /api/conversations/1/hide
# Authentification via cookie HTTP-only accessToken (voir plus bas)
```

### Réponse (200 OK)
```json
{ "message": "Conversation hidden successfully" }
```

### Détails
- La conversation est masquée en mettant à jour `leftAt` à la date actuelle
- La conversation n'apparaîtra plus dans la liste de l'utilisateur
- L'autre personne dans la conversation n'est pas affectée
- **Nouveau**: Route `POST /api/conversations/:id/unhide` pour réafficher une conversation masquée

---

## 2. **Rejoindre une conversation** - `POST /api/conversations/:id/join`

### Description
Permet à un utilisateur authentifié de rejoindre une conversation de groupe sans droits d'administrateur.

### Requête
```bash
POST /api/conversations/5/join
# Authentification via cookie HTTP-only accessToken (voir plus bas)
```

### Réponse (201 Created ou 200 OK)
```json
{ "message": "Joined conversation successfully" }
```

### Détails
- Uniquement disponible pour les conversations **GROUP**
- Si l'utilisateur était déjà membre mais avait quitté, il est rétabli
- Si l'utilisateur est déjà membre, un message de confirmation est renvoyé
- Crée automatiquement une nouvelle adhésion avec le rôle 'MEMBER'

---

## 3. **Comptage des messages non lus** - `unreadCount` dans `GET /api/conversations`

### Description
Ajoute un champ `unreadCount` à la réponse de `GET /api/conversations` qui indique le nombre de messages non lus dans chaque conversation.

### Requête
```bash
GET /api/conversations
# Authentification via cookie HTTP-only accessToken (voir plus bas)
```

### Réponse (200 OK)
```json
[
  {
    "idconversation": 1,
    "type": "DIRECT",
    "title": "Jean Dupont",
    "description": null,
    "createdBy": 2,
    "members": [...],
    "otherUser": {...},
    "lastMessage": {...},
    "unreadCount": 3,
    "updatedAt": "2026-01-16T10:30:00Z"
  }
]
```

### Détails
- Le champ `unreadCount` contient le nombre de messages envoyés après `lastReadAt`
- Si `lastReadAt` est null, tous les messages sont comptabilisés comme non lus
- La valeur est calculée dynamiquement à chaque requête

---

## 4. **Gestion automatique de la lecture** - `GET /api/conversations/:id/messages`

### Description
La route `GET /api/conversations/:id/messages` met à jour automatiquement le timestamp `lastReadAt` pour l'utilisateur actuel lorsqu'il consulte les messages.

### Requête
```bash
GET /api/conversations/1/messages
# Authentification via cookie HTTP-only accessToken (voir plus bas)
```

### Réponse (200 OK)
```json
[
  {
    "idmessage": 1,
    "content": "Bonjour!",
    "sentAt": "2026-01-16T10:15:00Z",
    "senderId": 2,
    "sender": {
      "iduser": 2,
      "nom": "Dupont",
      "prenom": "Jean",
      "photo": null
    }
  }
]
```

### Comportement
- `lastReadAt` est automatiquement défini à l'heure actuelle
- Cela permet de tracker précisément quand un utilisateur a consulté une conversation
- Les messages sont toujours listés dans l'ordre chronologique

---

## 5. **Marquer comme lu explicitement** - `POST /api/conversations/:id/read`

### Description
Route alternative pour marquer manuellement une conversation comme lue, si nécessaire.

### Requête
```bash
POST /api/conversations/1/read
# Authentification via cookie HTTP-only accessToken (voir plus bas)
```

### Réponse (200 OK)
```json
{ "message": "Conversation marked as read" }
```

### Détails
- Utile si vous préférez un contrôle manuel du timestamp `lastReadAt`
- Met à jour `lastReadAt` à l'heure actuelle pour la conversation

---

## Changements dans la base de données

### Migration créée
- Fichier: `20260116-add-lastReadAt-to-conversation-members.js`
- Action: Ajoute une colonne `lastReadAt` (DATE, nullable) à la table `conversation_members`

### Modèle mis à jour
- **conversationMember.js**: Nouveau champ `lastReadAt` de type DATE

---

## Ordre des routes dans conversationRoutes.js

Pour éviter les conflits de routing, les routes sont ordonnées comme suit:
1. Opérations destructives (DELETE)
2. Routes POST spécifiques (transfer, hide, unhide, join, read)
3. Routes GET (list et detail)
4. Routes POST de création
5. Routes GET détail avec ID
6. Opérations sur les messages

L'ordre est crucial car Express évalue les routes de haut en bas.

---

## Utilisation côté frontend

### Exemple d'intégration

```javascript
// Récupérer les conversations avec le compteur de non-lus
const response = await fetch('/api/conversations', {
  credentials: 'include'
});
const conversations = await response.json();

// Afficher le badge de non-lus
conversations.forEach(conv => {
  console.log(`${conv.title}: ${conv.unreadCount} nouveaux messages`);
});

// Rejoindre une conversation
await fetch('/api/conversations/5/join', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
});

// Consulter les messages (marque automatiquement comme lus)
const messages = await fetch('/api/conversations/1/messages', {
  credentials: 'include'
});

// Masquer une conversation
await fetch('/api/conversations/1/hide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'
});
```

---

## Notes importantes

1. **Authentification** :
  - L'API utilise un cookie HTTP-only nommé `accessToken` pour l'authentification. Aucun header Authorization n'est requis.
  - Pour les requêtes fetch côté frontend, ajoutez `credentials: 'include'`.
  - Pour cURL, utilisez l'option `--cookie "accessToken=VOTRE_TOKEN"`.

2. **Performances**: Le calcul de `unreadCount` pour chaque conversation peut être lent si vous avez beaucoup de messages. Envisagez de mettre en cache si nécessaire.

3. **Timestamps**: `lastReadAt` est défini automatiquement quand on appelle `GET /api/conversations/:id/messages`, mais la route `POST /api/conversations/:id/read` peut être utilisée pour un contrôle manuel.

4. **Soft delete**: L'utilisation de `leftAt` pour "masquer" une conversation signifie que la logique de `requireMembership()` fonctionne toujours correctement.

5. **Migration**: N'oubliez pas d'exécuter la migration pour ajouter la colonne `lastReadAt` avant de déployer le code.
