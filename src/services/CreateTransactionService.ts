import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    // verificar se os tipos são income ou outcome
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Invalid transaction type', 401);
    }

    const { total } = await transactionRepository.getBalance();

    // não permitir operação outcome se este valor for menor que o total
    if (type === 'outcome' && total < value) {
      throw new AppError('Not enough balance!', 400);
    }

    // categoria, busca no banco de dados uma categoria se o título for igual ao da categoria passada
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      // se a categoria não existir, será criada
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory); // e depois salva no banco de dados
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
