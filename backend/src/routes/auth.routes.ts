import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { DatabaseSync } from 'node:sqlite';

export function createAuthRouter(db: DatabaseSync): Router {
  const router = Router();
  const userRepo = new UserRepository(db);
  const authService = new AuthService(userRepo);
  const authController = new AuthController(authService);

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
}
