// dogpad.backend/domain/routes/subscriptions.js
// D:\WORK\kursTimeBunBackStage\routes\subscriptions.js
import express from 'express';
import {
    getAllSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);

export default router;
