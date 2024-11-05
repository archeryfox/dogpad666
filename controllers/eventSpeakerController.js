// D:\WORK\kursTimeBunBackStage\controllers\eventSpeakerController.js
import EventSpeakerService from '../services/eventSpeakerService.js';

export async function getAllEventSpeakers(req, res) {
    try {
        const speakers = await EventSpeakerService.getAllEventSpeakers();
        res.json(speakers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getEventSpeakerById(req, res) {
    try {
        const speaker = await EventSpeakerService.getEventSpeakerById(req.params.id);
        if (!speaker) return res.status(404).json({ error: 'Event Speaker not found' });
        res.json(speaker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createEventSpeaker(req, res) {
    try {
        const speaker = await EventSpeakerService.createEventSpeaker(req.body);
        res.status(201).json(speaker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateEventSpeaker(req, res) {
    try {
        const speaker = await EventSpeakerService.updateEventSpeaker(req.params.id, req.body);
        res.json(speaker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteEventSpeaker(req, res) {
    try {
        await EventSpeakerService.deleteEventSpeaker(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
