'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';

// Props: form (react-hook-form instance)
type PreferredDayProps = {
  form: any;
  name: string;
};

export function PreferredDaySelector({ form, name }: PreferredDayProps) {
  const [open, setOpen] = React.useState(false);
  const days = Array.from({ length: 28 }, (_, i) => i + 1);

  const checkDate = () => {
    if (Number(form.getValues('preferredDay')) > 3 && Number(form.getValues('preferredDay')) < 29) {
      return 'th';
    } else if (form.getValues('preferredDay') === '1') {
      return 'st';
    } else if (form.getValues('preferredDay') === '2') {
      return 'nd';
    } else if (form.getValues('preferredDay') === '3') {
      return '3rd';
    } else {
      return ' day';
    }
  };

  const day = form.getValues('preferredDay') ? `On the ${form.getValues('preferredDay')}${checkDate()}` : 'Select day of the month';

  return (
    <div className="space-y-2">
      <Label className="text-inverse">Which day of the month?</Label>
      <Button variant="secondary" type="button" onClick={() => setOpen(true)}>
        <div className="flex w-full justify-between items-center font-light">
          <p>{day}</p>
          <ChevronDown size={16} />
        </div>
      </Button>
      {form.formState.errors.preferredDay && <p className="text-destructive text-sm">{form.formState.errors.preferredDay.message as string}</p>}

      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-inverse font-medium">Select Preferred Day</DialogTitle>
              <Separator />
            </DialogHeader>

            <FormField
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="grid grid-cols-7 gap-3">
                      {days.map((day) => {
                        const selected = field.value === String(day);
                        return (
                          <Button
                            key={day}
                            type="button"
                            onClick={() => {
                              field.onChange(String(day));
                              setOpen(false);
                            }}
                            className={`h-10 w-10 rounded-full p-0 text-sm ${selected ? 'bg-blue-600 text-inverse' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                          >
                            {day}
                          </Button>
                        );
                      })}

                      {/* Last Day option */}
                      <Button
                        type="button"
                        onClick={() => {
                          field.onChange('last');
                          setOpen(false);
                        }}
                        className={`col-span-2 rounded-full ${field.value === 'last' ? 'bg-blue-600 text-inverse' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                      >
                        Last Day
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
