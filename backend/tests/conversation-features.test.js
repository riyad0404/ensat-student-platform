/**
 * Tests pour les nouvelles fonctionnalités de conversations
 * À ajouter à votre suite de tests Jest
 */

describe('Conversation Features - Hide, Join, Unread Count', () => {
  let authToken;
  let userId1;
  let userId2;
  let conversationId;

  beforeAll(async () => {
    // Setup: créer 2 utilisateurs et une conversation
    // Récupérer les tokens d'authentification
  });

  describe('POST /api/conversations/:id/hide', () => {
    test('should hide a conversation for the current user', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/hide`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Conversation hidden successfully');

      // Vérifier que la conversation n'apparaît plus dans la liste
      const listResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      const conversationInList = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversationInList).toBeUndefined();
    });

    test('should not affect the other user', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${otherUserToken}`);

      const conversationInList = response.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversationInList).toBeDefined();
    });
  });

  describe('POST /api/conversations/:id/unhide', () => {
    test('should unhide a hidden conversation', async () => {
      // Récréer une conversation cachée
      await request(app)
        .post(`/api/conversations/${conversationId}/hide`)
        .set('Authorization', `Bearer ${authToken}`);

      // Unhide it
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/unhide`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Conversation unhidden successfully');

      // Vérifier que la conversation réapparaît dans la liste
      const listResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      const conversationInList = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversationInList).toBeDefined();
    });

    test('should fail if conversation is not hidden', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/unhide`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Conversation is not hidden');
    });
  });

  describe('POST /api/conversations/:id/join', () => {
    let groupConversationId;

    beforeEach(async () => {
      // Créer une conversation de groupe
      const createResponse = await request(app)
        .post('/api/conversations/group')
        .set('Authorization', `Bearer ${userId1Token}`)
        .send({
          name: 'Test Group',
          description: 'Test Group Description',
          memberIds: [userId1],
        });

      groupConversationId = createResponse.body.idconversation;
    });

    test('should allow a user to join a GROUP conversation', async () => {
      const response = await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Authorization', `Bearer ${userId2Token}`);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Joined conversation successfully');
    });

    test('should not allow joining a DIRECT conversation', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/join`)
        .set('Authorization', `Bearer ${userId2Token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Can only join GROUP conversations');
    });

    test('should return 200 if already a member', async () => {
      // Rejoindre une première fois
      await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Authorization', `Bearer ${userId2Token}`);

      // Essayer de rejoindre à nouveau
      const response = await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Authorization', `Bearer ${userId2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Already a member of this conversation');
    });

    test('should allow re-joining after leaving', async () => {
      // Rejoindre
      await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Authorization', `Bearer ${userId2Token}`);

      // Quitter
      await request(app)
        .post(`/api/conversations/${groupConversationId}/leave`)
        .set('Authorization', `Bearer ${userId2Token}`);

      // Rejoindre
      const response = await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Authorization', `Bearer ${userId2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Rejoined conversation successfully');
    });
  });

  describe('GET /api/conversations with unreadCount', () => {
    test('should include unreadCount in response', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const conversation = response.body[0];
        expect(conversation).toHaveProperty('unreadCount');
        expect(typeof conversation.unreadCount).toBe('number');
      }
    });

    test('should correctly count unread messages', async () => {
      // Envoyer 3 messages dans la conversation
      const user2Token = otherUserToken;

      for (let i = 0; i < 3; i++) {
        await request(app)
          .post(`/api/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${user2Token}`)
          .send({ content: `Message ${i + 1}` });
      }

      // User 1 ne doit pas avoir consulté les messages
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      const conversation = response.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBe(3);
    });

    test('unreadCount should be 0 after reading messages', async () => {
      // Envoyer un message
      await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ content: 'Test message' });

      // Consulter les messages (cela met à jour lastReadAt)
      await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`);

      // Vérifier que unreadCount est 0
      const response = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      const conversation = response.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBe(0);
    });
  });

  describe('GET /api/conversations/:id/messages - Auto mark as read', () => {
    test('should automatically update lastReadAt when fetching messages', async () => {
      // Envoyer un message d'un autre utilisateur
      await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ content: 'Test message' });

      // Avant de consulter: unreadCount devrait être > 0
      let listResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      let conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      const unreadCountBefore = conversation.unreadCount;
      expect(unreadCountBefore).toBeGreaterThan(0);

      // Consulter les messages
      const messagesResponse = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(messagesResponse.status).toBe(200);

      // Après consultation: unreadCount devrait être 0
      listResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBe(0);
    });
  });

  describe('POST /api/conversations/:id/read - Explicit mark as read', () => {
    test('should mark conversation as read', async () => {
      // Envoyer des messages sans les consulter
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post(`/api/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send({ content: `Message ${i + 1}` });
      }

      // Vérifier que unreadCount > 0
      let listResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      let conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBeGreaterThan(0);

      // Marquer comme lu explicitement
      const readResponse = await request(app)
        .post(`/api/conversations/${conversationId}/read`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.message).toBe('Conversation marked as read');

      // Vérifier que unreadCount = 0
      listResponse = await request(app)
        .get('/api/conversations')
        .set('Authorization', `Bearer ${authToken}`);

      conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBe(0);
    });

    test('should fail if user is not a member', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/read`)
        .set('Authorization', `Bearer ${nonMemberToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Not a member of this conversation');
    });
  });
});
