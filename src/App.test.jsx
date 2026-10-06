import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza a tela inicial de login do ObraVoz', async () => {
  render(<App />);
  
  // Verifica se o título do app é exibido
  const tituloElement = await screen.findByText(/ObraVoz/i);
  expect(tituloElement).toBeDefined();

  // Verifica se o botão de entrar no login está presente
  const botaoEntrar = screen.getByRole('button', { name: /Entrar/i });
  expect(botaoEntrar).toBeDefined();
});
