
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, User } from 'lucide-react';

interface UserTypeSelectorProps {
  userType: 'personal' | 'company';
  onChange: (value: 'personal' | 'company') => void;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ userType, onChange }) => {
  return (
    <div className="space-y-2">
      <Label>Account Type</Label>
      <RadioGroup 
        value={userType}
        onValueChange={(value) => onChange(value as 'personal' | 'company')}
        className="grid grid-cols-2 gap-4"
      >
        <div className={`flex flex-col items-center justify-between rounded-md border p-4 ${userType === 'personal' ? 'border-blue-600 bg-blue-600/10' : 'border-gray-700 hover:border-blue-600/50'}`}>
          <RadioGroupItem value="personal" id="personal" className="sr-only" />
          <User className="h-6 w-6 mb-2" />
          <Label htmlFor="personal" className="cursor-pointer font-medium">Personal</Label>
        </div>
        
        <div className={`flex flex-col items-center justify-between rounded-md border p-4 ${userType === 'company' ? 'border-blue-600 bg-blue-600/10' : 'border-gray-700 hover:border-blue-600/50'}`}>
          <RadioGroupItem value="company" id="company" className="sr-only" />
          <Building2 className="h-6 w-6 mb-2" />
          <Label htmlFor="company" className="cursor-pointer font-medium">Company</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default UserTypeSelector;
