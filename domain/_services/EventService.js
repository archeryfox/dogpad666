import {prisma} from "../../prisma/prisma.js";
import logger from "../../utils/logger.js";
// import {parse, Parser} from "json2csv";
import {parse, stringify} from 'csv';
import fs from "fs";

class EventService {
    // Условия для включения связанных данных в выборку событий
    static query = {
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

    static async importEventsFromSQL(sqlData) {
        const queries = sqlData.split(';').filter(query => query.trim());
        for (const query of queries) {
            await prisma.$executeRawUnsafe(query);
        }
    }

    static async exportEventsToSQL() {
        const events = await prisma.event.findMany();
        const fields = Object.keys(events[0]).filter(field => field !== 'id'); // Все поля кроме 'id'

        return events.map(event => {
            const values = fields.map(field => `'${event[field]}'`).join(', ');
            return `INSERT INTO events (${fields.join(', ')}) VALUES (${values});`;
        }).join('\n');
    }


    static async importEventsFromCSV(csvData) {
        const records = await new Promise((resolve, reject) => {
            parse(csvData, {columns: true}, (err, output) => (err ? reject(err) : resolve(output)));
        });
        for (const record of records) {
            await prisma.event.create({data: record});
        }
    }

    static async exportEventsToCSV() {
        const events = await prisma.event.findMany();
        return stringify(events, {header: true});
    }

    // Создание нового события
    static async createEvent(data) {
        try {
            // Извлекаем категории и спикеров из данных
            const { categories = [], speakers = [], ...eventData } = data;
            
            // Преобразуем дату в формат ISO
            eventData.date = new Date(data.date).toISOString();

            // Создаём событие без связей
            const event = await prisma.event.create({
                data: eventData
            });

            // Создаём связи с категориями, если они есть
            if (categories.length > 0) {
                const categoryRelations = categories.map(categoryId => ({
                    eventId: event.id,
                    categoryId: parseInt(categoryId)
                }));
                
                await prisma.eventCategory.createMany({
                    data: categoryRelations
                });
            }

            // Создаём связи со спикерами, если они есть
            if (speakers.length > 0) {
                const speakerRelations = speakers.map(speakerId => ({
                    eventId: event.id,
                    speakerId: parseInt(speakerId)
                }));
                
                await prisma.eventSpeaker.createMany({
                    data: speakerRelations
                });
            }

            // Возвращаем созданное событие, включая id
            return event;
        } catch (error) {
            logger.error('Ошибка при создании события:', error);
            throw new Error('Не удалось создать событие');
        }
    }


    // Обновление события
    static async updateEvent(id, data) {
        try {
            const moscowOffset = 3 * 60 * 60000;

            // Разделяем данные
            const { categories, speakers, ...eventFields } = data;

            // Обновляем основное событие
            const updatedEvent = await prisma.event.update({
                where: { id },
                data: {
                    ...eventFields,
                    date: new Date(new Date(data.date).getTime() + moscowOffset).toISOString(),
                },
            });

            // Удаляем старые связи с категориями
            await prisma.eventCategory.deleteMany({
                where: { eventId: id },
            });

            // Создаём новые связи с категориями
            if (categories?.length) {
                const categoryRelations = categories.map((categoryId) => ({
                    eventId: id,
                    categoryId: categoryId,
                }));

                await prisma.eventCategory.createMany({
                    data: categoryRelations,
                });
            }

            // Удаляем старые связи со спикерами
            await prisma.eventSpeaker.deleteMany({
                where: { eventId: id },
            });

            // Создаём новые связи со спикерами
            if (speakers?.length) {
                const speakerRelations = speakers.map((speakerId) => ({
                    eventId: id,
                    speakerId: speakerId,
                }));

                await prisma.eventSpeaker.createMany({
                    data: speakerRelations,
                });
            }

            return updatedEvent;
        } catch (error) {
            logger.error(`Ошибка при обновлении события с id: ${id}`, error);
            throw new Error('Не удалось обновить событие', error);
        }
    }

    // Удаление события
    static async deleteEvent(id) {
        try {
            return await prisma.event.delete({where: {id}});
        } catch (error) {
            logger.error(`Ошибка при удалении события с id: ${id}`, error);
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
            logger.error(`Ошибка при получении события с id: ${id}`, error);
            throw new Error('Не удалось получить событие');
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
