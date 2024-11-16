import {prisma} from '../../prisma/prisma.js';

class SpeakerService {
    static query = {
        events: {
            select: {
                event: {
                    select: {
                        id: 1,
                        name: 1, // Запрашиваем название события из таблицы Event
                        description: 1,
                        date: 1,
                        isPaid: 1,
                        price: 1,
                        image: 1,
                        venue: {
                            select: {
                                id: 1,
                                name: 1,
                                address: 1,
                                organizerId: 1,
                                capacity: 1
                            }
                        }
                    }
                }
            }
        }
    };

    // Получение всех спикеров с привязанными событиями
    static async getAllSpeakers() {
        return await prisma.speaker.findMany({
            include: {
                events: {
                    select: {
                        event: { // Исправляем запрос, чтобы выбирать данные из Event
                            select: {
                                id: 1,
                                name: 1,
                                description: 1,
                                date: 1,
                                isPaid: 1,
                                price: 1,
                                image: 1,
                                organizer: 1,
                                venue: {
                                    select: {
                                        id: 1,
                                        name: 1,
                                        address: 1,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Получение спикера по ID с привязанными событиями
    static async getSpeakerById(id) {
        return await prisma.speaker.findUnique({
            where: {id},
            include: this.query
        });
    }

    // Создание спикера
    static async createSpeaker(data) {
        return await prisma.speaker.create({data});
    }

    // Обновление спикера
    static async updateSpeaker(id, data) {
        return await prisma.speaker.update({where: {id}, data});
    }

    // Удаление спикера
    static async deleteSpeaker(id) {
        return await prisma.speaker.delete({where: {id}});
    }
}

export default SpeakerService;
