import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export class AuthService {
  static async registerUser(
    email: string, 
    password: string, 
    role: string = 'USER'
  ) {
    console.log('Auth Service - Register attempt:', { email, password, role });
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    console.log('Auth Service - Existing user:', existingUser);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    console.log('Auth Service - Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Auth Service - Hashed password:', hashedPassword);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    console.log('Auth Service - User created:', user);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    console.log('Auth Service - Token generated:', token);
    console.log('Auth Service - Successfully registered');

    return { user, token };
    
  }

  static async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      bureauId: user.bureauId || undefined
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        bureauId: user.bureauId
      },
      token
    };
  }
}