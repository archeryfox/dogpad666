// D:\WORK\kursTimeBunBackStage\services\eventService.js
import { prisma } from '../prisma/prisma.js';

class EventService {
    static async getAllEvents() {
        return await prisma.event.findMany();
    }

    static async getEventById(id) {
        return await prisma.event.findUnique({ where: { id } });
    }

    static async createEvent(data) {
        return await prisma.event.create({ data });
    }

    static async updateEvent(id, data) {
        return await prisma.event.update({ where: { id }, data });
    }

    static async deleteEvent(id) {
        return await prisma.event.delete({ where: { id } });
    }
}

export default EventService;
