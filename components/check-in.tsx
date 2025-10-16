import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { CheckIcon, HealthIcon } from './icons';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export function UserCheckIn() {
  const activities = [
    {
      title: 'Health Check-In',
      date: '12th September, 2025 • 9:04 AM',
      status: 'Successful',
    },
    {
      title: 'Health Check-In',
      date: '10th August, 2025 • 9:04 AM',
      status: 'Successful',
    },
  ];
  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="secondary" startIcon={<HealthIcon className="text-[#F2F2F2]" />}>
          Check-In
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Check-In</SheetTitle>
          <Separator />
        </SheetHeader>

        <div className="px-4 space-y-8">
          {/* Health Protocol Card */}
          <Card className="bg-card shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <HealthIcon className="text-primary" />
                <CardTitle className="text-white font-medium">Health Protocol</CardTitle>
              </div>
              <Button size="sm" className="bg-success/10 text-success/100">
                <HealthIcon className="text-success/100" />
                Active
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Last Check-in:</p>
              <p className="text-base text-white">12th September, 2025</p>
            </CardContent>
          </Card>

          {/* Activity Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Activity</h2>
            <div className="space-y-4">
              {activities.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-zinc-800 rounded-full">
                      <CalendarDays className="text-muted-foreground" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <Button size="sm" startIcon={<CheckIcon />} className="bg-success/10 text-success/100">
                    {item.status}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
