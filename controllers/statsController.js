// Пример: Подсчёт количества мероприятий по каждому месту
export const getEventCountByVenue = async () => {
    return await prisma.venue.findMany({
        select: {
            name: true,
            events: {select: {_count: true}}
        }
    });
};

// Пример: Количество подписок для каждого мероприятия
export const getSubscriptionsByEvent = async () => {
    return await prisma.event.findMany({
        select: {
            title: true,
            subscriptions: {select: {_count: true}}
        }
    });
};
