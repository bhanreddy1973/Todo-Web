import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TodoItem from './TodoItem';

describe('TodoItem component tests', () => {
  it('should render the TodoItem component', () => {
    const { getByText } = render(<TodoItem name="Test Todo" id="123" completed={false} setItems={() => { }} />);
    expect(getByText('Test Todo')).toBeInTheDocument();
  });

  it('should toggle completion state', () => {
    const setItems = jest.fn();
    const { getByRole } = render(<TodoItem name="Test Todo" id="123" completed={false} setItems={setItems} />);
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(setItems).toHaveBeenCalledTimes(1);
  });
});
