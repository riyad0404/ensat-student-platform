# Guide d'utilisation - Nouvelles fonctionnalités de conversations

## 📋 Vue d'ensemble

Quatre nouvelles fonctionnalités ont été implémentées pour améliorer la gestion des conversations :

1. ✅ Masquer une conversation (soft delete)
2. ✅ Rejoindre une conversation de groupe
3. ✅ Comptage des messages non lus
4. ✅ Gestion automatique de la lecture

---

## 🚀 Installation et configuration

### 1. Appliquer la migration

Avant de déployer, exécutez la migration pour ajouter la colonne `lastReadAt` :

```bash
cd backend
npm run migrate
```

ou

```bash
npx sequelize-cli db:migrate
```

### 2. Redémarrer l'application

```bash
npm start
```

---

## 📡 Endpoints API

### 1. Masquer une conversation

**Endpoint:** `POST /api/conversations/:id/hide`

**Description:** Cache une conversation de la liste de l'utilisateur sans la supprimer pour l'autre personne.

**En-têtes:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse (200 OK):**
```json
{ "message": "Conversation hidden successfully" }
```

**Exemple cURL:**
```bash
curl -X POST http://localhost:5000/api/conversations/1/hide \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Exemple JavaScript:**
```javascript
const response = await fetch('/api/conversations/1/hide', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.message); // "Conversation hidden successfully"
```

---

### 2. Réafficher une conversation cachée

**Endpoint:** `POST /api/conversations/:id/unhide`

**Description:** Réaffiche une conversation qui avait été masquée.

**En-têtes:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse (200 OK):**
```json
{ "message": "Conversation unhidden successfully" }
```

**Codes d'erreur:**
- `400`: La conversation n'est pas cachée
- `403`: L'utilisateur n'est pas membre de la conversation

**Exemple JavaScript:**
```javascript
const response = await fetch('/api/conversations/1/unhide', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

### 3. Rejoindre une conversation

**Endpoint:** `POST /api/conversations/:id/join`

**Description:** Permet à un utilisateur authentifié de rejoindre une conversation de groupe publique.

**En-têtes:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse (201 Created ou 200 OK):**
```json
{ "message": "Joined conversation successfully" }
```

**Codes d'erreur:**
- `404`: Conversation introuvable
- `400`: Impossible de rejoindre une conversation DIRECT

**Exemple JavaScript:**
```javascript
const response = await fetch('/api/conversations/5/join', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

if (response.ok) {
  console.log('Vous avez rejoint la conversation');
}
```

---

### 4. Récupérer les conversations avec comptage des non-lus

**Endpoint:** `GET /api/conversations`

**Description:** Liste les conversations actives avec un champ `unreadCount` supplémentaire.

**En-têtes:**
```
Authorization: Bearer {token}
```

**Réponse (200 OK):**
```json
[
  {
    "idconversation": 1,
    "type": "DIRECT",
    "title": "Jean Dupont",
    "description": null,
    "createdBy": 2,
    "members": [
      {
        "iduser": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "photo": null,
        "niveau": "3eme",
        "role": "MEMBER",
        "joinedAt": "2026-01-15T10:00:00Z",
        "leftAt": null
      }
    ],
    "otherUser": {
      "iduser": 2,
      "nom": "Dupont",
      "prenom": "Jean",
      "photo": null,
      "niveau": "3eme"
    },
    "lastMessage": {
      "idmessage": 10,
      "content": "Dernier message",
      "sentAt": "2026-01-16T15:30:00Z",
      "senderId": 2
    },
    "unreadCount": 3,
    "updatedAt": "2026-01-16T15:30:00Z"
  }
]
```

**Exemple JavaScript:**
```javascript
const response = await fetch('/api/conversations', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const conversations = await response.json();

conversations.forEach(conv => {
  console.log(`${conv.title}`);
  console.log(`Messages non lus: ${conv.unreadCount}`);
  
  if (conv.unreadCount > 0) {
    // Afficher un badge ou une notification
    console.log(`🔔 ${conv.unreadCount} nouveau message(s)`);
  }
});
```

---

### 5. Marquer une conversation comme lue

**Endpoint:** `POST /api/conversations/:id/read`

**Description:** Marque explicitement une conversation comme lue en mettant à jour `lastReadAt`.

**En-têtes:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse (200 OK):**
```json
{ "message": "Conversation marked as read" }
```

**Codes d'erreur:**
- `403`: L'utilisateur n'est pas membre de la conversation

**Exemple JavaScript:**
```javascript
const response = await fetch('/api/conversations/1/read', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

if (response.ok) {
  console.log('Conversation marquée comme lue');
}
```

---

### 6. Consulter les messages (met à jour automatiquement `lastReadAt`)

**Endpoint:** `GET /api/conversations/:id/messages`

**Description:** Récupère les messages d'une conversation et met automatiquement à jour `lastReadAt`.

**En-têtes:**
```
Authorization: Bearer {token}
```

**Réponse (200 OK):**
```json
[
  {
    "idmessage": 1,
    "content": "Bonjour!",
    "sentAt": "2026-01-15T10:00:00Z",
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

**Exemple JavaScript:**
```javascript
const response = await fetch('/api/conversations/1/messages', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const messages = await response.json();

// Les messages sont automatiquement marqués comme lus!
messages.forEach(msg => {
  console.log(`${msg.sender.prenom}: ${msg.content}`);
});
```

---

## 🔍 Cas d'utilisation

### Cas 1: Afficher un badge de messages non lus

```javascript
async function displayConversationsList() {
  const response = await fetch('/api/conversations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const conversations = await response.json();
  
  conversations.forEach(conv => {
    const element = document.querySelector(`[data-conv-id="${conv.idconversation}"]`);
    
    if (conv.unreadCount > 0) {
      element.classList.add('has-unread');
      element.querySelector('.badge').textContent = conv.unreadCount;
    } else {
      element.classList.remove('has-unread');
    }
  });
}
```

### Cas 2: Masquer une conversation au clic

```javascript
async function hideConversation(conversationId) {
  const response = await fetch(`/api/conversations/${conversationId}/hide`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    // Retirer la conversation de la liste UI
    document.querySelector(`[data-conv-id="${conversationId}"]`).remove();
    
    // Optionnel: Afficher un message de confirmation
    showToast('Conversation masquée');
  }
}
```

### Cas 3: Rejoindre une conversation de groupe via un lien

```javascript
async function joinGroupViaLink(conversationId) {
  const response = await fetch(`/api/conversations/${conversationId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    // Rediriger vers la conversation
    window.location.href = `/conversations/${conversationId}`;
  } else if (response.status === 400) {
    showError('Cette conversation est privée');
  }
}
```

### Cas 4: Auto-marquer comme lus

```javascript
async function openConversation(conversationId) {
  // Cette requête met automatiquement à jour lastReadAt
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const messages = await response.json();
  
  // L'utilisateur est marqué comme ayant lu les messages
  // unreadCount sera 0 pour cette conversation
  renderMessages(messages);
}
```

---

## 🛡️ Sécurité et permissions

| Opération | Restriction | Notes |
|-----------|------------|-------|
| Hide | Membre actif | Soft delete uniquement |
| Unhide | Propriétaire de la membership | Peut réafficher sa propre membership |
| Join | Conversation GROUP | Pas de vérification de permission |
| Read | Membre actif | Met à jour le timestamp personnel |
| Get messages | Membre actif | Met à jour automatiquement lastReadAt |

---

## 📊 Modèle de données

### Colonne `lastReadAt` dans `conversation_members`

```sql
ALTER TABLE conversation_members
ADD COLUMN lastReadAt DATE NULL DEFAULT NULL;
```

**Propriétés:**
- Type: DATE
- Nullable: OUI
- Valeur par défaut: NULL
- Mise à jour automatique: OUI (via `GET /messages`)

---

## ⚠️ Considérations de performance

1. **Calcul de `unreadCount`**: Cette opération compte les messages pour chaque conversation. Avec beaucoup de conversations/messages, cela peut être lent.

   **Solution:** Envisager un cache Redis ou une colonne dénormalisée.

2. **Requêtes N+1**: Chaque conversation effectue une requête COUNT distinct.

   **Solution:** Utiliser une requête agrégée si possible.

3. **Mise à jour fréquente de `lastReadAt`**: À chaque consultation de messages, un UPDATE est effectué.

   **Solution:** Acceptable pour la plupart des cas d'usage, mais monitorer si nécessaire.

---

## 🐛 Débogage

### Vérifier que la migration a été appliquée

```bash
# Dans psql ou MySQL
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='conversation_members' AND COLUMN_NAME='lastReadAt';
```

### Logs utiles

```javascript
// Dans conversationController.js
console.log('hideConversation called for user:', myUserId);
console.log('joinConversation called for conversation:', idconversation);
console.log('unreadCount for conversation', idconversation, ':', unreadCount);
```

---

## 📝 Checklist de déploiement

- [ ] Migration `20260116-add-lastReadAt-to-conversation-members.js` appliquée
- [ ] Contrôleur mis à jour avec les 4 nouvelles fonctions
- [ ] Routes mises à jour dans `conversationRoutes.js`
- [ ] Modèle `conversationMember.js` mis à jour
- [ ] Tests unitaires passent
- [ ] Documentation mise à jour
- [ ] Code revu en pair

---

## 🔗 Ressources

- [Documentation des modèles](../src/models/)
- [Documentation des routes](../src/routes/)
- [Documentation du contrôleur](../src/controllers/)
- [Tests](../tests/conversation-features.test.js)
