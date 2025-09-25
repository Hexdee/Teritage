import NotificationForm from '@/components/forms/notification-form';

export default function Settings() {
  return (
    <div className="space-y-8">
      <div className="pb-4 border-b font-medium text-xl">
        <h1>Notifications</h1>
      </div>

      <NotificationForm />
    </div>
  );
}
