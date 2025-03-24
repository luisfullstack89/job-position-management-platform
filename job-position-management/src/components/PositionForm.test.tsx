// @ts-ignore
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PositionForm from './PositionForm';
// src/setupTests.js
import '@testing-library/jest-dom';


const mockOnSuccess = jest.fn();

describe('PositionForm', () => {
  test('shows validation errors when form is submitted with empty fields', () => {
    render(<PositionForm onSuccess={mockOnSuccess} />);

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    expect(screen.getByText('Position Number cannot be empty.')).toBeInTheDocument();
    expect(screen.getByText('Budget must be non-negative.')).toBeInTheDocument();
  });

  test('does not show validation errors when form is filled correctly', () => {
    render(<PositionForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText('Position Number'), { target: { value: 12 } });
    fireEvent.change(screen.getByLabelText('Budget'), { target: { value: '1000' } });

    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    expect(screen.queryByText('Position Number cannot be empty.')).not.toBeInTheDocument();
    expect(screen.queryByText('Budget must be non-negative.')).not.toBeInTheDocument();
  });
});
