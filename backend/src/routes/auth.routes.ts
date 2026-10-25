import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { IDatabase } from '../types/db';

export function createAuthRouter(db: IDatabase): Router {
  const router = Router();
  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo);
  const authController = new AuthController(authService);

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
}
