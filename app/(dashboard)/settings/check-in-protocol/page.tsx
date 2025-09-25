import CheckInProtocolForm from '@/components/forms/checkin-protocol-form';

export default function Settings() {
  return (
    <div className="space-y-8">
      <div className="pb-4 border-b font-medium text-xl">
        <h1>Check-in Protocol</h1>
      </div>

      <CheckInProtocolForm />
    </div>
  );
}
