// dogpad.backend/domain/_services/transactionService.js
// D:\WORK\kursTimeBunBackStage\_services\transactionService.js
import { prisma } from '../../prisma/prisma.js';
import logger from '../../utils/logger.js';

class TransactionService {
    static async getAllTransactions() {
        return await prisma.transaction.findMany();
    }

    static async getTransactionById(id) {
        return await prisma.transaction.findUnique({ where: { id } });
    }

    static async createTransaction(data) {
        console.log(data);
        return await prisma.transaction.create({ data });
    }

    static async updateTransaction(id, data) {
        return await prisma.transaction.update({ where: { id }, data });
    }

    static async deleteTransaction(id) {
        return await prisma.transaction.delete({ where: { id } });
    }
    
    // Новый метод для создания транзакции и обновления баланса в одной транзакции
    static async createTransactionAndUpdateBalance(transactionData) {
        try {
            // Получаем актуальные данные о пользователе и мероприятии
            const user = await prisma.user.findUnique({
                where: { id: transactionData.userId }
            });
            
            const event = await prisma.event.findUnique({
                where: { id: transactionData.eventId }
            });
            
            if (!user || !event) {
                throw new Error('Пользователь или мероприятие не найдены');
            }
            
            // Проверяем, достаточно ли средств у пользователя
            if (user.balance < event.price) {
                throw new Error('Недостаточно средств на балансе пользователя');
            }
            
            // Проверяем, соответствует ли сумма транзакции цене мероприятия
            if (transactionData.amount !== event.price) {
                throw new Error('Сумма транзакции не соответствует цене мероприятия');
            }
            
            // Выполняем все операции в одной транзакции
            return await prisma.$transaction(async (prismaClient) => {
                // Создаем транзакцию
                const transaction = await prismaClient.transaction.create({
                    data: {
                        amount: event.price,
                        userId: user.id,
                        eventId: event.id
                    }
                });
                
                // Обновляем баланс пользователя
                const updatedUser = await prismaClient.user.update({
                    where: { id: user.id },
                    data: { balance: user.balance - event.price }
                });
                
                // Создаем подписку на мероприятие
                const subscription = await prismaClient.subscription.create({
                    data: {
                        userId: user.id,
                        eventId: event.id,
                        subscriptionDate: new Date()
                    }
                });
                
                return {
                    transaction,
                    user: updatedUser,
                    subscription
                };
            });
        } catch (error) {
            logger.error('Ошибка при создании транзакции и обновлении баланса:', error);
            throw error;
        }
    }
}

export default TransactionService;
