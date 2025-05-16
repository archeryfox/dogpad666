// dogpad.backend/domain/_services/CategoryService.js
// D:\WORK\kursTimeBunBackStage\_services\CategoryService.js
import { prisma } from '../../prisma/prisma.js';
import logger from '../../utils/logger.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

class CategoryService {
    // Получить все категории
    static async getAllCategories() {
        try {
            logger.info('Fetching all categories');
            return await prisma.category.findMany();
        } catch (error) {
            logger.error('Error fetching all categories:', { error: error.message, stack: error.stack });
            throw new Error(`Failed to fetch categories: ${error.message}`);
        }
    }

    // Создать новую категорию
    static async createCategory(data) {
        try {
            logger.info('Creating new category', { data });
            return await prisma.category.create({
                data
            });
        } catch (error) {
            logger.error('Error creating category:', { 
                data, 
                error: error.message, 
                stack: error.stack,
                code: error instanceof PrismaClientKnownRequestError ? error.code : 'UNKNOWN'
            });
            
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('Category with this name already exists');
                }
            }
            
            throw new Error(`Failed to create category: ${error.message}`);
        }
    }

    // Получить категорию по ID
    static async getCategoryById(id) {
        try {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                logger.warn('Invalid category ID provided', { id });
                throw new Error('Invalid category ID');
            }
            
            logger.info('Fetching category by ID', { id: parsedId });
            const category = await prisma.category.findUnique({
                where: { id: parsedId }
            });
            
            if (!category) {
                logger.warn('Category not found', { id: parsedId });
            }
            
            return category;
        } catch (error) {
            logger.error('Error fetching category by ID:', { 
                id, 
                error: error.message, 
                stack: error.stack,
                code: error instanceof PrismaClientKnownRequestError ? error.code : 'UNKNOWN'
            });
            throw new Error(`Failed to fetch category: ${error.message}`);
        }
    }

    // Обновить категорию по ID
    static async updateCategory(id, data) {
        try {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                logger.warn('Invalid category ID provided for update', { id });
                throw new Error('Invalid category ID');
            }
            
            logger.info('Updating category', { id: parsedId, data });
            
            // Check if category exists first
            const existingCategory = await prisma.category.findUnique({
                where: { id: parsedId }
            });
            
            if (!existingCategory) {
                logger.warn('Attempted to update non-existent category', { id: parsedId });
                throw new Error('Category not found');
            }
            
            return await prisma.category.update({
                where: { id: parsedId },
                data
            });
        } catch (error) {
            logger.error('Error updating category:', { 
                id, 
                data, 
                error: error.message, 
                stack: error.stack,
                code: error instanceof PrismaClientKnownRequestError ? error.code : 'UNKNOWN'
            });
            
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error('Category with this name already exists');
                }
            }
            
            throw new Error(`Failed to update category: ${error.message}`);
        }
    }

    // Удалить категорию по ID
    static async deleteCategory(id) {
        const parsedId = parseInt(id, 10);
        
        try {
            if (isNaN(parsedId)) {
                logger.warn('Invalid category ID provided for deletion', { id });
                throw new Error('Invalid category ID');
            }
            
            logger.info('Deleting category and its related event categories', { id: parsedId });
            
            // Check if category exists first
            const existingCategory = await prisma.category.findUnique({
                where: { id: parsedId }
            });
            
            if (!existingCategory) {
                logger.warn('Attempted to delete non-existent category', { id: parsedId });
                throw new Error('Category not found');
            }
            
            // First delete all related EventCategory records
            const deletedRelations = await prisma.eventCategory.deleteMany({
                where: { categoryId: parsedId }
            });
            
            logger.info('Deleted related event categories', { 
                id: parsedId, 
                count: deletedRelations.count 
            });
            
            // Then delete the category
            const deletedCategory = await prisma.category.delete({
                where: { id: parsedId }
            });
            
            logger.info('Successfully deleted category', { id: parsedId, name: deletedCategory.name });
            
            return deletedCategory;
        } catch (error) {
            logger.error('Error deleting category:', { 
                id: parsedId, 
                error: error.message, 
                stack: error.stack,
                code: error instanceof PrismaClientKnownRequestError ? error.code : 'UNKNOWN'
            });
            
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new Error('Category not found');
                } else if (error.code === 'P2003') {
                    throw new Error('Cannot delete category because it is referenced by other records');
                }
            }
            
            throw new Error(`Failed to delete category: ${error.message}`);
        }
    }
    
    // Удалить все EventCategory записи для указанной категории
    static async deleteEventCategoriesByCategoryId(categoryId) {
        const parsedId = parseInt(categoryId, 10);
        
        try {
            if (isNaN(parsedId)) {
                logger.warn('Invalid category ID provided for event categories deletion', { categoryId });
                throw new Error('Invalid category ID');
            }
            
            logger.info('Deleting all event categories for category', { categoryId: parsedId });
            
            // Check if category exists first
            const existingCategory = await prisma.category.findUnique({
                where: { id: parsedId }
            });
            
            if (!existingCategory) {
                logger.warn('Attempted to delete event categories for non-existent category', { categoryId: parsedId });
                throw new Error('Category not found');
            }
            
            const result = await prisma.eventCategory.deleteMany({
                where: { categoryId: parsedId }
            });
            
            logger.info('Successfully deleted event categories', { 
                categoryId: parsedId, 
                count: result.count 
            });
            
            return result;
        } catch (error) {
            logger.error('Error deleting event categories by category ID:', { 
                categoryId: parsedId, 
                error: error.message, 
                stack: error.stack,
                code: error instanceof PrismaClientKnownRequestError ? error.code : 'UNKNOWN'
            });
            
            throw new Error(`Failed to delete event categories: ${error.message}`);
        }
    }
}

export default CategoryService;
