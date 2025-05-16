// dogpad.backend/domain/controllers/RoleChangeRequestController.js
// controllers/RoleChangeRequestController.js

import RoleChangeRequestService from "../_services/RoleChangeRequestService.js";

class RoleChangeRequestController {
    static async getAllRequests(req, res) {
        try {
            const requests = await RoleChangeRequestService.getAllRequests();
            res.status(200).json(requests);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении запросов на смену роли' });
        }
    }
    // Создать новый запрос на смену роли
    static async createRequest(req, res) {
        const { userId, requestedRoleId } = req.body;
        try {
            const request = await RoleChangeRequestService.createRoleChangeRequest(userId, requestedRoleId);
            res.status(201).json(request);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка создания запроса на смену роли' });
        }
    }

    // Обновить статус запроса на смену роли (одобрение или отклонение)
    static async processRequest(req, res) {
        const { id } = req.params;
        const { action } = req.body; // Должен быть 'approve' или 'reject'
        try {
            const updatedRequest = await RoleChangeRequestService.updateRoleChangeRequestStatus(id, action);
            res.status(200).json(updatedRequest);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка обработки запроса на смену роли' });
        }
    }
}

export default RoleChangeRequestController;
