// D:\WORK\kursTimeBunBackStage\_services\transactionService.js
import { prisma } from '../../prisma/prisma.js';

class TransactionService {
    static async getAllTransactions() {
        return await prisma.transaction.findMany();
    }

    static async getTransactionById(id) {
        return await prisma.transaction.findUnique({ where: { id } });
    }

    static async createTransaction(data) {
        return await prisma.transaction.create({ data });
    }

    static async updateTransaction(id, data) {
        return await prisma.transaction.update({ where: { id }, data });
    }

    static async deleteTransaction(id) {
        return await prisma.transaction.delete({ where: { id } });
    }
}

export default TransactionService;
