// D:\WORK\kursTimeBunBackStage\controllers\eventController.js
import EventService from '../services/eventService.js';

export async function getAllEvents(req, res) {
    try {
        const events = await EventService.getAllEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getEventById(req, res) {
    try {
        const event = await EventService.getEventById(req.params.id-0);
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createEvent(req, res) {
    try {
        const event = await EventService.createEvent(req.body);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateEvent(req, res) {
    try {
        const event = await EventService.updateEvent(req.params.id-0, req.body);
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteEvent(req, res) {
    try {
        await EventService.deleteEvent(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
