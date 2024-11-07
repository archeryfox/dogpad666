// D:\WORK\kursTimeBunBackStage\controllers\roleController.js
import RoleService from '../services/roleService.js';

export async function getAllRoles(req, res) {
    try {
        const roles = await RoleService.getAllRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getRoleById(req, res) {
    try {
        const role = await RoleService.getRoleById(req.params.id-0);
        if (!role) return res.status(404).json({ error: 'Role not found' });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createRole(req, res) {
    try {
        const role = await RoleService.createRole(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function updateRole(req, res) {
    try {
        const role = await RoleService.updateRole(req.params.id-0, req.body);
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteRole(req, res) {
    try {
        await RoleService.deleteRole(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
