import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../pages/Login';

// Mock do módulo api para não fazer chamadas reais
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Login', () => {
  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login setIsAuthenticated={vi.fn()} />
      </MemoryRouter>
    );

  test('renderiza o título da página', () => {
    renderLogin();
    expect(screen.getByText(/Agenda Médica/i)).toBeInTheDocument();
  });

  test('renderiza o campo de e-mail', () => {
    renderLogin();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  test('renderiza o campo de senha', () => {
    renderLogin();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  test('renderiza o botão de entrar', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });
});
