// D:\WORK\kursTimeBunBackStage\controllers\speakerController.js
import SpeakerService from '../services/speakerService.js';

export async function getAllSpeakers(req, res) {
    try {
        const speakers = await SpeakerService.getAllSpeakers();
        res.json(speakers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getSpeakerById(req, res) {
    try {
        const speaker = await SpeakerService.getSpeakerById(req.params.id);
        if (!speaker) return res.status(404).json({ error: 'Speaker not found' });
        res.json(speaker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createSpeaker(req, res) {
    try {
        const speaker = await SpeakerService.createSpeaker(req.body);
        res.status(201).json(speaker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateSpeaker(req, res) {
    try {
        const speaker = await SpeakerService.updateSpeaker(req.params.id, req.body);
        res.json(speaker);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteSpeaker(req, res) {
    try {
        await SpeakerService.deleteSpeaker(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
