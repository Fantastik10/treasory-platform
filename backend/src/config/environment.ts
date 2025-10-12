export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'treasory-dev-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  bcrypt: {
    saltRounds: 12
  },
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};