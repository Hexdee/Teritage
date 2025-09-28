import { TriangleAlert, X } from 'lucide-react';

export default function ShowError({ error, setError }: { error?: string | null; setError?: (arg: string) => void }) {
  return (
    <div className="w3-animate-opacity">
      {error && (
        <div className="text-sm justify-between animate-caret-non-blink text-[#E50101] max-h-[100px] border border-destructive rounded-md p-4 overflow-y-auto bg-[#FEEFF0] flex items-start space-x-2">
          <div className="flex space-x-2">
            <TriangleAlert size={18} />
            <p>{error}</p>
          </div>
          {setError && <X size={20} onClick={() => setError('')} role="button" />}
        </div>
      )}
    </div>
  );
}
