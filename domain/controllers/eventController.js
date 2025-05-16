// dogpad.backend/domain/controllers/eventController.js
import EventService from '../_services/EventService.js';
import { prisma } from "../../prisma/prisma.js";
import logger from '../../utils/logger.js';
import { Parser } from "json2csv";

// Получить все события с фильтрацией и сортировкой
export async function getFilteredEvents(req, res) {
    try {
        const { search, categoryId, dateMin, dateMax, sortField, sortOrder, limit, offset } = req.query;

        const filter = {
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            dateRange: (dateMin && dateMax) ? {
                start: new Date(dateMin),
                end: new Date(dateMax)
            } : undefined
        };

        const events = await EventService.getFilteredEvents({
            search,
            filter,
            sortField: sortField || 'name',
            sortOrder: sortOrder || 'asc',
            limit: limit ? parseInt(limit) : 10,
            offset: offset ? parseInt(offset) : 0
        });

        res.json(events);
    } catch (error) {
        logger.error('Ошибка в контроллере при получении событий:', error);
        res.status(500).json({ message: 'Ошибка при получении событий' });
    }
}

export async function getAllEvents(req, res) {
    try {
        const events = await EventService.getAllEvents();
        res.json(events);
    } catch (error) {
        logger.error('Ошибка при получении всех событий:', error);
        res.status(500).json({ error: error.message || 'Ошибка получения всех событий' });
    }
}

export async function getEventById(req, res) {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) return res.status(400).json({ error: 'Неверный формат ID' });

        const event = await EventService.getEventById(eventId);
        if (!event) return res.status(404).json({ error: 'Событие не найдено' });

        res.json(event);
    } catch (error) {
        logger.error(`Ошибка при получении события с ID ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
}

export async function createEvent(req, res) {
    try {
        const event = await EventService.createEvent(req.body);
        res.status(201).json(event);
    } catch (error) {
        logger.error('Ошибка при создании события:', error);
        res.status(500).json({ error: error.message || 'Ошибка при создании события' });
    }
}

export async function updateEvent(req, res) {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) return res.status(400).json({ error: 'Неверный формат ID' });

        const event = await EventService.updateEvent(eventId, req.body);
        res.json(event);
    } catch (error) {
        logger.error(`Ошибка при обновлении события с ID ${req.params.id}:`, error);
        res.status(500).json({ error: error.message || 'Ошибка при обновлении события' });
    }
}

export async function deleteEvent(req, res) {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Неверный формат ID события' });
        }

        const event = await EventService.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }

        await EventService.deleteEvent(eventId);
        res.status(204).end();
    } catch (error) {
        logger.error(`Ошибка при удалении события с ID ${req.params.id}:`, error);
        res.status(500).json({
            error: error.message || 'Произошла ошибка при удалении события',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

export async function importEventsFromSQL(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    try {
        const sqlData = req.file.buffer.toString('utf-8');
        await EventService.importEventsFromSQL(sqlData);
        res.status(200).json({ message: 'События успешно импортированы из SQL' });
    } catch (error) {
        logger.error('Ошибка при импорте данных из SQL:', error);
        res.status(500).json({ error: 'Ошибка импорта данных из SQL' });
    }
}

export async function exportEventsToSQL(req, res) {
    try {
        const sqlData = await EventService.exportEventsToSQL();
        res.header('Content-Type', 'text/plain');
        res.attachment('events.sql');
        res.send(sqlData);
    } catch (error) {
        logger.error('Ошибка при экспорте событий в SQL:', error);
        res.status(500).json({ error: 'Ошибка при экспорте событий.' });
    }
}

export async function importEventsFromCSV(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    try {
        const csvData = req.file.buffer.toString('utf-8');
        await EventService.importEventsFromCSV(csvData);
        res.status(200).json({ message: 'События успешно импортированы из CSV' });
    } catch (error) {
        logger.error('Ошибка при импорте CSV:', error);
        res.status(500).json({ error: 'Ошибка импорта данных из CSV' });
    }
}

export async function exportEventsToCSV(req, res) {
    try {
        const csvData = await EventService.exportEventsToCSV();
        res.header('Content-Type', 'text/csv');
        res.attachment('events.csv');
        res.send(csvData);
    } catch (error) {
        logger.error('Ошибка экспорта событий в CSV:', error);
        res.status(500).json({ error: 'Не удалось экспортировать события' });
    }
}
