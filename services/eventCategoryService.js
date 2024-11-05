// D:\WORK\kursTimeBunBackStage\services\eventCategoryService.js
import { prisma } from '../prisma/prisma.js';

class EventCategoryService {
    static async getAllEventCategories() {
        return await prisma.eventCategory.findMany();
    }

    static async getEventCategoryById(id) {
        return await prisma.eventCategory.findUnique({ where: { id } });
    }

    static async createEventCategory(data) {
        return await prisma.eventCategory.create({ data });
    }

    static async updateEventCategory(id, data) {
        return await prisma.eventCategory.update({ where: { id }, data });
    }

    static async deleteEventCategory(id) {
        return await prisma.eventCategory.delete({ where: { id } });
    }
}

export default EventCategoryService;
