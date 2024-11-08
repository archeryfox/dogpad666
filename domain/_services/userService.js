// D:\WORK\kursTimeBunBackStage\_services\userService.js
import {prisma} from '../../prisma/prisma.js';

class UserService {
    static async getAllUsers() {
        return await prisma.user.findMany({
            include: {
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });
    }

    static async getUserById(id) {
        return await prisma.user.findUnique({where: {id}});
    }

    static async createUser(data) {
        return await prisma.user.create({data});
    }

    static async updateUser(id, data) {
        return await prisma.user.update({where: {id}, data});
    }

    static async deleteUser(id) {
        return await prisma.user.delete({where: {id}});
    }
}

export default UserService;
