// routes/roleChangeRequestRoutes.js
import express from "express";
import RoleChangeRequestController from "../controllers/RoleChangeRequestController.js";

const router = express.Router();

// POST запрос для создания запроса на смену роли
router.post('/', RoleChangeRequestController.createRequest);

// PUT запрос для обновления статуса запроса (одобрение или отклонение)
router.put('/:id', RoleChangeRequestController.processRequest);

// Маршрут для получения всех запросов на смену роли
router.get('/', RoleChangeRequestController.getAllRequests);

export default router;