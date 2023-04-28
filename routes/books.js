const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Joi = require('joi');

// Validation schema
const bookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  description: Joi.string().required(),
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a book by id
router.get('/:id', getBook, (req, res) => {
  res.json(res.book);
});

// Create a book
router.post('/', async (req, res) => {
  const { error } = bookSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    description: req.body.description,
  });

  try {
    const newBook = await book.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ message: err});
});

// Update a book
router.patch('/:id', getBook, async (req, res) => {
const { error } = bookSchema.validate(req.body);
if (error) {
return res.status(400).json({ message: error.details[0].message });
}

if (req.body.title) {
res.book.title = req.body.title;
}

if (req.body.author) {
res.book.author = req.body.author;
}

if (req.body.description) {
res.book.description = req.body.description;
}

try {
const updatedBook = await res.book.save();
res.json(updatedBook);
} catch (err) {
res.status(400).json({ message: err.message });
}
});

// Delete a book
router.delete('/:id', getBook, async (req, res) => {
try {
await res.book.remove();
res.json({ message: 'Book deleted' });
} catch (err) {
res.status(500).json({ message: err.message });
}
});

// Middleware function to get a book by id
async function getBook(req, res, next) {
let book;
try {
book = await Book.findById(req.params.id);
if (book == null) {
return res.status(404).json({ message: 'Cannot find book' });
}
} catch (err) {
return res.status(500).json({ message: err.message });
}

res.book = book;
next();
}

module.exports = router;
