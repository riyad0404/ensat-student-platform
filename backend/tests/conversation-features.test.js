import request from "supertest";
import app from "../src/app.js";

/**
 * Tests pour les nouvelles fonctionnalités de conversations
 * À ajouter à votre suite de tests Jest
 */

describe('Conversation Features - Hide, Join, Unread Count', () => {
  let userId1;
  let userId2;
  let conversationId;
  let user1Cookies;
  let user2Cookies;
  let nonMemberCookies;

  beforeAll(async () => {
    // 1. Create users
    const user1 = {
      nom: "User1",
      prenom: "Test",
      email: "user1@example.com",
      password: "Password123!",
      niveau: "3A",
      secretCode: 1111,
    };
    const user2 = {
      nom: "User2",
      prenom: "Test",
      email: "user2@example.com",
      password: "Password123!",
      niveau: "3A",
      secretCode: 2222,
    };
    const nonMember = {
      nom: "NonMember",
      prenom: "Test",
      email: "nonmember@example.com",
      password: "Password123!",
      niveau: "3A",
      secretCode: 3333,
    };

    // Signup users
    await request(app).post("/api/auth/signup").send(user1);
    await request(app).post("/api/auth/signup").send(user2);
    await request(app).post("/api/auth/signup").send(nonMember);

    // Login users and get cookies
    const login1 = await request(app).post("/api/auth/login").send({ email: user1.email, password: user1.password });
    const login2 = await request(app).post("/api/auth/login").send({ email: user2.email, password: user2.password });
    const loginNonMember = await request(app).post("/api/auth/login").send({ email: nonMember.email, password: nonMember.password });

    user1Cookies = login1.headers["set-cookie"];
    user2Cookies = login2.headers["set-cookie"];
    nonMemberCookies = loginNonMember.headers["set-cookie"];

    userId1 = login1.body.user ? login1.body.user.iduser : undefined;
    userId2 = login2.body.user ? login2.body.user.iduser : undefined;

    // 2. Create a direct conversation between user1 and user2
    const convRes = await request(app)
      .post("/api/conversations/direct")
      .set("Cookie", user1Cookies)
      .send({ memberIds: [userId1, userId2] });

    console.log('Conversation creation response:', convRes.status, convRes.body);

    conversationId = convRes.body.idconversation;
  });

  describe('POST /api/conversations/:id/hide', () => {
    test('should hide a conversation for the current user', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/hide`)
        .set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Conversation hidden successfully');

      // Vérifier que la conversation n'apparaît plus dans la liste
      const listResponse = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

      const conversationInList = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversationInList).toBeUndefined();
    });

    test('should not affect the other user', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Cookie', user2Cookies);

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
        .set('Cookie', user1Cookies);

      // Unhide it
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/unhide`)
        .set('Cookie', user1Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Conversation unhidden successfully');

      // Vérifier que la conversation réapparaît dans la liste
      const listResponse = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

      const conversationInList = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversationInList).toBeDefined();
    });

    test('should fail if conversation is not hidden', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/unhide`)
        .set('Cookie', user1Cookies);

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
        .set('Cookie', user1Cookies)
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
        .set('Cookie', user2Cookies);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Joined conversation successfully');
    });

    test('should not allow joining a DIRECT conversation', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/join`)
        .set('Cookie', user2Cookies);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Can only join GROUP conversations');
    });

    test('should return 200 if already a member', async () => {
      // Rejoindre une première fois
      await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Cookie', user2Cookies);

      // Essayer de rejoindre à nouveau
      const response = await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Cookie', user2Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Already a member of this conversation');
    });

    test('should allow re-joining after leaving', async () => {
      // Rejoindre
      await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Cookie', user2Cookies);

      // Quitter
      await request(app)
        .post(`/api/conversations/${groupConversationId}/leave`)
        .set('Cookie', user2Cookies);

      // Rejoindre
      const response = await request(app)
        .post(`/api/conversations/${groupConversationId}/join`)
        .set('Cookie', user2Cookies);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Rejoined conversation successfully');
    });
  });

  describe('GET /api/conversations with unreadCount', () => {
    test('should include unreadCount in response', async () => {
      const response = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

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
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post(`/api/conversations/${conversationId}/messages`)
          .set('Cookie', user2Cookies)
          .send({ content: `Message ${i + 1}` });
      }

      // User 1 ne doit pas avoir consulté les messages
      const response = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

      const conversation = response.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBe(3);
    });

    test('unreadCount should be 0 after reading messages', async () => {
      // Envoyer un message
      await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set('Cookie', user2Cookies)
        .send({ content: 'Test message' });

      // Consulter les messages (cela met à jour lastReadAt)
      await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Cookie', user1Cookies);

      // Vérifier que unreadCount est 0
      const response = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

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
        .set('Cookie', user2Cookies)
        .send({ content: 'Test message' });

      // Avant de consulter: unreadCount devrait être > 0
      let listResponse = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

      let conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      const unreadCountBefore = conversation.unreadCount;
      expect(unreadCountBefore).toBeGreaterThan(0);

      // Consulter les messages
      const messagesResponse = await request(app)
        .get(`/api/conversations/${conversationId}/messages`)
        .set('Cookie', user1Cookies);

      expect(messagesResponse.status).toBe(200);

      // Après consultation: unreadCount devrait être 0
      listResponse = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

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
          .set('Cookie', user2Cookies)
          .send({ content: `Message ${i + 1}` });
      }

      // Vérifier que unreadCount > 0
      let listResponse = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

      let conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBeGreaterThan(0);

      // Marquer comme lu explicitement
      const readResponse = await request(app)
        .post(`/api/conversations/${conversationId}/read`)
        .set('Cookie', user1Cookies);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.message).toBe('Conversation marked as read');

      // Vérifier que unreadCount = 0
      listResponse = await request(app)
        .get('/api/conversations')
        .set('Cookie', user1Cookies);

      conversation = listResponse.body.find(
        c => c.idconversation === conversationId
      );
      expect(conversation.unreadCount).toBe(0);
    });

    test('should fail if user is not a member', async () => {
      const response = await request(app)
        .post(`/api/conversations/${conversationId}/read`)
        .set('Cookie', nonMemberCookies);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Not a member of this conversation');
    });
  });
});
