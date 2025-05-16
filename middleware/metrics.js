// dogpad.backend/middleware/metrics.js
import { httpRequestDuration, httpRequestsTotal } from '../metrics.js';

export const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    
    // Собираем метрики после завершения запроса
    res.on('finish', () => {
        const duration = Date.now() - start;
        const route = req.route ? req.route.path : req.path;
        
        // Записываем метрики
        httpRequestDuration
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration / 1000);
            
        httpRequestsTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
    });
    
    next();
}; 