# NodeJS API - Database Upload
Desafio do bootcamp GoStack com NodeJS e Typescrypt, utilizando tecnologias como: 
- docker 
- typeORM 
- PostgresSQL

Técnicas de migrations aplicadas para gerar tabelas no banco de dados, criação de registros, leitura, atualização e upload de arquivos.

Para inicializar,  executar o comando ``yarn`` no terminal para instalar todas as dependências. 
Em seguida, é necessário ter uma imagem de um banco de dados PostgresSQL inicializada via docker e uma database denominada gostack_desafio06 criada em um sistema gerenciador de banco de dados.
Feito isso, executar no terminal o comando ``yarn typeorm migration:run``. Este comando criará todas as tabelas e respectivas colunas no banco de dados. Para desfazer o comando, digitar ``yarn typeorm migration:revert``. Esse comando irá DELETAR todas as tabelas criadas a partir desta aplicação

Após criar as tabelas, executar no terminal o comando ``yarn run:dev`` para inciar a aplicação.

Esta API tem a funcionalidade de criar transações com um título e um valor, gerar um id a cada transação adicionada, definir um tipo income ou outcome (entrada e saída, respectivamente. Não são aceitos outros tipos). Tais campos posssuem uma coluna com seu respectivo nome no banco de dados.
Ao gerar uma nova transação, ele criará uma nova categoria contendo seu próprio id. Se caso a categoria já exista, não será gerado um novo id.

Para fazer as requisições HTTP, utilize um software de preferência (postman, insomnia).

A transação deve ser criada no seguinte formato JSON, utilizando a requisição HTTP do tipo POST:
```
{
  "title": "Salário",
  "value": 5000,
  "type": "income",
  "category": "Rendimentos"
}
```

Ao usar a requisição HTTP do tipo GET, será exibido, além de todas as transacções armazenadas no banco de dados, a data da criação, data de atualização e também um balanço que contém todos os valor de entrada, saída, e o total:
```
{
      "id": "uuid",
      "title": "Salário",
      "value": 5000,
      "type": "income",
      "category": {
        "id": "uuid",
        "title": "Rendimentos",
        "created_at": "2020-04-20T00:00:49.620Z",
        "updated_at": "2020-04-20T00:00:49.620Z"
      },
      "created_at": "2020-04-20T00:00:49.620Z",
      "updated_at": "2020-04-20T00:00:49.620Z"
    }
  ],
  "balance": {
    "income": 5000,
    "outcome": 0,
    "total": 5000
  }
  ```
  
  A aplicação também possui uma rota de deletar uma transação, atavés de uma requisição do tipo DELETE, passando como parâmetro na URL o id da transaction criada.
  EX: https://localhost:3333/transactions/<id_da_transaction>
  
  Outra funcionalidade é a possibilidade de importar arquivos do tipo CSV através de upload.
  ```
  name, country, age
  Diego, Brazil, 25
  John, Russia, 31
  Carla, Mexico, 41
```


