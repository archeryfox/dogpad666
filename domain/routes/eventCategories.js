// dogpad.backend/domain/routes/eventCategories.js
// D:\WORK\kursTimeBunBackStage\routes\eventCategories.js
import express from 'express';
import {
    getAllEventCategories,
    getEventCategoryById,
    createEventCategory,
    deleteEventCategory,
    getEventCategoriesByEventId,
    getEventCategoriesByCategoryId,
    deleteEventCategoriesByCategoryId
} from '../controllers/eventCategoryController.js';

const router = express.Router();

// Основные маршруты для EventCategory
router.get('/', getAllEventCategories);
router.post('/', createEventCategory);

// Маршруты для работы с EventCategory по ID мероприятия
router.get('/event/:eventId', getEventCategoriesByEventId);

// Маршруты для работы с EventCategory по ID категории
router.get('/category/:categoryId', getEventCategoriesByCategoryId);
router.delete('/category/:categoryId', deleteEventCategoriesByCategoryId);

// Маршруты для работы с конкретной EventCategory по ID
router.get('/:id', getEventCategoryById);
router.delete('/:id', deleteEventCategory);

export default router;
