// D:\WORK\kursTimeBunBackStage\domain\controllers\userController.js
import UserService from '../_services/userService.js';
import logger from "../../utils/logger.js";


export async function exportUsersToSQL(req, res) {
    try {
        await UserService.exportUsersToSQL();
        logger.info('Данные пользователей экспортированы');
        res.status(200).download('users.sql', "users.sql")
    } catch (error) {
        console.log(error)
        logger.error('Ошибка при экспорте пользователей в SQL:', error.message);
        res.status(500).send('Ошибка при экспорте данных');
    }
}

export async function getFilteredUsers(req, res) {
    try {
        // Извлекаем параметры из запроса
        const { search, roleId, balanceMin, balanceMax, sortField, sortOrder, limit, offset } = req.query;
        console.log(req.query);

        // Создаем объект фильтрации
        const filter = {
            roleId: roleId ? parseInt(roleId) : undefined,
            balanceMin: balanceMin ? parseFloat(balanceMin) : undefined,
            balanceMax: balanceMax ? parseFloat(balanceMax) : undefined
        };

        // Получаем пользователей из UserService, передавая параметры фильтрации
        const users = await UserService.getUsers({
            search,
            filter,
            sortField: sortField || 'name',
            sortOrder: sortOrder || 'asc',
            limit: limit ? parseInt(limit) : 10,    // Устанавливаем лимит по умолчанию - 10
            offset: offset ? parseInt(offset) : 0    // Смещение по умолчанию - 0
        });

        // Отправляем ответ с данными пользователей
        res.json(users);
    } catch (error) {
        console.error('Ошибка в контроллере при получении пользователей:', error.message);
        res.status(500).json({ message: 'Ошибка при получении пользователей' });
    }
}

export async function importUsersFromSQL(req, res) {
    try {
        const data = req.body;
        console.log(data) // Выводим тело запроса в консоль
        // Проверяем, что sqlData существует
        if (!data) {
            return res.status(400).send('Не указаны данные SQL для импорта');
        }
        // Вызываем сервис для обработки импорта
        await UserService.importUsersFromSQL(data);

        // Отправляем успешный ответ
        res.status(200).send('Данные пользователей импортированы из SQL');
    } catch (error) {
        // Обработка ошибок
        logger.error('Ошибка при импорте пользователей из SQL:', error);
        res.status(500).send('Ошибка при импорте данных');
    }
}


export async function exportUsers(req, res) {
    try {
        await UserService.exportUsersToCSV();
        logger.info('Данные пользователей экспортированы');
        res.status(200).download('users.csv', "users.csv")
    } catch (error) {
        console.error('Ошибка при экспорте:', error.message);
        logger.error(`Ошибка при импорте:${error.message}`)
        res.status(500).send('Ошибка при экспорте данных');
    }
}

export async function importUsers(req, res) {
    try {
        await UserService.importUsersFromCSV(req.body);
        logger.info('Данные пользователей импортированы');
        res.status(200).send('Данные пользователей импортированы');
    } catch (error) {
        logger.error(`Ошибка при импорте:${error}`)
        console.error('Ошибка при импорте:', error);
        res.status(500).send('Ошибка при импорте данных');
    }
}


// Получить всех пользователей
export async function getAllUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (error) {
        logger.error('Error fetching users:', error);
        res.status(500).json({error: error.message});
    }
}

// Получить пользователя по ID
export async function getUserById(req, res) {
    try {
        const user = await UserService.getUserById(req.params.id - 0); // Преобразуем в число
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json(user);
    } catch (error) {
        logger.error('Error fetching user:', error);
        res.status(500).json({error: error.message});
    }
}

// Создать нового пользователя
export async function createUser(req, res) {
    try {
        console.log(req.body)
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user:', error);
        res.status(500).json({error: error.message});
    }
}

// Обновить данные пользователя
export async function updateUser(req, res) {
    try {
        const user = await UserService.updateUser(req.params.id - 0, req.body);
        res.json(user);
    } catch (error) {
        logger.error('Error updating user:', error);
        res.status(500).json({error: error.message});
    }
}

// Удалить пользователя
export async function deleteUser(req, res) {
    try {
        await UserService.deleteUser(req.params.id - 0);
        res.status(204).end(); // Успешное удаление, без тела ответа
    } catch (error) {
        logger.error('Error deleting user:', error);
        res.status(500).json({error: error.message});
    }
}
