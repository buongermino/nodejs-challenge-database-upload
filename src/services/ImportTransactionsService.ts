import fs from 'fs';
import csvParse from 'csv-parse';
import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const readStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2, // começa a leitura do arquivo a partir da linha 2
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readStream.pipe(parseStream);

    const transactions: CSVTransactions[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value) return;

      // bulk insert -> faz a leitura toda do arquivo, para depois inserir no banco, para evitar conexões e desconexões desnecessárias
      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // buscar pelas categorias que existem no banco de dados
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // percorrer as categorias existentes
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    // filtrar pelas categorias que ainda não existem no banco de dados e por possiveis categorias duplicadas
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    // caso as categorias não existam no banco, elas então são criadas
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    // salva a nova categoria no banco
    await categoriesRepository.save(newCategories);

    // todas as categorias juntas
    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionsRepository.save(createdTransactions);

    // exlui o arquivo após a leitura
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
