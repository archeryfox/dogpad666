// D:\WORK\kursTimeBunBackStage\controllers\userController.js
import UserService from '../services/userService.js';
import logger from "../utils/logger.js";

export async function getAllUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export async function getUserById(req, res) {
    console.log(req.params.id-0)
    try {
        const user = await UserService.getUserById(req.params.id-0);
        if (!user) return res.status(404).json({error: 'User not found'});
        res.json(user);
    } catch (error) {
        logger.info(error)
        res.status(500).json({error: error.message});
    }
}

export async function createUser(req, res) {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export async function updateUser(req, res) {
    try {
        const user = await UserService.updateUser(req.params.id-0, req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export async function deleteUser(req, res) {
    try {
        await UserService.deleteUser(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
