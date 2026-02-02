'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface OpeningHoursTabProps {
  formData: any;
  setFormData: (data: any) => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function OpeningHoursTab({ formData, setFormData }: OpeningHoursTabProps) {
  const openingTimes = formData.opening_times || {};

  const handleDayToggle = (day: string, isOpen: boolean) => {
    const newOpeningTimes = { ...openingTimes };
    if (isOpen) {
      newOpeningTimes[day] = { open: '09:00', close: '17:00' };
    } else {
      delete newOpeningTimes[day];
    }
    setFormData({ ...formData, opening_times: newOpeningTimes });
  };

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    const newOpeningTimes = {
      ...openingTimes,
      [day]: {
        ...openingTimes[day],
        [field]: value,
      },
    };
    setFormData({ ...formData, opening_times: newOpeningTimes });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-slate-700 mb-4">
        <Clock className="h-5 w-5" />
        <div>
          <h3 className="font-semibold">Opening Hours</h3>
          <p className="text-sm text-slate-500">
            Set the opening hours for each day of the week
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {daysOfWeek.map(({ key, label }) => {
          const isOpen = !!openingTimes[key];
          const hours = openingTimes[key] || { open: '09:00', close: '17:00' };

          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Switch
                      id={`${key}-toggle`}
                      checked={isOpen}
                      onCheckedChange={(checked) => handleDayToggle(key, checked)}
                    />
                    <Label htmlFor={`${key}-toggle`} className="font-medium cursor-pointer">
                      {label}
                    </Label>
                  </div>

                  {isOpen ? (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor={`${key}-open`} className="text-sm text-slate-600 min-w-[50px]">
                          Opens:
                        </Label>
                        <Input
                          id={`${key}-open`}
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                          className="max-w-[130px]"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <Label htmlFor={`${key}-close`} className="text-sm text-slate-600 min-w-[50px]">
                          Closes:
                        </Label>
                        <Input
                          id={`${key}-close`}
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                          className="max-w-[130px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Closed</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Toggle each day on or off, then set the opening and closing times. Times should be in 24-hour format.
        </p>
      </div>
    </div>
  );
}
