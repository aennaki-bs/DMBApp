
import { Button } from '@/components/ui/button';

interface CreateCircuitStepTwoProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onNext: () => void;
  onBack: () => void;
}

export default function CreateCircuitStepTwo({
  value,
  onChange,
  disabled,
  onNext,
  onBack
}: CreateCircuitStepTwoProps) {
  return (
    <>
      <div>
        <label className="block text-blue-200 font-medium mb-2" htmlFor="descriptif-step">
          Description
        </label>
        <textarea
          id="descriptif-step"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter circuit description (optional)"
          disabled={disabled}
          className="bg-[#0a1033] border-blue-800/80 text-blue-100 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500/80 min-h-[100px] w-full rounded px-3 py-2"
        />
      </div>
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={disabled}
          className="bg-black border-none text-gray-200 hover:bg-blue-950"
        >
          ← Back
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
