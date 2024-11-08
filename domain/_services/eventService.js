// D:\WORK\kursTimeBunBackStage\_services\eventService.js
import {prisma} from '../../prisma/prisma.js';

class EventService {
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

    // Получить все события с подсчётом связанных данных
    static async getAllEvents() {
        return await prisma.event.findMany({include: this.query});
    }

    // Получить событие по ID с подсчётом связанных данных
    static async getEventById(id) {
        return await prisma.event.findUnique({
            where: {id},
            include: this.query
        });
    }

    // Создать новое событие
    static async createEvent(data) {
        return await prisma.event.create({data});
    }

    // Обновить данные события по ID
    static async updateEvent(id, data) {
        return await prisma.event.update({
            where: {id},
            data
        });
    }

    // Удалить событие по ID
    static async deleteEvent(id) {
        return await prisma.event.delete({where: {id}});
    }
}

export default EventService;
