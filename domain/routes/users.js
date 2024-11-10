// D:\WORK\kursTimeBunBackStage\routes\users.js
import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    exportUsersToSQL, importUsersFromSQL,
    exportUsers, importUsers,
    getFilteredUsers
} from '../controllers/userController.js';

const router = express.Router();

router.get("/f", getFilteredUsers);
// Роут для импорта пользователей из SQL
router.post('/import-sql', importUsersFromSQL);
// Роут для экспорта пользователей в SQL
router.get('/export-sql', exportUsersToSQL);
// Роут для импорта пользователей из CSV
router.post('/import-csv', importUsers);
// Роут для экспорта пользователей в CSV
router.get('/export-csv', exportUsers);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
