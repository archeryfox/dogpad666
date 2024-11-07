// D:\WORK\kursTimeBunBackStage\controllers\eventCategoryController.js
import EventCategoryService from '../services/eventCategoryService.js';

export async function getAllEventCategories(req, res) {
    try {
        const categories = await EventCategoryService.getAllEventCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getEventCategoryById(req, res) {
    try {
        const category = await EventCategoryService.getEventCategoryById(req.params.id-0);
        if (!category) return res.status(404).json({ error: 'Event Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createEventCategory(req, res) {
    try {
        const category = await EventCategoryService.createEventCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateEventCategory(req, res) {
    try {
        const category = await EventCategoryService.updateEventCategory(req.params.id-0, req.body);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteEventCategory(req, res) {
    try {
        await EventCategoryService.deleteEventCategory(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
