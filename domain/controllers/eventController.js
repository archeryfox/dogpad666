import EventService from '../_services/eventService.js';
// D:\WORK\kursTimeBunBackStage\controllers\eventController.js
// Получить все события с фильтрацией и сортировкой

export async function getFilteredEvents(req, res) {
    try {
        // Извлекаем параметры из запроса
        const { search, categoryId, dateMin, dateMax, sortField, sortOrder, limit, offset } = req.query;
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
        console.error('Ошибка в контроллере при получении событий:', error.message);
        res.status(500).json({ message: 'Ошибка при получении событий' });
    }
}

export async function getAllEvents(req, res) {
    try {
        const events = await EventService.getAllEvents()
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// Получить событие по ID
export async function getEventById(req, res) {
    try {
        const event = await EventService.getEventById(parseInt(req.params.id));
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Создать новое событие
export async function createEvent(req, res) {
    try {
        const event = await EventService.createEvent(req.body);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Обновить событие по ID
export async function updateEvent(req, res) {
    try {
        const event = await EventService.updateEvent(parseInt(req.params.id), req.body);
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Удалить событие по ID
export async function deleteEvent(req, res) {
    try {
        await EventService.deleteEvent(parseInt(req.params.id));
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Экспорт событий в SQL
export async function exportEventsToSQL(req, res) {
    try {
        await EventService.exportEventsToSQL();
        res.download('events.sql');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Импорт событий из SQL
export async function importEventsFromSQL(req, res) {
    try {
        const sqlData = req.file.buffer.toString('utf-8');
        await EventService.importEventsFromSQL(sqlData);
        res.status(200).json({ message: 'Events imported successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Экспорт событий в CSV
export async function exportEventsToCSV(req, res) {
    try {
        const csvData = await EventService.exportEventsToCSV();
        res.header('Content-Type', 'text/csv');
        res.attachment('events.csv');
        res.send(csvData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Импорт событий из CSV
export async function importEventsFromCSV(req, res) {
    try {
        const csvData = req.file.buffer.toString('utf-8');
        await EventService.importEventsFromCSV(csvData);
        res.status(200).json({ message: 'Events imported successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
