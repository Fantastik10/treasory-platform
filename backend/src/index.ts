import { server } from './app';
import { connectDatabase } from './config/database';

const PORT = process.env.PORT || 3001;

// Connexion à la base de données
connectDatabase()
  .then(() => {
    console.log('✅ Database connected successfully');
    
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