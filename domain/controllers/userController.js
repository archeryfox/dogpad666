// dogpad.backend/domain/controllers/userController.js
// D:\WORK\kursTimeBunBackStage\domain\controllers\userController.js
import UserService from '../_services/userService.js';
import logger from "../../utils/logger.js";
import fs from "fs";

export const userController = {
    // Экспорт пользователей в SQL
    async exportUsersToSQL(req, res) {
        try {
            await UserService.exportUsersToSQL();
            logger.info('Данные пользователей экспортированы в SQL');
            res.status(200).download('users.sql', "users.sql");
        } catch (error) {
            console.error(error);
            logger.error('Ошибка при экспорте пользователей в SQL:', error.message);
            res.status(500).send('Ошибка при экспорте данных');
        }
    },

    // Получение пользователей с фильтрацией
    async getFilteredUsers(req, res) {
        try {
            const {search, roleId, balanceMin, balanceMax, sortField, sortOrder, limit, offset} = req.query;
            const filter = {
                roleId: roleId ? parseInt(roleId) : undefined,
                balanceMin: balanceMin ? parseFloat(balanceMin) : undefined,
                balanceMax: balanceMax ? parseFloat(balanceMax) : undefined,
            };
            const users = await UserService.getUsers({
                search,
                filter,
                sortField: sortField || 'name',
                sortOrder: sortOrder || 'asc',
                limit: limit ? parseInt(limit) : 10,
                offset: offset ? parseInt(offset) : 0,
            });
            res.json(users);
        } catch (error) {
            console.error('Ошибка в контроллере при получении пользователей:', error.message);
            res.status(500).json({message: 'Ошибка при получении пользователей'});
        }
    },

    // Импорт пользователей из SQL
    async importUsersFromSQL(req, res) {
        try {
            const data = req.body;
            if (!data) {
                return res.status(400).send('Не указаны данные SQL для импорта');
            }
            await UserService.importUsersFromSQL(data);
            res.status(200).send('Данные пользователей импортированы из SQL');
        } catch (error) {
            logger.error('Ошибка при импорте пользователей из SQL:', error);
            res.status(500).send('Ошибка при импорте данных');
        }
    },

    // Экспорт пользователей в CSV
    async exportUsers(req, res) {
        try {
            await UserService.exportUsersToCSV();
            logger.info('Данные пользователей экспортированы в CSV');
            res.status(200).download('users.csv', "users.csv");
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            logger.error(`Ошибка при экспорте: ${error}`);
            res.status(500).send('Ошибка при экспорте данных');
        }
    },

    // Получение всех пользователей
    async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            logger.error('Ошибка при получении пользователей:', error);
            res.status(500).json({error: error});
        }
    },

    // Получение пользователя по ID
    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(Number(req.params.id));
            if (!user) {
                return res.status(404).json({error: 'Пользователь не найден'});
            }
            res.json(user);
        } catch (error) {
            logger.error('Ошибка при получении пользователя:', error);
            res.status(500).json({error: error});
        }
    },

    // Создание нового пользователя
    async createUser(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            logger.error('Ошибка при создании пользователя:', error);
            res.status(500).json({error: error});
        }
    },

    // Обновление данных пользователя
    async updateUser(req, res) {
        try {
            const user = await UserService.updateUser(Number(req.params.id), req.body);
            res.json(user);
        } catch (error) {
            logger.error('Ошибка при обновлении пользователя:', error);
            res.status(500).json({error: error});
        }
    },

    // Удаление пользователя
    async deleteUser(req, res) {
        try {
            await UserService.deleteUser(Number(req.params.id));
            res.status(204).end(); // Успешное удаление, без тела ответа
        } catch (error) {
            logger.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({error: error});
        }
    },
     async importUsersFromCSV(req, res) {
        try {
            // Проверяем наличие файла
            if (!req.file || !req.file.path) {
                return res.status(400).send('Файл не найден. Пожалуйста, загрузите CSV файл.');
            }
            // Путь к файлу
            const filePath = req.file.path;
            // Вызов сервиса для импорта данных
            await UserService.importUsersFromCSV(filePath);
            // Удаляем файл после обработки
            fs.unlink(filePath, (err) => {
                if (err) logger.warn(`Ошибка при удалении файла ${filePath}:`, err);
            });
            logger.info('Импорт пользователей из CSV выполнен успешно.');
            res.status(200).send('Пользователи успешно импортированы из CSV.');
        } catch (error) {
            logger.error('Ошибка при импорте пользователей из CSV:', error);
            res.status(500).send('Ошибка при импорте данных из CSV.');
        }
    }
};

export default userController;
