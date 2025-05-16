// dogpad.backend/domain/controllers/venueController.js
// D:\WORK\kursTimeBunBackStage\controllers\venueController.js
import VenueService from '../_services/venueService.js';

export async function getAllVenues(req, res) {
    try {
        const venues = await VenueService.getAllVenues();
        res.json(venues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getVenueById(req, res) {
    try {
        const venue = await VenueService.getVenueById(req.params.id-0);
        if (!venue) return res.status(404).json({ error: 'Venue not found' });
        res.json(venue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createVenue(req, res) {
    try {
        const venue = await VenueService.createVenue(req.body);
        res.status(201).json(venue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateVenue(req, res) {
    try {
        const venue = await VenueService.updateVenue(req.params.id-0, req.body);
        res.json(venue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteVenue(req, res) {
    try {
        await VenueService.deleteVenue(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
