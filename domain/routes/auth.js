// dogpad.backend/domain/routes/auth.js
// D:\WORK\kursTimeBunBackStage\routes/auth.js
import express from 'express';
import {registerUser, loginUser, getUpdatedUser} from '../controllers/authController.js';

const router = express.Router();

// Регистрация нового пользователя
router.post('/register', registerUser);

// Авторизация пользователя
router.post('/login', loginUser);
router.post('/check', getUpdatedUser);

export default router;
