import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const balance = await this.find();

    const { income, outcome } = balance.reduce(
      (acc: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            acc.income += Number(transaction.value); // number() para forçar o formato number
            break;
          case 'outcome':
            acc.outcome += Number(transaction.value);
            break;
          default:
            break;
        }
        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
