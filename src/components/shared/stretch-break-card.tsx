import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_SETTINGS, type Settings } from '@/shared';

/**
 * Props for the shared Stretch Break card.
 */
export interface StretchBreakCardProps {
  /** Optional settings payload used for read-only preview values. */
  settings?: Settings;
}

/**
 * Reusable card used by popup and overlay placeholder screens.
 */
export function StretchBreakCard({ settings = DEFAULT_SETTINGS }: StretchBreakCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="space-y-3">
        <h1 className="text-lg font-semibold tracking-tight">Stretch Break</h1>
        <p className="text-sm text-muted-foreground">
          Build foundation is ready for reminder and break flows.
        </p>
        <Input
          aria-label="Reminder interval"
          placeholder="Reminder interval (minutes)"
          value={String(settings.reminderIntervalMinutes)}
          readOnly
        />
        <Select defaultValue={String(settings.stretchDurationSeconds)}>
          <SelectTrigger aria-label="Stretch duration">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="45">45 seconds</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
          <span className="text-sm">Reminders enabled</span>
          <Switch aria-label="Reminders enabled" checked={settings.remindersEnabled} disabled />
        </div>
        <Button aria-label="Start stretch break">Start Break</Button>
      </CardContent>
    </Card>
  );
}
