// D:\WORK\kursTimeBunBackStage\controllers\subscriptionController.js
import SubscriptionService from '../services/subscriptionService.js';

export async function getAllSubscriptions(req, res) {
    try {
        const subscriptions = await SubscriptionService.getAllSubscriptions();
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getSubscriptionById(req, res) {
    try {
        const subscription = await SubscriptionService.getSubscriptionById(req.params.id-0);
        if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createSubscription(req, res) {
    try {
        const subscription = await SubscriptionService.createSubscription(req.body);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateSubscription(req, res) {
    try {
        const subscription = await SubscriptionService.updateSubscription(req.params.id-0, req.body);
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteSubscription(req, res) {
    try {
        await SubscriptionService.deleteSubscription(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
