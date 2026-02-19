import { render, screen } from '@testing-library/react';

import { PopupApp } from './popup-app';

describe('PopupApp', () => {
  it('renders the Stretch Break title', () => {
    render(<PopupApp />);

    expect(screen.getByRole('heading', { name: 'Stretch Break' })).toBeVisible();
  });
});
