'use client';

import { Switch } from "@/app/components/ui/switch"
import { Label } from "@/app/components/ui/label"

interface TrackingModeSwitchProps {
  trackingMode: 'repo' | 'user';
  onModeChange: (mode: 'repo' | 'user') => void;
}

export function TrackingModeSwitch({ trackingMode, onModeChange }: TrackingModeSwitchProps) {
  return (
    <div className="flex items-center space-x-2 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Switch
        id="tracking-mode"
        checked={trackingMode === 'user'}
        onCheckedChange={(checked) => onModeChange(checked ? 'user' : 'repo')}
      />
      <Label htmlFor="tracking-mode" className="text-sm font-medium dark:text-gray-200">
        {trackingMode === 'repo' ? 'Track Repository' : 'Track User'} Activities
      </Label>
    </div>
  );
} 