import {prisma} from "../../prisma/prisma.js";
import bcrypt from "bcryptjs";
import logger from "../../utils/logger.js";

class UserService {
    // Получить всех пользователей
    static async getAllUsers() {
        try {
            return await prisma.user.findMany({
                include: {
                    role: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        } catch (error) {
            logger.error('Ошибка при получении всех пользователей:', error.message);
            throw new Error('Не удалось получить пользователей');
        }
    }

    // Получить пользователя по ID
    static async getUserById(id) {
        try {
            return await prisma.user.findUnique({
                where: {id},
                include: {
                    role: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        } catch (error) {
            logger.error(`Ошибка при получении пользователя с id: ${id}`, error.message);
            throw new Error('Не удалось получить пользователя');
        }
    }

    // Получить пользователя по email
    static async getUserByEmail(email) {
        try {
            return await prisma.user.findUnique({
                where: {email},
                include: {
                    role: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        } catch (error) {
            logger.error(`Ошибка при получении пользователя с email: ${email}`, error.message);
            throw new Error('Не удалось получить пользователя');
        }
    }

    // Получить пользователя по имени и паролю
    static async getUserByNameAndPassword(name, password) {
        try {
            // Находим пользователя по имени
            const user = await prisma.user.findFirst(
                {
                    where: {name},
                    include: {
                        role: {
                            select: {
                                name: true
                            }
                        }
                    }
                });
            if (!user) {
                throw new Error('Пользователь не найден');
            }
            // Проверка пароля
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                throw new Error('Неверное имя или пароль');
            }
            return user;
        } catch (error) {
            logger.error('Ошибка при поиске пользователя по имени и паролю:', error.message);
            throw new Error('Ошибка при поиске пользователя: ' + error.message);
        }
    }

    // Создать нового пользователя
    static async createUser(data) {
        try {
            // Проверяем, существует ли роль с данным id
            if (data.roleId) {
                const role = await prisma.role.findUnique({
                    where: {id: data.roleId}
                });

                if (!role) {
                    throw new Error('Роль не найдена');
                }
            }

            // Создаем пользователя с привязкой к роли
            return await prisma.user.create({
                data: {
                    ...data,
                    roleId: data.roleId || 1 // Если роль не указана, роль по умолчанию
                }
            });
        } catch (error) {
            logger.error('Ошибка при создании пользователя:', error.message);
            throw new Error('Не удалось создать пользователя');
        }
    }

    // Обновить данные пользователя
    static async updateUser(id, data) {
        try {
            return await prisma.user.update({
                where: {id},
                data
            });
        } catch (error) {
            logger.error(`Ошибка при обновлении пользователя с id: ${id}`, error.message);
            throw new Error('Не удалось обновить данные пользователя');
        }
    }

    // Удалить пользователя
    static async deleteUser(id) {
        try {
            return await prisma.user.delete({
                where: {id}
            });
        } catch (error) {
            logger.error(`Ошибка при удалении пользователя с id: ${id}`, error.message);
            throw new Error('Не удалось удалить пользователя');
        }
    }
}

export default UserService;
