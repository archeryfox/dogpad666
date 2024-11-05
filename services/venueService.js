// D:\WORK\kursTimeBunBackStage\services\venueService.js
import { prisma } from '../prisma/prisma.js';

class VenueService {
    static async getAllVenues() {
        return await prisma.venue.findMany();
    }

    static async getVenueById(id) {
        return await prisma.venue.findUnique({ where: { id } });
    }

    static async createVenue(data) {
        return await prisma.venue.create({ data });
    }

    static async updateVenue(id, data) {
        return await prisma.venue.update({ where: { id }, data });
    }

    static async deleteVenue(id) {
        return await prisma.venue.delete({ where: { id } });
    }
}

export default VenueService;
