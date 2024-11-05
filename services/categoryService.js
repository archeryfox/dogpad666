// D:\WORK\kursTimeBunBackStage\services\categoryService.js
import { prisma } from '../prisma/prisma.js';

class CategoryService {
    // Получить все категории
    static async getAllCategories() {
        return await prisma.category.findMany();
    }

    // Создать новую категорию
    static async createCategory(data) {
        return await prisma.category.create({
            data
        });
    }

    // Получить категорию по ID
    static async getCategoryById(id) {
        return await prisma.category.findUnique({
            where: { id: parseInt(id, 10) }
        });
    }

    // Обновить категорию по ID
    static async updateCategory(id, data) {
        return await prisma.category.update({
            where: { id: parseInt(id, 10) },
            data
        });
    }

    // Удалить категорию по ID
    static async deleteCategory(id) {
        return await prisma.category.delete({
            where: { id: parseInt(id, 10) }
        });
    }
}

export default CategoryService;
