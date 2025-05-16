// dogpad.backend/domain/controllers/categoryController.js
// D:\WORK\kursTimeBunBackStage\controllers\categoryController.js
import CategoryService from "../_services/CategoryService.js";
import logger from "../../utils/logger.js";

// Получить все категории
export async function getAllCategories(req, res) {
    try {
        logger.info('Request received to get all categories');
        const categories = await CategoryService.getAllCategories();
        logger.info(`Successfully retrieved ${categories.length} categories`);
        res.json(categories);
    } catch (error) {
        logger.error('Controller error when getting all categories:', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: error.message || 'Ошибка при получении категорий',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Создать новую категорию
export async function createCategory(req, res) {
    try {
        const { name } = req.body;
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            logger.warn('Invalid category name provided', { name });
            return res.status(400).json({ 
                error: 'Название категории обязательно и должно быть непустой строкой',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to create a new category', { name });
        const category = await CategoryService.createCategory({ name: name.trim() });
        logger.info('Category created successfully', { id: category.id, name: category.name });
        
        res.status(201).json(category);
    } catch (error) {
        logger.error('Controller error when creating category:', { 
            body: req.body, 
            error: error.message, 
            stack: error.stack 
        });
        
        // Specific error handling
        if (error.message.includes('already exists')) {
            return res.status(409).json({ 
                error: error.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при создании категории',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Получить категорию по ID
export async function getCategoryById(req, res) {
    try {
        const id = req.params.id;
        
        if (!id) {
            logger.warn('Missing category ID in request');
            return res.status(400).json({ 
                error: 'ID категории обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to get category by ID', { id });
        const category = await CategoryService.getCategoryById(id);
        
        if (!category) {
            logger.warn('Category not found', { id });
            return res.status(404).json({ 
                error: "Категория не найдена",
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Category retrieved successfully', { id: category.id, name: category.name });
        res.json(category);
    } catch (error) {
        logger.error('Controller error when getting category by ID:', { 
            id: req.params.id, 
            error: error.message, 
            stack: error.stack 
        });
        
        // Specific error handling
        if (error.message.includes('Invalid category ID')) {
            return res.status(400).json({ 
                error: 'Некорректный ID категории',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при получении категории',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Обновить категорию по ID
export async function updateCategory(req, res) {
    try {
        const id = req.params.id;
        const { name } = req.body;
        
        if (!id) {
            logger.warn('Missing category ID in update request');
            return res.status(400).json({ 
                error: 'ID категории обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
            logger.warn('Invalid category name provided for update', { id, name });
            return res.status(400).json({ 
                error: 'Название категории обязательно и должно быть непустой строкой',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to update category', { id, name });
        const category = await CategoryService.updateCategory(id, { name: name.trim() });
        
        logger.info('Category updated successfully', { id: category.id, name: category.name });
        res.json(category);
    } catch (error) {
        logger.error('Controller error when updating category:', { 
            id: req.params.id, 
            body: req.body, 
            error: error.message, 
            stack: error.stack 
        });
        
        // Specific error handling
        if (error.message.includes('Category not found')) {
            return res.status(404).json({ 
                error: 'Категория не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        } else if (error.message.includes('already exists')) {
            return res.status(409).json({ 
                error: error.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        } else if (error.message.includes('Invalid category ID')) {
            return res.status(400).json({ 
                error: 'Некорректный ID категории',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при обновлении категории',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Удалить категорию по ID
export async function deleteCategory(req, res) {
    try {
        const id = req.params.id;
        
        if (!id) {
            logger.warn('Missing category ID in delete request');
            return res.status(400).json({ 
                error: 'ID категории обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to delete category', { id });
        const category = await CategoryService.deleteCategory(id);
        
        logger.info('Category deleted successfully', { id, name: category.name });
        res.json({ 
            message: "Категория успешно удалена", 
            id: category.id,
            name: category.name,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Controller error when deleting category:', { 
            id: req.params.id, 
            error: error.message, 
            stack: error.stack 
        });
        
        // Specific error handling
        if (error.message.includes('Category not found')) {
            return res.status(404).json({ 
                error: 'Категория не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        } else if (error.message.includes('referenced by other records')) {
            return res.status(409).json({ 
                error: 'Невозможно удалить категорию, так как она используется в других записях',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        } else if (error.message.includes('Invalid category ID')) {
            return res.status(400).json({ 
                error: 'Некорректный ID категории',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при удалении категории',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}

// Удалить все связи EventCategory для указанной категории
export async function deleteEventCategoriesByCategoryId(req, res) {
    try {
        const id = req.params.id;
        
        if (!id) {
            logger.warn('Missing category ID in delete event categories request');
            return res.status(400).json({ 
                error: 'ID категории обязателен',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        logger.info('Request received to delete event categories for category', { categoryId: id });
        const result = await CategoryService.deleteEventCategoriesByCategoryId(id);
        
        logger.info('Event categories deleted successfully', { categoryId: id, count: result.count });
        res.json({ 
            message: `${result.count} связей категории с мероприятиями успешно удалены`, 
            count: result.count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Controller error when deleting event categories by category ID:', { 
            categoryId: req.params.id, 
            error: error.message, 
            stack: error.stack 
        });
        
        // Specific error handling
        if (error.message.includes('Category not found')) {
            return res.status(404).json({ 
                error: 'Категория не найдена',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        } else if (error.message.includes('Invalid category ID')) {
            return res.status(400).json({ 
                error: 'Некорректный ID категории',
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            });
        }
        
        res.status(500).json({ 
            error: error.message || 'Ошибка при удалении связей категории с мероприятиями',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        });
    }
}
