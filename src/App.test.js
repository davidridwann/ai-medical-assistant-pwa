import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AI helper welcome screen', () => {
  render(<App />);
  expect(screen.getByText(/AI helper/i)).toBeInTheDocument();
  expect(screen.getByText(/Your smart assistant for medicine dose/i)).toBeInTheDocument();
});
