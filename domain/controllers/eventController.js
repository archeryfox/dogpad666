import EventService from '../_services/eventService.js';
import {prisma} from "../../prisma/prisma.js";
// D:\WORK\kursTimeBunBackStage\controllers\eventController.js
// Получить все события с фильтрацией и сортировкой

import {Parser} from "json2csv";

export async function getFilteredEvents(req, res) {
    try {
        // Извлекаем параметры из запроса
        const {search, categoryId, dateMin, dateMax, sortField, sortOrder, limit, offset} = req.query;
        console.log(req.query);

        // Создаем объект фильтрации
        const filter = {
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            dateMin: dateMin ? new Date(dateMin) : undefined,
            dateMax: dateMax ? new Date(dateMax) : undefined
        };

        // Получаем события из EventService, передавая параметры фильтрации
        const events = await EventService.getFilteredEvents({
            search,
            filter,
            sortField: sortField || 'name',  // Сортируем по имени по умолчанию
            sortOrder: sortOrder || 'asc',   // Сортировка по возрастанию по умолчанию
            limit: limit ? parseInt(limit) : 10,  // Устанавливаем лимит по умолчанию - 10
            offset: offset ? parseInt(offset) : 0  // Смещение по умолчанию - 0
        });

        // Отправляем ответ с данными событий
        res.json(events);
    } catch (error) {
        console.error('Ошибка в контроллере при получении событий:', error);
        res.status(500).json({message: 'Ошибка при получении событий'});
    }
}

export async function getAllEvents(req, res) {
    try {
        const events = await EventService.getAllEvents()
        res.json(events);
    } catch (error) {
        res.status(500).json({error: error});
    }
}

// Получить событие по ID
export async function getEventById(req, res) {
    try {
        const event = await EventService.getEventById(parseInt(req.params.id));
        if (!event) return res.status(404).json({error: 'Event not found'});
        res.json(event);
    } catch (error) {
        res.status(500).json({error: error});
    }
}

// Создать новое событие
export async function createEvent(req, res) {
    try {
        const event = await EventService.createEvent(req.body);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({error: error});
    }
}

// Обновить событие по ID
export async function updateEvent(req, res) {
    try {
        console.log(req.body);
        const event = await EventService.updateEvent(parseInt(req.params.id), req.body);
        res.json(event);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Удалить событие по ID
export async function deleteEvent(req, res) {
    try {
        await EventService.deleteEvent(parseInt(req.params.id));
        res.status(204).end();
    } catch (error) {
        res.status(500).json({error: error});
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
        console.error('Ошибка импорта SQL:', error);
        res.status(500).json({ error: 'Ошибка импорта данных из SQL' });
    }
}

// Экспорт событий в SQL
export async function exportEventsToSQL(req, res) {
    try {
        const events = await prisma.event.findMany({
            select: {
                name: true,
                email: true,
                password: true,
                balance: true,
                roleId: true,
                roleName: true,
            },
        });

        let sqlData = '';
        events.forEach(event => {
            const values = Object.values(event)
                .map(value => (typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value))
                .join(', ');
            sqlData += `INSERT INTO events (name, email, password, balance, roleId, roleName) VALUES (${values});\n`;
        });

        res.header('Content-Type', 'text/plain');
        res.attachment('events.sql');
        res.send(sqlData);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        console.error('Ошибка импорта CSV:', error);
        res.status(500).json({ error: 'Ошибка импорта данных из CSV' });
    }
}



export async function exportEventsToCSV(req, res) {
    try {
        const events = await prisma.event.findMany({
            select: {
                name: true,
                description: true,
                date: true,
                isPaid: true,
                price: true,
                image: true,
                organizerId: true,
                venueId: true,
            },
        });

        // Конвертация данных в CSV
        const fields = [
            'name',
            'description',
            'date',
            'isPaid',
            'price',
            'image',
            'organizerId',
            'venueId',
        ];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(events);

        // Установка заголовков и отправка CSV-файла
        res.header('Content-Type', 'text/csv');
        res.attachment('events.csv');
        res.send(csv);
    } catch (error) {
        console.error('Ошибка экспорта событий в CSV:', error);
        res.status(500).json({ error: 'Не удалось экспортировать события' });
    }
}


