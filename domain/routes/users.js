// D:\WORK\kursTimeBunBackStage\routes\users.js
import express from 'express';

import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/f", userController.getFilteredUsers);
// Роут для импорта пользователей из SQL
router.post('/import-sql', userController.importUsersFromSQL);
// Роут для экспорта пользователей в SQL
router.get('/export-sql', userController.exportUsersToSQL);
// Роут для импорта пользователей из CSV
router.post('/import-csv', userController.importUsersFromCSV);
// Роут для экспорта пользователей в CSV
router.get('/export-csv', userController.exportUsers);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
