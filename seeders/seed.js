const mongoose = require('mongoose');
const db = require('../models');

mongoose.connect('mongodb://localhost/transaction', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const transactionSeed = [
  {
  name: 'Beginning Balance',
  value: 1000,
  }
];

db.transaction.deleteMany({});

db.transaction.deleteMany({})
  .then(() => db.transaction.collection.insertMany(transactionSeed))
  .then((data) => {
    console.log(data.result.n + ' records inserted!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
