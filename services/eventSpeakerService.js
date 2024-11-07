// D:\WORK\kursTimeBunBackStage\services\eventSpeakerService.js
import { prisma } from '../prisma/prisma.js';

class EventSpeakerService {
    static async getAllEventSpeakers() {
        return await prisma.eventSpeaker.findMany({
            include: {
                speaker: {
                    select: {
                        name: true,
                    },
                },
                event: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    }

    static async getEventSpeakerById(id) {
        return await prisma.eventSpeaker.findUnique({ where: { id } });
    }

    static async createEventSpeaker(data) {
        return await prisma.eventSpeaker.create({ data });
    }

    static async updateEventSpeaker(id, data) {
        return await prisma.eventSpeaker.update({ where: { id }, data });
    }

    static async deleteEventSpeaker(id) {
        return await prisma.eventSpeaker.delete({ where: { id } });
    }
}

export default EventSpeakerService;
