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
import multer from "multer";

const upload = multer();
const router = express.Router();
// Импорт/экспорт SQL
router.post('/import-sql', upload.single('file'), importEventsFromSQL);
router.get('/export-sql', exportEventsToSQL);
// Импорт/экспорт CSV
router.post('/import-csv', upload.single('file'), importEventsFromCSV);
router.get('/export-csv', exportEventsToCSV);
router.get('/', getAllEvents);
router.get('/f', getFilteredEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
