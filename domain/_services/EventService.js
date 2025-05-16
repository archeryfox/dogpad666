// dogpad.backend/domain/_services/EventService.js
import { prisma } from "../../prisma/prisma.js";
import logger from "../../utils/logger.js";
import { parse, stringify } from 'csv';

class EventService {
    static query = {
        venue: true,
        organizer: true,
        categories: {
            select: {
                category: {
                    select: { id: true, name: true }
                }
            }
        },
        speakers: {
            select: {
                speaker: {
                    select: {
                        name: true,
                        user: true
                    }
                }
            }
        },
        subscriptions: true,
        Transaction: true,
        _count: true
    };

    static async getFilteredEvents({ search = '', filter = {}, sortField = 'title', sortOrder = 'asc', limit = 10, offset = 0 }) {
        try {
            const { categoryId, organizerId, dateRange } = filter;
            const whereClause = {};

            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            if (categoryId) whereClause.categories = { some: { categoryId } };
            if (organizerId) whereClause.organizerId = organizerId;
            if (dateRange) whereClause.date = { gte: dateRange.start, lte: dateRange.end };

            return await prisma.event.findMany({
                where: whereClause,
                orderBy: { [sortField]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc' },
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
        const fields = Object.keys(events[0] || {}).filter(f => f !== 'id');

        return events.map(event => {
            const values = fields.map(field => `'${event[field]}'`).join(', ');
            return `INSERT INTO events (${fields.join(', ')}) VALUES (${values});`;
        }).join('\n');
    }

    static async importEventsFromCSV(csvData) {
        const records = await new Promise((resolve, reject) => {
            parse(csvData, { columns: true }, (err, output) => (err ? reject(err) : resolve(output)));
        });
        for (const record of records) {
            await prisma.event.create({ data: record });
        }
    }

    static async exportEventsToCSV() {
        const events = await prisma.event.findMany();
        return stringify(events, { header: true });
    }

    static async createEvent(data) {
        try {
            const { categories = [], speakers = [], date, ...eventData } = data;

            const createdEvent = await prisma.event.create({
                data: {
                    ...eventData,
                    date: new Date(date).toISOString()
                }
            });

            if (categories.length > 0) {
                await prisma.eventCategory.createMany({
                    data: categories.map(categoryId => ({
                        eventId: createdEvent.id,
                        categoryId: parseInt(categoryId)
                    }))
                });
            }

            if (speakers.length > 0) {
                await prisma.eventSpeaker.createMany({
                    data: speakers.map(speakerId => ({
                        eventId: createdEvent.id,
                        speakerId: parseInt(speakerId)
                    }))
                });
            }

            return createdEvent;
        } catch (error) {
            logger.error('Ошибка при создании события:', error);
            throw new Error('Не удалось создать событие');
        }
    }

    static async updateEvent(id, data) {
        try {
            const { categories = [], speakers = [], date, ...eventData } = data;

            const updatedEvent = await prisma.event.update({
                where: { id },
                data: {
                    ...eventData,
                    date: new Date(date).toISOString()
                }
            });

            await prisma.eventCategory.deleteMany({ where: { eventId: id } });
            if (categories.length > 0) {
                await prisma.eventCategory.createMany({
                    data: categories.map(categoryId => ({
                        eventId: id,
                        categoryId: parseInt(categoryId)
                    }))
                });
            }

            await prisma.eventSpeaker.deleteMany({ where: { eventId: id } });
            if (speakers.length > 0) {
                await prisma.eventSpeaker.createMany({
                    data: speakers.map(speakerId => ({
                        eventId: id,
                        speakerId: parseInt(speakerId)
                    }))
                });
            }

            return updatedEvent;
        } catch (error) {
            logger.error(`Ошибка при обновлении события с id: ${id}`, error);
            throw new Error('Не удалось обновить событие');
        }
    }

    static async deleteEvent(id) {
        try {
            // Удаляем связанные категории и спикеров перед удалением события
            await prisma.eventCategory.deleteMany({ where: { eventId: id } });
            await prisma.eventSpeaker.deleteMany({ where: { eventId: id } });

            return await prisma.event.delete({ where: { id } });
        } catch (error) {
            logger.error(`Ошибка при удалении события с id: ${id}`, error);
            throw new Error('Не удалось удалить событие');
        }
    }

    static async getEventById(id) {
        try {
            return await prisma.event.findUnique({
                where: { id },
                include: this.query
            });
        } catch (error) {
            logger.error(`Ошибка при получении события с id: ${id}`, error);
            throw new Error('Не удалось получить событие');
        }
    }

    static async getAllEvents() {
        try {
            return await prisma.event.findMany({
                include: this.query
            });
        } catch (e) {
            logger.error('Ошибка при получении всех мероприятий:', e.message);
            throw new Error('Не удалось получить мероприятия');
        }
    }
}

export default EventService;
