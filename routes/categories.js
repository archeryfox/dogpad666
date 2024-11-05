// D:\WORK\kursTimeBunBackStage\routes\categories.js
import express from 'express';
import {
    getAllCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Маршрут для получения всех категорий
router.get('/', getAllCategories);
// Маршрут для создания новой категории
router.post('/', createCategory);
// Маршрут для получения категории по ID
router.get('/:id', getCategoryById);
// Маршрут для обновления категории по ID
router.put('/:id', updateCategory);
// Маршрут для удаления категории по ID
router.delete('/:id', deleteCategory);

export default router;
