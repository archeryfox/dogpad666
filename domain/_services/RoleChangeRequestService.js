// services/RoleChangeRequestService.js

import {prisma} from "../../prisma/prisma.js"; // Предположим, что prismaClient настроен в проекте

class RoleChangeRequestService {
    // Создание запроса на смену роли
    static async createRoleChangeRequest(userId, requestedRoleId) {
        try {

            const reqChangeRole = await prisma.roleChangeRequest.create({
                data: {userId, requestedRoleId}
            });
            console.log(reqChangeRole);
            return reqChangeRole;
        } catch (error) {
            console.log(error);
        }
    }

    // Обновление статуса запроса на смену роли
    static async updateRoleChangeRequestStatus(id, action) {
        const updatedRequest = await prisma.roleChangeRequest.update({
            where: {id: Number(id)},
            data: {status: action === 'approve' ? 'approved' : 'rejected'}
        });

        if (action === 'approve') {
            // Если запрос одобрен, обновляем роль пользователя
            await prisma.user.update({
                where: {id: updatedRequest.userId},
                data: {roleId: updatedRequest.requestedRoleId}
            });
        }

        return updatedRequest;
    }

    // Получение всех запросов на смену роли
    static async getAllRequests() {
        try {
            // Получаем все запросы на смену роли из БД
            return await prisma.roleChangeRequest.findMany({
                include: {
                    user: true, // Включаем данные о пользователе, который сделал запрос
                    role: true // Включаем данные о запрашиваемой роли
                }
            });
        } catch (error) {
            console.error("Ошибка при получении всех запросов на смену роли:", error);
            throw new Error('Не удалось получить запросы на смену роли');
        }
    }
}

export default RoleChangeRequestService;
