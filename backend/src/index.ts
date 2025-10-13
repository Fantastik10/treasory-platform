// backend/src/index.ts
import 'reflect-metadata'; // DOIT ÊTRE TOUJOURS EN PREMIER
import { Bureau } from './models/Bureau';
import { Donor } from './models/Donor';
import { EspaceTravail } from './models/EspaceTravail';
import { Reminder } from './models/Reminder';
import { User } from './models/User';
import { server } from './app';
import { connectDatabase } from './config/database';
import { SyncScheduler } from './jobs/syncScheduler';


const PORT = process.env.PORT || 3001;

// Connexion à la base de données
connectDatabase()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    // Démarrer les jobs planifiés
    SyncScheduler.start();
    
    // Démarrage du serveur
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API available at http://localhost:${PORT}/api`);
      console.log(`🔌 WebSockets enabled`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });