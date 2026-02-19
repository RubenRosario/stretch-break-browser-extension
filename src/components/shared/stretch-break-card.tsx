import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Reusable card used by popup and overlay placeholder screens.
 */
export function StretchBreakCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-3">
        <h1 className="text-lg font-semibold tracking-tight">Stretch Break</h1>
        <p className="text-sm text-muted-foreground">
          Build foundation is ready for reminder and break flows.
        </p>
        <Button aria-label="Start stretch break">Start Break</Button>
      </CardContent>
    </Card>
  );
}
