// D:\WORK\kursTimeBunBackStage\controllers\authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserService from '../_services/userService.js';
import logger from "../../utils/logger.js";

// Регистрация нового пользователя
export async function registerUser(req, res) {
    const {email, password, name} = req.body;

    try {
        // Проверка на существование пользователя
        const existingUserEmail = await UserService.getUserByEmail(email);
        // const existingUser = await UserService.getUserByNameAndPassword(name, password);
        if (existingUserEmail) {
            return res.status(400).json({error: 'Пользователь уже существует'});
        }
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание нового пользователя
        const user = await UserService.createUser({
            email,
            password: hashedPassword,
            name,
        });


        // Генерация JWT токена
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Отправка токена в ответ
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role.name,
                roleId: user.roleId,
                balance: user.balance,
                RoleChangeRequest: user.RoleChangeRequest
            }
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: error.message});
    }
}

// Авторизация пользователя
export async function loginUser(req, res) {
    const {name, password} = req.body;

    console.log(name);
    // Проверка существования пользователя
    try {
        const user = await UserService.getUserByNameAndPassword(name, password);
        if (!user) {
            return res.status(400).json({error: 'Пользователь не найден'});
        }

        // Сравнение паролей
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({error: 'Неверный пароль'});
        }

        // Генерация JWT токена
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        let n = user.name
        console.log(n);
        // Отправка токена в ответ
        await res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: n,
                avatar: user.avatar,
                role: user.role.name,
                roleId: user.roleId,
                balance: user.balance,
                RoleChangeRequest: user.RoleChangeRequest,
            }
        });
    } catch (error) {
        logger.error(`${error}`);
        res.status(500).json({error: error});
    }
}


// Контроллер для получения обновленного пользователя
export const getUpdatedUser = async (req, res) => {
    try {
        const userId = req.user.id;  // Получаем id пользователя из токена (req.user.id - это часть middleware для аутентификации)
        const user = await UserService.getUpdatedUser(userId);  // Запрос на получение обновленного пользователя
        res.status(200).json(user);  // Возвращаем обновленного пользователя в ответе
    } catch (error) {
        handleError(res, error);
    }
};