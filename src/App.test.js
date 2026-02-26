import { render, screen } from '@testing-library/react';

jest.mock('chinese-conv/dist', () => ({
  __esModule: true,
  tify: (value) => value,
  sify: (value) => value,
}));

import App from './App';

test('renders home tool list', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /擲硬幣/i })).toBeInTheDocument();
});
