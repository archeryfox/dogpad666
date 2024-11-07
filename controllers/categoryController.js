// D:\WORK\kursTimeBunBackStage\controllers\categoryController.js
import CategoryService from "../services/categoryService.js";

// Получить все категории
export async function getAllCategories(req, res) {
    try {
        const categories = await CategoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Создать новую категорию
export async function createCategory(req, res) {
    try {
        const category = await CategoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Получить категорию по ID
export async function getCategoryById(req, res) {
    try {
        const category = await CategoryService.getCategoryById(req.params.id-0);
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Обновить категорию по ID
export async function updateCategory(req, res) {
    try {
        const category = await CategoryService.updateCategory(req.params.id-0, req.body);
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Удалить категорию по ID
export async function deleteCategory(req, res) {
    try {
        const category = await CategoryService.deleteCategory(req.params.id-0);
        if (category) {
            res.json({ message: "Category deleted successfully" });
        } else {
            res.status(404).json({ error: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
