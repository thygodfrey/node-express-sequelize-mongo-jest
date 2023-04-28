require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const booksRouter = require('./routes/books');
require('./db');

app.use(express.json());
app.use('/books', booksRouter);

app.listen(port, () => console.log(`Server started on port ${port}`));