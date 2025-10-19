import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { CheckIcon, HealthIcon } from './icons';
import { Separator } from './ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCheckIns, usercheckIn } from '@/config/apis';
import { TERITAGES_KEY, USER_CHECK_IN } from '@/config/key';
import { toast } from 'sonner';
import ShowError from './errors/display-error';
import { useState } from 'react';
import { useApplications } from '@/context/dashboard-provider';
import { AxiosError } from 'axios';
import { TailSpinPreloader } from './icons/tail-spin-preloader';
import { ICheckIn, IUserCheckIn } from '@/type';
import { capitalizeFirstLetter } from '@/lib/utils';
import { format } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';

export function UserCheckIn({ buttonClassName }: { buttonClassName?: string }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const queryClient: any = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { userProfile } = useApplications();

  function getCheckInNote() {
    const messages = [
      `✅ ${capitalizeFirstLetter(userProfile?.name || '')}, you’ve successfully checked in! Keep the momentum going.`,
      `👏 Nice work, ${capitalizeFirstLetter(userProfile?.name || '')}! Check-in recorded.`,
      `🚀 ${capitalizeFirstLetter(userProfile?.name || '')}, your check-in was successful. Stay on track!`,
      `💪 ${capitalizeFirstLetter(userProfile?.name || '')}, you’re doing great — today’s check-in is complete.`,
    ];

    // pick a random encouraging note
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const { mutate, isPending } = useMutation({
    mutationFn: usercheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries(TERITAGES_KEY);
      queryClient.invalidateQueries(USER_CHECK_IN);
      toast.success('Checked in successfully');
    },
    onError: (error: any) => setErrorMessage(error?.response?.data?.message || 'An error occured while processing'),
  });

  const { data, isLoading, isError, error } = useQuery<ICheckIn, AxiosError>({
    queryFn: getCheckIns,
    queryKey: [USER_CHECK_IN],
  });

  const handleCheckIn = () => {
    mutate({ triggeredBy: userProfile?.name || '', note: getCheckInNote(), timestamp: new Date().toISOString() });
  };

  console.log({ data });

  return (
    <Sheet>
      <SheetTrigger className="w-full">
        <Button variant="secondary" startIcon={<HealthIcon className="text-[#F2F2F2]" />} className={buttonClassName}>
          Check-In
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto pb-5" side={isDesktop ? 'right' : 'bottom'}>
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
              <Button
                size="sm"
                variant="secondary"
                className="text-white"
                endIcon={<CheckIcon />}
                onClick={handleCheckIn}
                isLoading={isPending}
                loadingText="Please wait..."
              >
                Perform Check-In
              </Button>
            </CardHeader>
            <CardContent>
              <ShowError error={errorMessage} setError={setErrorMessage} />
              <p className="text-sm text-muted-foreground">Last Check-in:</p>
              {data && data?.checkIns?.length > 0 && (
                <p className="text-base text-white">{format(new Date(data?.checkIns[0].timestamp), 'do MMMM, yyyy • h:mm a')}</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Section */}
          <div>
            <h2 className="text-lg font-medium mb-4">Activity</h2>
            {isLoading && <TailSpinPreloader />}
            {isError && <p className="text-destructive texsm">{error?.message || 'An error occured while processing'}</p>}
            {data && (
              <div className="space-y-4">
                {data.checkIns.map((item: IUserCheckIn, index: number) => (
                  <div key={index} className="lg:flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-zinc-800 rounded-full">
                        <CalendarDays className="text-muted-foreground" size={18} />
                      </div>
                      <div className="space-y-2.5">
                        <p className="font-medium text-white">Health Check-In by {item.triggeredBy}</p>
                        <p className="text-white">{item.note}</p>
                        <p className="text-sm text-muted-foreground">{format(new Date(item.timestamp), 'do MMMM, yyyy • h:mm a')}</p>
                      </div>
                    </div>
                    <Button size="sm" startIcon={<CheckIcon />} className="bg-success/10 text-success/100 ml-10 mt-2 lg:ml-0 lg:mt-0">
                      Successful
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
