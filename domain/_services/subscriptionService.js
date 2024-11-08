// D:\WORK\kursTimeBunBackStage\_services\subscriptionService.js
import { prisma } from '../../prisma/prisma.js';

class SubscriptionService {
    static query= {
        event: {
            select: {
                name: 1, date: 1
            }
        }
    };
    static async getAllSubscriptions() {
        return await prisma.subscription.findMany({include: this.query});
    }

    static async getSubscriptionById(id) {
        return await prisma.subscription.findUnique({ where: { id } });
    }

    static async createSubscription(data) {
        return await prisma.subscription.create({ data });
    }

    static async updateSubscription(id, data) {
        return await prisma.subscription.update({ where: { id }, data });
    }

    static async deleteSubscription(id) {
        return await prisma.subscription.delete({ where: { id } });
    }
}

export default SubscriptionService;
