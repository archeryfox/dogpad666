// D:\WORK\kursTimeBunBackStage\routes\eventCategories.js
import express from 'express';
import {
    getAllEventCategories,
    getEventCategoryById,
    createEventCategory,
    updateEventCategory,
    deleteEventCategory
} from '../controllers/eventCategoryController.js';

const router = express.Router();

router.get('/', getAllEventCategories);
router.get('/:id', getEventCategoryById);
router.post('/', createEventCategory);
router.put('/:id', updateEventCategory);
router.delete('/:id', deleteEventCategory);

export default router;
