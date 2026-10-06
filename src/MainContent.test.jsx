import { expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MainContent from './MainContent';
import { AuthProvider } from './context/AuthContext';

// Mock do jsPDF para evitar erros no ambiente Node do Vitest
vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    splitTextToSize: vi.fn().mockReturnValue(['teste']),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    save: vi.fn(),
  })),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

test('renderiza o formulário principal e permite escrever no relato', () => {
  render(
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );

  const textarea = screen.getByPlaceholderText(/Relate o trabalho de hoje/i);
  expect(textarea).toBeDefined();

  fireEvent.change(textarea, { target: { value: 'Betonagem de 3 pilares concluída.' } });
  expect(textarea.value).toBe('Betonagem de 3 pilares concluída.');
});

test('exibe o botão de Gerar Relatório PDF', () => {
  render(
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );

  const btnPDF = screen.getByText(/Gerar Relatório PDF/i);
  expect(btnPDF).toBeDefined();
});
