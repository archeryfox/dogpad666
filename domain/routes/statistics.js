// dogpad.backend/domain/routes/statistics.js
import express from 'express';
import { getEventCountByVenue, getSubscriptionsByEvent } from '../controllers/statsController.js';

const router = express.Router();

router.get('/venues', async (req, res) => {
    try {
        const data = await getEventCountByVenue();
        res.json(data);
    } catch (error) {
        res.status(500).send("Error retrieving venue stats.");
    }
});

router.get('/events', async (req, res) => {
    try {
        const data = await getSubscriptionsByEvent();
        res.json(data);
    } catch (error) {
        res.status(500).send("Error retrieving event stats.");
    }
});

export default router;
