// D:\WORK\kursTimeBunBackStage\routes\eventSpeakers.js
import express from 'express';
import {
    getAllEventSpeakers,
    getEventSpeakerById,
    createEventSpeaker,
    updateEventSpeaker,
    deleteEventSpeaker
} from '../controllers/eventSpeakerController.js';

const router = express.Router();

router.get('/', getAllEventSpeakers);
router.get('/:id', getEventSpeakerById);
router.post('/', createEventSpeaker);
router.put('/:id', updateEventSpeaker);
router.delete('/:id', deleteEventSpeaker);

export default router;
