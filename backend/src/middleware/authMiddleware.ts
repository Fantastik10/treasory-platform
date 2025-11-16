// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../utils/jwt';

// export interface AuthRequest extends Request {
//   user?: any;
// }

// export const authenticateToken = (
//   req: AuthRequest, 
//   res: Response, 
//   next: NextFunction
// ): void => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     res.status(401).json({ error: 'Access token required' });
//     return;
//   }

//   try {
//     const decoded = verifyToken(token);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(403).json({ error: 'Invalid or expired token' });
//   }
// };

// export const requireRole = (allowedRoles: string[]) => {
//   return (req: AuthRequest, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       res.status(401).json({ error: 'Authentication required' });
//       return;
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       res.status(403).json({ error: 'Insufficient permissions' });
//       return;
//     }

//     next();
//   };
// };

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { config } from '../config/environment';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 === AUTHENTICATION DEBUG ===');
  console.log('🔐 Authorization Header:', req.headers.authorization);
  console.log('🔐 Token extrait:', token ? `${token.substring(0, 20)}...` : 'NULL');
  console.log('🔐 JWT Secret configuré:', config.jwt.secret ? 'OUI' : 'NON');
  console.log('🔐 JWT Secret valeur:', config.jwt.secret ? `${config.jwt.secret.substring(0, 10)}...` : 'UNDEFINED');

  if (!token) {
    console.log('❌ Token manquant');
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    console.log('🔍 Tentative de vérification du token...');
    
    // D'abord, essayez de décoder sans vérifier pour le debug
    const decodedWithoutVerify = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('🔍 Token décodé (sans vérification):', decodedWithoutVerify);
    
    // Maintenant la vérification réelle
    const decoded = verifyToken(token);
    
    console.log('✅ Token VALIDE pour user:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      bureauId: decoded.bureauId
    });
    
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error('❌ ERREUR DÉTAILLÉE verification token:');
    console.error('   Nom:', error.name);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    if (error.name === 'TokenExpiredError') {
      console.error('   ❌ TOKEN EXPIRE');
      res.status(403).json({ 
        error: 'Token expiré',
        expiredAt: error.expiredAt 
      });
    } else if (error.name === 'JsonWebTokenError') {
      console.error('   ❌ TOKEN INVALIDE');
      res.status(403).json({ 
        error: 'Token invalide',
        details: error.message 
      });
    } else {
      console.error('   ❌ ERREUR INCONNUE');
      res.status(403).json({ 
        error: 'Erreur d\'authentification',
        details: error.message 
      });
    }
  }
};