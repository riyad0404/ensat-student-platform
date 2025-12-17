import { User } from '../models/user.js';
import { Publication } from '../models/publication.js';
import sequelize from '../database.js';

describe('Test des relations entre User et Publication', () => {
  beforeAll(async () => {
    // Synchronisation des modèles (réinitialisation de la base de données)
    await sequelize.sync({ force: true });
  });

  it('doit créer un utilisateur et une publication associée', async () => {
    // Créer un utilisateur
    const user = await User.create({
      nom: 'TestUser',
      prenom: 'TestPrenom',
      email: 'testuser@example.com',
      password: 'password123',
      niveau: 'GINF1',
      secretCode: 1234,
    });

    // Créer une publication associée à l'utilisateur
    const publication = await Publication.create({
      contenu: 'Voici ma première publication!',
      typeContenu: 'TEXT',
      isAnonymat: false,
      iduser: user.iduser,  // Lier la publication à l'utilisateur
    });

    // Récupérer la publication avec l'utilisateur associé
    const publicationAvecUtilisateur = await Publication.findByPk(publication.idpub, {
      include: [User],  // Inclure l'utilisateur dans la recherche
    });

    // Vérifications
    expect(publicationAvecUtilisateur.User.nom).toBe('TestUser');
    expect(publicationAvecUtilisateur.User.prenom).toBe('TestPrenom');
    expect(publicationAvecUtilisateur.User.email).toBe('testuser@example.com');
    expect(publicationAvecUtilisateur.contenu).toBe('Voici ma première publication!');
  });

  afterAll(async () => {
    // Fermer la connexion à la base de données
    await sequelize.close();
  });
});
