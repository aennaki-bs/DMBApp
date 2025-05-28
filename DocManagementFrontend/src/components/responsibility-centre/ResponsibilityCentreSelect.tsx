import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Building2, Loader2, AlertTriangle } from 'lucide-react';
import responsibilityCentreService from '@/services/responsibilityCentreService';
import { ResponsibilityCentreSimple } from '@/models/responsibilityCentre';
import { toast } from 'sonner';

interface ResponsibilityCentreSelectProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ResponsibilityCentreSelect = ({
  value,
  onValueChange,
  label = 'Responsibility Centre',
  placeholder = 'Select a responsibility centre',
  required = false,
  disabled = false,
  className = '',
}: ResponsibilityCentreSelectProps) => {
  const [centres, setCentres] = useState<ResponsibilityCentreSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const data = await responsibilityCentreService.getSimple();
        setCentres(data);
      } catch (error) {
        console.error('Failed to fetch responsibility centres:', error);
        setHasError(true);
        // Don't show toast error during registration as it's optional
        if (window.location.pathname !== '/register') {
          toast.error('Failed to load responsibility centres');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCentres();
  }, []);

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'none') {
      onValueChange(undefined);
    } else {
      onValueChange(parseInt(selectedValue));
    }
  };

  if (hasError) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label className="text-sm font-medium">
            <Building2 className="h-4 w-4 inline mr-2" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="flex items-center space-x-2 p-3 border border-amber-600 bg-amber-900/20 rounded-md">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-300">
            Unable to load responsibility centres. Please contact administration if you need to assign one.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="responsibility-centre-select" className="text-sm font-medium">
          <Building2 className="h-4 w-4 inline mr-2" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value ? value.toString() : undefined}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id="responsibility-centre-select" className="w-full">
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {!required && (
            <SelectItem value="none">
              <span className="text-gray-500">No responsibility centre</span>
            </SelectItem>
          )}
          {centres.map((centre) => (
            <SelectItem key={centre.id} value={centre.id.toString()}>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{centre.code}</span>
                <span className="text-gray-500">-</span>
                <span>{centre.descr}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}; 