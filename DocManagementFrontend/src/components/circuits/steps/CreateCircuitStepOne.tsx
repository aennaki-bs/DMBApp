
import { Button } from '@/components/ui/button';

interface CreateCircuitStepOneProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onNext: () => void;
  onCancel: () => void;
}

export default function CreateCircuitStepOne({
  value,
  onChange,
  error,
  disabled,
  onNext,
  onCancel,
}: CreateCircuitStepOneProps) {
  return (
    <>
      <div>
        <label className="block text-blue-200 font-medium mb-2" htmlFor="title-step">
          Circuit Title *
        </label>
        <input
          type="text"
          id="title-step"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter circuit title"
          autoFocus
          className="bg-[#0a1033] border-blue-800/80 text-blue-100 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500/80 h-11 w-full rounded px-3"
        />
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={disabled}
          className="bg-black border-none text-gray-200 hover:bg-blue-950"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Next <span className="ml-1">→</span>
        </Button>
      </div>
    </>
  );
}
