// dogpad.backend/middleware/errorHandler.js
// D:\WORK\dogpad\dogpad.backend\middleware\errorHandler.js
import logger from '../utils/logger.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Централизованный обработчик ошибок для приложения
 */
export const errorHandler = (err, req, res, next) => {
    // Логируем ошибку
    logger.error('Application error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user?.id
    });

    // Определяем тип ошибки и соответствующий статус-код
    let statusCode = 500;
    let errorMessage = 'Внутренняя ошибка сервера';

    // Обработка ошибок Prisma
    if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint failed
                statusCode = 409;
                errorMessage = 'Запись с такими данными уже существует';
                break;
            case 'P2025': // Record not found
                statusCode = 404;
                errorMessage = 'Запись не найдена';
                break;
            case 'P2003': // Foreign key constraint failed
                statusCode = 409;
                errorMessage = 'Невозможно выполнить операцию из-за связанных записей';
                break;
            case 'P2014': // Violation of a required relation
                statusCode = 400;
                errorMessage = 'Нарушение обязательной связи между записями';
                break;
            default:
                statusCode = 500;
                errorMessage = 'Ошибка базы данных';
        }
    } else if (err.name === 'ValidationError') {
        // Ошибки валидации (например, от Joi или express-validator)
        statusCode = 400;
        errorMessage = err.message || 'Ошибка валидации данных';
    } else if (err.name === 'UnauthorizedError') {
        // Ошибки авторизации
        statusCode = 401;
        errorMessage = 'Необходима авторизация';
    } else if (err.name === 'ForbiddenError') {
        // Ошибки доступа
        statusCode = 403;
        errorMessage = 'Доступ запрещен';
    } else if (err.statusCode) {
        // Если ошибка уже содержит статус-код
        statusCode = err.statusCode;
        errorMessage = err.message;
    }

    // Отправляем ответ клиенту
    res.status(statusCode).json({
        error: errorMessage,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

/**
 * Обработчик для несуществующих маршрутов
 */
export const notFoundHandler = (req, res, next) => {
    logger.warn('Route not found', { 
        url: req.originalUrl, 
        method: req.method 
    });
    
    res.status(404).json({
        error: 'Запрашиваемый ресурс не найден',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
    });
};

/**
 * Обработчик для асинхронных ошибок
 */
export const asyncErrorHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
