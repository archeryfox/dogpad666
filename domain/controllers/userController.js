// D:\WORK\kursTimeBunBackStage\domain\controllers\userController.js
import UserService from '../_services/userService.js';
import logger from "../../utils/logger.js";

// Получить всех пользователей
export async function getAllUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
}

// Получить пользователя по ID
export async function getUserById(req, res) {
    try {
        const user = await UserService.getUserById(req.params.id - 0); // Преобразуем в число
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        logger.error('Error fetching user:', error);
        res.status(500).json({ error: error.message });
    }
}

// Создать нового пользователя
export async function createUser(req, res) {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
}

// Обновить данные пользователя
export async function updateUser(req, res) {
    try {
        const user = await UserService.updateUser(req.params.id - 0, req.body);
        res.json(user);
    } catch (error) {
        logger.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
}

// Удалить пользователя
export async function deleteUser(req, res) {
    try {
        await UserService.deleteUser(req.params.id - 0);
        res.status(204).end(); // Успешное удаление, без тела ответа
    } catch (error) {
        logger.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
}
