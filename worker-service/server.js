// worker-service/test/server.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); // For in-memory MongoDB
const app = require('../server'); // Your Express app
const Todo = require('../models/Todo'); // Your Todo model

describe('Todo API Tests', () => {
    let mongoServer;

    beforeAll(async () => {
        // Start an in-memory MongoDB server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        // Connect to the in-memory MongoDB
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        // Disconnect from MongoDB and stop the in-memory server
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await Todo.deleteMany({});
    });

    it('should respond to the GET request with an empty array initially', async () => {
        const response = await request(app).get('/todo');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]); // Initially, there should be no todos
    });

    it('should create a new todo and respond with the created todo', async () => {
        const newTodo = { name: 'Test Todo', completed: false };
        const response = await request(app)
            .post('/todo/new')
            .send(newTodo);

        expect(response.statusCode).toBe(201);
        expect(response.body.newTask).toHaveProperty('_id');
        expect(response.body.newTask.name).toBe(newTodo.name);
        expect(response.body.newTask.completed).toBe(newTodo.completed);

        // Verify that the todo was actually created in the database
        const todo = await Todo.findById(response.body.newTask._id);
        expect(todo).not.toBeNull();
        expect(todo.name).toBe(newTodo.name);
    });


    it('should retrieve all todos', async () => {
        // Create some todos first
        const todo1 = await Todo.create({ name: 'Todo 1', completed: false });
        const todo2 = await Todo.create({ name: 'Todo 2', completed: true });

        const response = await request(app).get('/todo');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2); // Two todos should be returned

        // Check that the todos match the ones created
        expect(response.body.some(todo => todo._id === todo1._id.toString() && todo.name === todo1.name)).toBe(true);
        expect(response.body.some(todo => todo._id === todo2._id.toString() && todo.name === todo2.name)).toBe(true);
    });

    it('should delete a todo', async () => {
        // First, create a todo
        const newTodo = await Todo.create({ name: 'Todo to delete', completed: false });

        const response = await request(app).delete(`/todo/delete/${newTodo._id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(newTodo._id.toString()); // Check that the deleted todo's ID is returned

        // Verify that the todo is actually deleted from the database
        const todo = await Todo.findById(newTodo._id);
        expect(todo).toBeNull(); // The todo should not exist anymore
    });

});
