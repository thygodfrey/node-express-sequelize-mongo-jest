const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const Book = require('../models/book');

describe('Books API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await Book.deleteMany({});
        await mongoose.connection.close();
    });

    describe('GET /books', () => {
        it('should return all books', async () => {
            const book1 = new Book({
                title: 'Book 1',
                author: 'Author 1',
                description: 'Description 1',
            });
            await book1.save();

            const book2 = new Book({
                title: 'Book 2',
                author: 'Author 2',
                description: 'Description 2',
            });
            await book2.save();

            const res = await request(app).get('/books');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body[0].title).toBe(book1.title);
            expect(res.body[1].title).toBe(book2.title);
        });
    });

    describe('GET /books/:id', () => {
        it('should return a book by id', async () => {
            const book = new Book({
                title: 'Book 1',
                author: 'Author 1',
                description: 'Description 1',
            });
            await book.save();
            const res = await request(app).get(`/books/${book.id}`);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe(book.title);
        });

        it('should return 404 if book not found', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(app).get(`/books/${id}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /books', () => {
        it('should create a new book', async () => {
            const book = {
                title: 'Book 1',
                author: 'Author 1',
                description: 'Description 1',
            };

            const res = await request(app).post('/books').send(book);

            expect(res.status).toBe(201);
            expect(res.body.title).toBe(book.title);
            expect(res.body.author).toBe(book.author);
            expect(res.body.description).toBe(book.description);

            const dbBook = await Book.findById(res.body._id);
            expect(dbBook.title).toBe(book.title);
            expect(dbBook.author).toBe(book.author);
            expect(dbBook.description).toBe(book.description);
        });

        it('should return 400 if request body is invalid', async () => {
            const book = {};

            const res = await request(app).post('/books').send(book);

            expect(res.status).toBe(400);
        });
    });

    describe('PATCH /books/:id', () => {
        it('should update an existing book', async () => {
            const book = new Book({
                title: 'Book 1',
                author: 'Author 1',
                description: 'Description 1',
            });
            await book.save();

            const updatedBook = {
                title: 'New Title',
                author: 'New Author',
                description: 'New Description',
            };

            const res = await request(app).patch(`/books/${book.id}`).send(updatedBook);

            expect(res.status).toBe(200);
            expect(res.body.title).toBe(updatedBook.title);
            expect(res.body.author).toBe(updatedBook.author);
            expect(res.body.description).toBe(updatedBook.description);

            const dbBook = await Book.findById(book.id);
            expect(dbBook.title).toBe(updatedBook.title);
            expect(dbBook.author).toBe(updatedBook.author);
            expect(dbBook.description).toBe(updatedBook.description);
        });

        it('should return 400 if request body is invalid', async () => {
            const book = new Book({
                title: 'Book 1',
                author: 'Author 1',
                description: 'Description 1',
            });
            await book.save();

            const updatedBook = {
                title: '',
            };

            const res = await request(app).patch(`/books/${book.id}`).send(updatedBook);

            expect(res.status).toBe(400);
        });

        it('should return 404 if book not found', async () => {
            const id = mongoose.Types.ObjectId();
            const updatedBook = {
                title: 'New Title',
                author: 'New Author',
                description: 'New Description',
            };

            const res = await request(app).patch(`/books/${id}`).send(updatedBook);

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /books/:id', () => {
        it('should delete an existing book', async () => {
            const book = new Book({
                title: 'Book 1',
                author: 'Author 1',
                description: 'Description 1',
            });
            await book.save();

            const res = await request(app).delete(`/books/${book.id}`);

            expect(res.status).toBe(204);

            const dbBook = await Book.findById(book.id);
            expect(dbBook).toBeNull();
        });

        it('should return 404 if book not found', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(app).delete(`/books/${id}`);

            expect(res.status).toBe(404);
        });
    });
});
