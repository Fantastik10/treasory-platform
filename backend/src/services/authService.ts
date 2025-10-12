import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export class AuthService {
  static async registerUser(
    email: string, 
    password: string, 
    role: string = 'USER'
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await hashPassword(password);

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

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

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