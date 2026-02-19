import { type StretchCategory } from '@/shared/categories';

/**
 * Stretch item fetched from the remote library.
 */
export interface Stretch {
  /** Stable identifier. */
  id: string;
  /** Human-friendly display name. */
  name: string;
  /** Stretch category key. */
  category: StretchCategory;
  /** Public GIF URL for animated guidance. */
  gifUrl: string;
  /** English-only instruction text. */
  instructions: string;
}
