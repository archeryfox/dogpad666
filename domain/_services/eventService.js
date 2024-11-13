import {prisma} from "../../prisma/prisma.js";
import logger from "../../utils/logger.js";
import {Parser} from "json2csv";

class EventService {
    // Условия для включения связанных данных в выборку событий
    static query =  {
        venue: true,            // Включаем связанные данные с venue
        organizer: true,        // Включаем связанные данные с organizer
        categories: {
            select: {
                category: {         // Если `speaker` — это название связи в модели `EventSpeaker`
                    select: {
                        id: 1,// Получаем поле name через связанную модель
                        name: 1,// Получаем поле name через связанную модель
                    }
                }
            }
        },       // Включаем связанные данные с categories
        speakers: {
            select: {
                speaker: {         // Если `speaker` — это название связи в модели `EventSpeaker`
                    select: {
                        name: 1,
                        user: true  // Получаем поле name через связанную модель
                    }
                }
            }
        },
        subscriptions: true,    // Включаем связанные данные с subscriptions
        Transaction: true,
        _count: true
    };

    // Получить список событий с возможностью фильтрации и сортировки
    static async getFilteredEvents({
                                       search = '',
                                       filter = {},
                                       sortField = 'title',
                                       sortOrder = 'asc',
                                       limit = 10,
                                       offset = 0
                                   }) {
        try {
            const {categoryId, organizerId, dateRange} = filter;
            const whereClause = {};

            if (search) {
                whereClause.OR = [
                    {name: {contains: search}},
                    {description: {contains: search}}
                ];
            }

            if (categoryId) whereClause.categories = {some: {id: categoryId}};
            if (organizerId) whereClause.organizerId = organizerId;
            if (dateRange) whereClause.date = {gte: dateRange.start, lte: dateRange.end};

            const orderBy = {
                [sortField]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc'
            };

            return await prisma.event.findMany({
                where: whereClause,
                orderBy,
                skip: offset,
                take: limit,
                include: this.query
            });
        } catch (error) {
            logger.error('Ошибка при получении списка событий:', error);
            throw new Error('Не удалось получить список событий');
        }
    }

    // Экспорт событий в SQL
    static async exportEventsToSQL() {
        try {
            const events = await prisma.event.findMany({include: this.query});
            const sqlStatements = events.map(event => {
                const title = event.title.replace(/'/g, "''");
                const description = event.description.replace(/'/g, "''");
                return `INSERT INTO Event (title, description, date, organizerId, venueId) VALUES ('${title}', '${description}', '${event.date}', ${event.organizerId}, ${event.venueId});`;
            }).join('\n');

            fs.writeFileSync('events.sql', sqlStatements);
            console.log('События экспортированы в файл events.sql');
        } catch (error) {
            logger.error('Ошибка при экспорте событий в SQL:', error.message);
            throw new Error('Не удалось экспортировать события');
        }
    }

    // Импорт событий из SQL
    static async importEventsFromSQL(sqlData) {
        const queries = sqlData.split(';').map(query => query.trim()).filter(query => query);
        try {
            await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
            for (const query of queries) {
                await prisma.$executeRawUnsafe(query);
            }
            await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
            logger.info('События успешно импортированы из SQL');
        } catch (error) {
            logger.error('Ошибка при импорте событий из SQL:', error.message);
            throw new Error('Ошибка при импорте событий');
        }
    }

    // Создание нового события
    static async createEvent(data) {
        try {
            data.date= new Date(data.date).toISOString()
            return await prisma.event.create({
                data: {
                    ...data,
                    categories: {
                        connect: data.categories.map(id => ({id}))
                    },
                    speakers: {
                        connect: data.speakers.map(id => ({id}))
                    }
                }
            });
        } catch (error) {
            logger.error('Ошибка при создании события:', error);
            throw new Error('Не удалось создать событие');
        }
    }

    // Обновление события
    static async updateEvent(id, data) {
        try {
            return await prisma.event.update({
                where: {id},
                data: {
                    ...data,
                    categories: {
                        set: data.categories.map(id => ({id}))
                    },
                    speakers: {
                        set: data.speakers.map(id => ({id}))
                    }
                }
            });
        } catch (error) {
            logger.error(`Ошибка при обновлении события с id: ${id}`, error.message);
            throw new Error('Не удалось обновить событие');
        }
    }

    // Удаление события
    static async deleteEvent(id) {
        try {
            return await prisma.event.delete({where: {id}});
        } catch (error) {
            logger.error(`Ошибка при удалении события с id: ${id}`, error.message);
            throw new Error('Не удалось удалить событие');
        }
    }

    // Получение события по ID
    static async getEventById(id) {
        try {
            return await prisma.event.findUnique({
                where: {id},
                include: this.query
            });
        } catch (error) {
            logger.error(`Ошибка при получении события с id: ${id}`, error.message);
            throw new Error('Не удалось получить событие');
        }
    }

    // Экспортировать события в CSV
    static async exportEventsToCSV() {
        const events = await prisma.event.findMany();
        const parser = new Parser();
        return parser.parse(events);
    }

    // Импортировать события из CSV
    static async importEventsFromCSV(csvData) {
        const lines = csvData.split('\n');
        const [header, ...rows] = lines;
        const headers = header.split(',');

        const events = rows.map(row => {
            const values = row.split(',');
            let event = {};
            headers.forEach((header, index) => {
                event[header.trim()] = values[index].trim();
            });
            return event;
        });

        for (let event of events) {
            await prisma.event.create({data: event});
        }
    }

    static async getAllEvents() {
        try {
            // console.log(newVar)
            return await prisma.event.findMany({
                include: this.query
            });
        } catch (e) {
            logger.error('Ошибка при получении все мероприятия:', e.message);
            throw new Error('Не удалось получить мероприятия');
        }

    }
}

export default EventService;
