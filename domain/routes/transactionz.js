// dogpad.backend/domain/routes/transactionz.js
// D:\WORK\kursTimeBunBackStage\routes\transactionz.js
import express from 'express';
import {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createTransactionAndUpdateBalance
} from '../controllers/transactionController.js';

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.post('/payment', createTransactionAndUpdateBalance); // Новый маршрут для платежей
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
