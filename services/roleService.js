// D:\WORK\kursTimeBunBackStage\services\roleService.js
import { prisma } from '../prisma/prisma.js';

class RoleService {
    static async getAllRoles() {
        return await prisma.role.findMany();
    }

    static async getRoleById(id) {
        return await prisma.role.findUnique({ where: { id } });
    }

    static async createRole(data) {
        return await prisma.role.create({ data });
    }

    static async updateRole(id, data) {
        return await prisma.role.update({ where: { id }, data });
    }

    static async deleteRole(id) {
        return await prisma.role.delete({ where: { id } });
    }
}

export default RoleService;
