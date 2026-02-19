import { render, screen } from '@testing-library/react';

import { OverlayPlaceholder } from './overlay-placeholder';

describe('OverlayPlaceholder', () => {
  it('renders in stub mode', () => {
    render(<OverlayPlaceholder />);

    expect(screen.getByText('Overlay stub mode')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Stretch Break' })).toBeVisible();
  });
});
