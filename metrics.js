// metrics.js
import { Registry, Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register }); // Собираем стандартные метрики (CPU, память и т.д.)

// HTTP метрики
const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// Метрики событий
const eventsTotal = new Gauge({
    name: 'events_total',
    help: 'Total number of events in the system'
});

const activeEvents = new Gauge({
    name: 'active_events',
    help: 'Number of active events'
});

// Метрики пользователей
const usersTotal = new Gauge({
    name: 'users_total',
    help: 'Total number of users in the system'
});

const activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users'
});

// Метрики подписок
const subscriptionsTotal = new Gauge({
    name: 'subscriptions_total',
    help: 'Total number of subscriptions'
});

const activeSubscriptions = new Gauge({
    name: 'active_subscriptions',
    help: 'Number of active subscriptions'
});

// Регистрируем все метрики
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(eventsTotal);
register.registerMetric(activeEvents);
register.registerMetric(usersTotal);
register.registerMetric(activeUsers);
register.registerMetric(subscriptionsTotal);
register.registerMetric(activeSubscriptions);

export { 
    register,
    httpRequestDuration,
    httpRequestsTotal,
    eventsTotal,
    activeEvents,
    usersTotal,
    activeUsers,
    subscriptionsTotal,
    activeSubscriptions
};
