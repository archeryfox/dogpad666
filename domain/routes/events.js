// D:\WORK\kursTimeBunBackStage\routes\events.js
import express from 'express';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    importEventsFromSQL, exportEventsToSQL,
    importEventsFromCSV, exportEventsToCSV,
    getFilteredEvents,
} from '../controllers/eventController.js';

const router = express.Router();
router.post('/import-sql', importEventsFromSQL);
router.get('/export-sql', exportEventsToSQL);
router.post('/import-csv', importEventsFromCSV);
router.get('/export-csv', exportEventsToCSV);
router.get('/', getAllEvents);
router.get('/f', getFilteredEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
