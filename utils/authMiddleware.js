// D:\WORK\kursTimeBunBackStage\utils/authMiddleware.js
import jwt from 'jsonwebtoken';
import userController from "../domain/controllers/userController.js";
import userService from "../domain/_services/userService.js";

export function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).json({error: 'Access Denied: No token provided'});
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({error: 'Access Denied: Invalid token'});
        }
        req.user = user;
        next();
    });
}
