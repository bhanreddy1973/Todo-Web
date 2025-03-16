import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { isTodoCompleted } from './App'; // Import the function

describe('App Component Tests', () => {

    it('renders the main heading', () => {
        render(<App />);
        const headingElement = screen.getByText(/TO-DO-APP/i); // Using regex for case-insensitive match
        expect(headingElement).toBeInTheDocument();
    });

    it('renders the input field', () => {
        render(<App />);
        const inputElement = screen.getByPlaceholderText(/Enter Todo Item/i);
        expect(inputElement).toBeInTheDocument();
    });

    it('renders the add button', () => {
        render(<App />);
        const addButtonElement = screen.getByText(/ADD/i);
        expect(addButtonElement).toBeInTheDocument();
    });

  it('should check if a todo item is completed', () => {
    const todoItem = { completed: true };
    expect(isTodoCompleted(todoItem)).toBe(true);
  });

  it('should check if a todo item is not completed', () => {
    const todoItem = { completed: false };
    expect(isTodoCompleted(todoItem)).toBe(false);
  });


    // Example of testing an interaction (adding a todo) - **ASYNCHRONOUS TEST**
    it('allows adding a new todo item', async () => {
        render(<App />);
        const inputElement = screen.getByPlaceholderText(/Enter Todo Item/i);
        const addButtonElement = screen.getByText(/ADD/i);

        fireEvent.change(inputElement, { target: { value: 'Test Todo' } });
        fireEvent.click(addButtonElement);

        // Use waitFor to handle asynchronous updates to the component
        await waitFor(() => {
           // screen.getByText is not reliable if updates are not happening immediately
           const todoElement = screen.queryByText(/Test Todo/i); // queryByText returns null if not found
           expect(todoElement).toBeInTheDocument();
        }, {timeout: 2000}); // Optional: Timeout of 2 seconds
    });


});
