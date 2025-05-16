// dogpad.backend/domain/controllers/transactionController.js
// D:\WORK\kursTimeBunBackStage\controllers\transactionController.js
import TransactionService from '../_services/transactionService.js';

export async function getAllTransactions(req, res) {
    try {
        const transactions = await TransactionService.getAllTransactions();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getTransactionById(req, res) {
    try {
        const transaction = await TransactionService.getTransactionById(req.params.id-0);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function createTransaction(req, res) {
    try {
        const transaction = await TransactionService.createTransaction(req.body);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Новый метод для создания транзакции и обновления баланса
export async function createTransactionAndUpdateBalance(req, res) {
    try {
        const result = await TransactionService.createTransactionAndUpdateBalance(req.body);
        res.status(201).json(result);
    } catch (error) {
        // Возвращаем более информативную ошибку
        if (error.message.includes('Недостаточно средств')) {
            return res.status(400).json({ error: error.message });
        } else if (error.message.includes('не найдены')) {
            return res.status(404).json({ error: error.message });
        } else if (error.message.includes('не соответствует')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: error.message });
    }
}

export async function updateTransaction(req, res) {
    try {
        const transaction = await TransactionService.updateTransaction(req.params.id-0, req.body);
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteTransaction(req, res) {
    try {
        await TransactionService.deleteTransaction(req.params.id-0);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
