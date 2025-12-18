import sequelize from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB OK');
    
    // Lit automatiquement tous les fichiers de migration
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Trie par ordre alphabétique (timestamp)
    
    console.log(`📁 ${files.length} migrations trouvées`);
    
    for (const file of files) {
      const migrationPath = path.join(migrationsDir, file);
      const { up } = await import(`file://${migrationPath}`);
      await up(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`✅ ${file} terminée`);
    }
    
    console.log('🎉 Toutes les migrations terminées !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
}

runMigrations();