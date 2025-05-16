// dogpad.backend/domain/routes/venues.js
// D:\WORK\kursTimeBunBackStage\routes\venues.js
import express from 'express';
import {
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue
} from '../controllers/venueController.js';

const router = express.Router();

router.get('/', getAllVenues);
router.get('/:id', getVenueById);
router.post('/', createVenue);
router.put('/:id', updateVenue);
router.delete('/:id', deleteVenue);

export default router;
