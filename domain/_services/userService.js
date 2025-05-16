// dogpad.backend/domain/_services/userService.js
import {prisma} from "../../prisma/prisma.js";
import bcrypt from "bcryptjs";
import logger from "../../utils/logger.js";
import {parse} from "json2csv";
import fs from "fs";
import csvParser from "csv-parser";
import {Readable} from "stream"; // Для работы с потоком данных


class UserService {
    // Получить пользователей с возможностью фильтрации, сортировки и поиска
    static query = {
        role: {
            select: {
                name: true // Получаем только имя роли
            }
        },
        Speaker: {
            select: {
                id: true, // Получаем только ID спикера
                name: true, // Также можно добавить имя спикера или другие данные
                avatar: true, // Также можно добавить имя спикера или другие данные
                biography: true // Допустим, вы хотите получать биографию спикера
            }
        },
        RoleChangeRequest: true
    };

    static async getUsers({search = '', filter = {}, sortField = 'name', sortOrder = 'asc', limit = 10, offset = 0}) {
        try {
            const {roleId, balanceMin, balanceMax} = filter;

            // Составляем условие поиска
            const whereClause = {};

            // Добавляем фильтр по имени и email, если задан search
            if (search) {
                whereClause.OR = [
                    {name: {contains: search}},
                    {email: {contains: search}}
                ];
            }

            // Фильтрация по роли
            if (roleId) {
                whereClause.roleId = roleId;
            }

            // Фильтрация по балансу
            if (balanceMin || balanceMax) {
                whereClause.balance = {};
                if (balanceMin) whereClause.balance.gte = balanceMin;
                if (balanceMax) whereClause.balance.lte = balanceMax;
            }

            // Условие сортировки
            const orderBy = {
                [sortField]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc'
            };
            console.log("Условие поиска:", JSON.stringify(whereClause));

            // Получаем пользователей с учетом фильтрации, сортировки и пагинации
            return await prisma.user.findMany({
                where: whereClause,
                orderBy,
                skip: offset,
                take: limit,
                include: {
                    role: {
                        select: {
                            name: true
                        }
                    },
                    RoleChangeRequest: {
                        select: {
                            id: true,          // ID запроса
                            requestedRoleId: true, // ID запрашиваемой роли
                            status: true,       // Статус запроса (например, "pending", "approved", "rejected")
                            createdAt: true,    // Дата создания запроса
                            updatedAt: true,    // Дата обновления запроса
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Полная ошибка от Prisma:', error); // Выводим полную информацию об ошибке
            logger.error('Ошибка при получении пользователей с фильтрацией и сортировкой:', error.message);
            throw new Error('Не удалось получить пользователей');
        }
    }


    static async exportUsersToCSV() {
        try {
            const users = await prisma.user.findMany({
                include: {
                    role: {
                        select: {
                            name: true
                        }
                    },
                }
            });
            // Преобразуем данные пользователей в формат CSV
            const formattedUsers = users.map(user => ({
                name: user.name,
                email: user.email,
                password: user.password,
                balance: user.balance,
                roleId: user.roleId,
                roleName: user.role.name
            }));
            // Преобразуем данные в CSV
            const csv = parse(formattedUsers);
            // Сохраняем в файл
            fs.writeFileSync('users.csv', csv);
            console.log('Данные пользователей экспортированы в файл users.csv');
        } catch (error) {
            logger.error('Ошибка при экспорте пользователей в CSV:', error.message);
            throw new Error('Не удалось экспортировать данные пользователей');
        }
    }

    // Импорт данных пользователей из CSV (с параметром csvData)
    static async importUsersFromCSV(csvData, users = []) {
        if (!csvData) {
            throw new Error('Нет данных для импорта');
        }
        try {
            // Создаем поток из данных CSV
            const readableStream = Readable.from(csvData);
            // Читаем CSV из переданных данных
            readableStream
                .pipe(csvParser())
                .on('data', (row) => {
                    // Логируем каждую строку для диагностики
                    console.log('Читаем строку:', row);
                    users.push({
                        name: row.name,
                        email: row.email,
                        balance: parseFloat(row.balance),  // Преобразуем balance в число
                        password: row.password,
                        roleId: parseInt(row.roleId),  // Преобразуем roleId в число
                    });
                })
                .on('end', async () => {
                    try {
                        for (const user of users) {
                            console.log(`Создание пользователя: ${user.name}`);

                            // Проверяем существование роли с заданным ID
                            const roleExists = await prisma.role.findUnique({
                                where: {id: user.roleId}
                            });
                            if (!roleExists) {
                                console.log(`Ошибка: Роль с ID ${user.roleId} не найдена.`);
                                continue; // Пропускаем этого пользователя
                            }
                            // Проверяем, существует ли пользователь с таким email
                            const existingUser = await prisma.user.findUnique({
                                where: {email: user.email}
                            });
                            if (existingUser) {
                                console.log(`Пользователь с email ${user.email} уже существует, пропускаем создание.`);
                                continue; // Пропускаем создание этого пользователя
                            }
                            // Создаем нового пользователя
                            const createdUser = await prisma.user.create({
                                data: {
                                    name: user.name,
                                    email: user.email,
                                    password: user.password,
                                    balance: user.balance,
                                    roleId: user.roleId,  // Используем roleId, соответствующее внешнему ключу
                                }
                            });
                            console.log(`Пользователь ${createdUser.name} успешно создан`);
                        }
                        console.log('Данные пользователей успешно импортированы');
                        logger.info('Данные пользователей успешно импортированы');
                    } catch (e) {
                        console.error('Ошибка при импорте данных пользователей:', e.message);
                        logger.error('Ошибка при импорте данных пользователей:', e.message);
                        throw new Error('Не удалось импортировать данные пользователей');
                    }
                })
                .on('error', (error) => {
                    logger.error('Ошибка при чтении CSV данных:', error.message);
                    throw new Error('Не удалось прочитать CSV данные');
                });
        } catch (error) {
            logger.error('Ошибка при импорте пользователей из CSV:', error.message);
            throw new Error('Не удалось импортировать данные пользователей');
        }
    }


    // Экспорт данных пользователей в SQL
    static async exportUsersToSQL() {
        try {
            const users = await prisma.user.findMany({
                include: {
                    role: {
                        select: {name: true}
                    }
                }
            });

            function escapeValue(value) {
                return value.replace(/'/g, "''"); // Замена одиночных кавычек на двойные
            }

            const sqlStatements = users.map(user => {
                const roleId = user.roleId || 1;
                return `INSERT INTO User (name, email, password, balance, roleId) VALUES ('${escapeValue(user.name)}', '${escapeValue(user.email)}', '${escapeValue(user.password)}', ${user.balance}, ${roleId});`;
            }).join('\n');
            // Сохраняем SQL-запросы в файл
            fs.writeFileSync('users.sql', sqlStatements);
            console.log('Данные пользователей экспортированы в файл users.sql');
        } catch (error) {
            logger.error('Ошибка при экспорте пользователей в SQL:', error.message);
            throw new Error('Не удалось экспортировать данные пользователей');
        }
    }

    // Импорт данных пользователей из SQL
    static async importUsersFromSQL(sqlData) {
        if (!sqlData) {
            throw new Error('Нет данных для импорта');
        }
        const queries = sqlData.split(';').map(query => query.trim()).filter(query => query);
        try {
            // Отключаем проверку внешних ключей
            await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
            // Логгирование и выполнение каждого запроса
            for (const query of queries) {
                console.log(query);
                await prisma.$executeRawUnsafe(query);
            }
            // Включаем проверку внешних ключей обратно
            await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
            logger.info('Данные пользователей успешно импортированы из SQL');
        } catch (error) {
            logger.error('Ошибка при импорте пользователей из SQL:', error.message);
            throw new Error('Ошибка при импорте данных');
        }
    };

    // Получить всех пользователей
    static async getAllUsers() {
        try {
            return await prisma.user.findMany({
                include: this.query
            });
        } catch (error) {
            logger.error('Ошибка при получении всех пользователей:', error.message);
            throw new Error('Не удалось получить пользователей');
        }
    }

    // Получить пользователя по ID
    static async getUserById(id) {
        try {
            // Проверка типа id и значение NaN
            if (isNaN(id) || typeof id !== 'number') {
                throw new Error(`Неверный формат id: ${id}`);
            }
            return await prisma.user.findUnique({
                where: {id},
                include: this.query
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
                include: this.query
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
                    include: this.query
                });
            console.log(user.name)
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
            logger.error('Ошибка при поиске пользователя по имени и паролю:', error);
            throw new Error('Ошибка при поиске пользователя: ' + error);
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
            logger.error('Ошибка при создании пользователя:', error);
            throw new Error('Не удалось создать пользователя');
        }
    }

    // Обновить данные пользователя
    static async updateUser(id, data) {
        try {
            data.roleId -= 0
            console.log(data);
            return await prisma.user.update({
                where: {id},
                data
            });
        } catch (error) {
            logger.error(`Ошибка при обновлении пользователя с id: ${id}`, error);
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

    static async getUpdatedUser(userId) {
        const user = await prisma.user.findUnique({
            where: {id: userId},
            include: [{
                model: RoleChangeRequest,
                where: {status: 'approved'},
                order: [['updatedAt', 'DESC']],  // Сортируем по последнему обновлению запроса
                limit: 1  // Берем только последний одобренный запрос
            }]
        });

        if (!user) {
            throw new Error('Пользователь не найден');
        }

        // Если есть одобренный запрос на смену роли, меняем роль
        const approvedRequest = user.RoleChangeRequests[0];
        const role = approvedRequest ? roles[approvedRequest.requestedRoleId - 1] : roles[user.roleId - 1];

        // Возвращаем пользователя с обновленной ролью
        return {...user.toJSON(), role};
    };
}

export default UserService;
