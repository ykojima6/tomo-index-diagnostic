import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Diagnostic from '../Diagnostic';
import { DiagnosticProvider } from '../../state/DiagnosticContext';

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/diagnostic' }]}> 
      <DiagnosticProvider>{ui}</DiagnosticProvider>
    </MemoryRouter>
  );

describe('Diagnostic page', () => {
  it('disables Next until an option is selected', () => {
    renderWithProviders(<Diagnostic />);
    const next = screen.getByRole('button', { name: '次へ' });
    expect(next).toBeDisabled();
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[radios.length - 1]);
    expect(next).not.toBeDisabled();
  });

  it('enables Finish when all 6 questions answered', () => {
    renderWithProviders(<Diagnostic />);
    for (let i = 0; i < 6; i++) {
      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[radios.length - 1]);
      if (i < 5) {
        const next = screen.getByRole('button', { name: '次へ' });
        fireEvent.click(next);
      }
    }
    const finish = screen.getByRole('button', { name: '診断結果を見る' });
    expect(finish).not.toBeDisabled();
  });
});

