// D:\WORK\kursTimeBunBackStage\routes\speakers.js
import express from 'express';
import {
    getAllSpeakers,
    getSpeakerById,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker
} from '../controllers/speakerController.js';

const router = express.Router();

router.get('/', getAllSpeakers);
router.get('/:id', getSpeakerById);
router.post('/', createSpeaker);
router.put('/:id', updateSpeaker);
router.delete('/:id', deleteSpeaker);

export default router;
