// D:\WORK\kursTimeBunBackStage\services\speakerService.js
import { prisma } from '../prisma/prisma.js';

class SpeakerService {
    static async getAllSpeakers() {
        return await prisma.speaker.findMany();
    }

    static async getSpeakerById(id) {
        return await prisma.speaker.findUnique({ where: { id } });
    }

    static async createSpeaker(data) {
        return await prisma.speaker.create({ data });
    }

    static async updateSpeaker(id, data) {
        return await prisma.speaker.update({ where: { id }, data });
    }

    static async deleteSpeaker(id) {
        return await prisma.speaker.delete({ where: { id } });
    }
}

export default SpeakerService;
