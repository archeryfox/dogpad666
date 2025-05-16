// dogpad.backend/domain/controllers/eventCategoryController.js
// D:\WORK\dogpad\dogpad.backend\domain\controllers\eventCategoryController.js
import { prisma } from '../../prisma/prisma.js';
import logger from '../../utils/logger.js';

// Получить все связи EventCategory
export async function getAllEventCategories(req, res) {
    try {
        logger.info('Request received to get all event categories');
        
        const eventCategories = await prisma.eventCategory.findMany({
            include: {
                event: true,
                category: true
            }
        });
        
        logger.info(`Successfully retrieved ${eventCategories.length} event categories`);
        res.json(eventCategories);
    } catch (error) {
        logger.error('Controller error when getting all event categories:', { 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при получении связей мероприятий с категориями',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Создать новую связь EventCategory
export async function createEventCategory(req, res) {
    try {
        const { eventId, categoryId } = req.body;
        
        if (!eventId || !categoryId) {
            logger.warn('Missing required fields in event category creation', { eventId, categoryId });
            return res.status(400).json({ 
                error: 'ID мероприятия и ID категории обязательны',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        // Проверяем, что указанные event и category существуют
        const eventExists = await prisma.event.findUnique({
            where: { id: parseInt(eventId, 10) }
        });
        
        if (!eventExists) {
            logger.warn('Attempted to create event category with non-existent event', { eventId });
            return res.status(404).json({ 
                error: 'Указанное мероприятие не найдено',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        const categoryExists = await prisma.category.findUnique({
            where: { id: parseInt(categoryId, 10) }
        });
        
        if (!categoryExists) {
            logger.warn('Attempted to create event category with non-existent category', { categoryId });
            return res.status(404).json({ 
                error: 'Указанная категория не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        // Проверяем, не существует ли уже такая связь
        const existingRelation = await prisma.eventCategory.findFirst({
            where: {
                eventId: parseInt(eventId, 10),
                categoryId: parseInt(categoryId, 10)
            }
        });
        
        if (existingRelation) {
            logger.warn('Attempted to create duplicate event category relation', { eventId, categoryId });
            return res.status(409).json({ 
                error: 'Связь между указанным мероприятием и категорией уже существует',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Creating new event category relation', { eventId, categoryId });
        
        const eventCategory = await prisma.eventCategory.create({
            data: {
                eventId: parseInt(eventId, 10),
                categoryId: parseInt(categoryId, 10)
            },
            include: {
                event: true,
                category: true
            }
        });
        
        logger.info('Event category relation created successfully', { 
            id: eventCategory.id, 
            eventId: eventCategory.eventId, 
            categoryId: eventCategory.categoryId 
        });
        
        res.status(201).json(eventCategory);
    } catch (error) {
        logger.error('Controller error when creating event category:', { 
            body: req.body, 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при создании связи мероприятия с категорией',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Получить связь EventCategory по ID
export async function getEventCategoryById(req, res) {
    try {
        const id = req.params.id;
        
        if (!id) {
            logger.warn('Missing event category ID in request');
            return res.status(400).json({ 
                error: 'ID связи обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            logger.warn('Invalid event category ID provided', { id });
            return res.status(400).json({ 
                error: 'Некорректный ID связи',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to get event category by ID', { id: parsedId });
        
        const eventCategory = await prisma.eventCategory.findUnique({
            where: { id: parsedId },
            include: {
                event: true,
                category: true
            }
        });
        
        if (!eventCategory) {
            logger.warn('Event category not found', { id: parsedId });
            return res.status(404).json({ 
                error: 'Связь не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Event category retrieved successfully', { 
            id: eventCategory.id, 
            eventId: eventCategory.eventId, 
            categoryId: eventCategory.categoryId 
        });
        
        res.json(eventCategory);
    } catch (error) {
        logger.error('Controller error when getting event category by ID:', { 
            id: req.params.id, 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при получении связи мероприятия с категорией',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Удалить связь EventCategory по ID
export async function deleteEventCategory(req, res) {
    try {
        const id = req.params.id;
        
        if (!id) {
            logger.warn('Missing event category ID in delete request');
            return res.status(400).json({ 
                error: 'ID связи обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            logger.warn('Invalid event category ID provided for deletion', { id });
            return res.status(400).json({ 
                error: 'Некорректный ID связи',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to delete event category', { id: parsedId });
        
        // Проверяем, существует ли связь
        const eventCategory = await prisma.eventCategory.findUnique({
            where: { id: parsedId }
        });
        
        if (!eventCategory) {
            logger.warn('Attempted to delete non-existent event category', { id: parsedId });
            return res.status(404).json({ 
                error: 'Связь не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        // Удаляем связь
        await prisma.eventCategory.delete({
            where: { id: parsedId }
        });
        
        logger.info('Event category deleted successfully', { 
            id: parsedId, 
            eventId: eventCategory.eventId, 
            categoryId: eventCategory.categoryId 
        });
        
        res.json({ 
            message: 'Связь успешно удалена', 
            id: parsedId,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Controller error when deleting event category:', { 
            id: req.params.id, 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при удалении связи мероприятия с категорией',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Получить все связи EventCategory для указанного мероприятия
export async function getEventCategoriesByEventId(req, res) {
    try {
        const eventId = req.params.eventId;
        
        if (!eventId) {
            logger.warn('Missing event ID in request');
            return res.status(400).json({ 
                error: 'ID мероприятия обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        const parsedEventId = parseInt(eventId, 10);
        if (isNaN(parsedEventId)) {
            logger.warn('Invalid event ID provided', { eventId });
            return res.status(400).json({ 
                error: 'Некорректный ID мероприятия',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to get event categories by event ID', { eventId: parsedEventId });
        
        const eventCategories = await prisma.eventCategory.findMany({
            where: { eventId: parsedEventId },
            include: {
                category: true
            }
        });
        
        logger.info(`Retrieved ${eventCategories.length} event categories for event`, { 
            eventId: parsedEventId 
        });
        
        res.json(eventCategories);
    } catch (error) {
        logger.error('Controller error when getting event categories by event ID:', { 
            eventId: req.params.eventId, 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при получении категорий мероприятия',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Получить все связи EventCategory для указанной категории
export async function getEventCategoriesByCategoryId(req, res) {
    try {
        const categoryId = req.params.categoryId;
        
        if (!categoryId) {
            logger.warn('Missing category ID in request');
            return res.status(400).json({ 
                error: 'ID категории обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        const parsedCategoryId = parseInt(categoryId, 10);
        if (isNaN(parsedCategoryId)) {
            logger.warn('Invalid category ID provided', { categoryId });
            return res.status(400).json({ 
                error: 'Некорректный ID категории',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to get event categories by category ID', { categoryId: parsedCategoryId });
        
        const eventCategories = await prisma.eventCategory.findMany({
            where: { categoryId: parsedCategoryId },
            include: {
                event: true
            }
        });
        
        logger.info(`Retrieved ${eventCategories.length} event categories for category`, { 
            categoryId: parsedCategoryId 
        });
        
        res.json(eventCategories);
    } catch (error) {
        logger.error('Controller error when getting event categories by category ID:', { 
            categoryId: req.params.categoryId, 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при получении мероприятий по категории',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Удалить все связи EventCategory для указанной категории
export async function deleteEventCategoriesByCategoryId(req, res) {
    try {
        const categoryId = req.params.categoryId;
        
        if (!categoryId) {
            logger.warn('Missing category ID in delete request');
            return res.status(400).json({ 
                error: 'ID категории обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        const parsedCategoryId = parseInt(categoryId, 10);
        if (isNaN(parsedCategoryId)) {
            logger.warn('Invalid category ID provided for deletion', { categoryId });
            return res.status(400).json({ 
                error: 'Некорректный ID категории',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to delete event categories by category ID', { categoryId: parsedCategoryId });
        
        // Проверяем, существует ли категория
        const categoryExists = await prisma.category.findUnique({
            where: { id: parsedCategoryId }
        });
        
        if (!categoryExists) {
            logger.warn('Attempted to delete event categories for non-existent category', { categoryId: parsedCategoryId });
            return res.status(404).json({ 
                error: 'Категория не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        // Удаляем все связи для указанной категории
        const result = await prisma.eventCategory.deleteMany({
            where: { categoryId: parsedCategoryId }
        });
        
        logger.info('Event categories deleted successfully', { 
            categoryId: parsedCategoryId, 
            count: result.count 
        });
        
        res.json({ 
            message: `${result.count} связей категории с мероприятиями успешно удалены`, 
            count: result.count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Controller error when deleting event categories by category ID:', { 
            categoryId: req.params.categoryId, 
            error: error.message, 
            stack: error.stack 
        });
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при удалении связей категории с мероприятиями',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}
