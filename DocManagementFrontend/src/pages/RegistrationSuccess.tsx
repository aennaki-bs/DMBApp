
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import DocuVerseLogo from '@/components/DocuVerseLogo';

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleVerification = () => {
    navigate(`/verify/${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md text-center">
        <DocuVerseLogo className="mx-auto mb-8 h-10 text-docuBlue" />
        
        <Card className="bg-[#121212] border-blue-900/30 shadow-xl">
          <CardContent className="pt-8 pb-6 flex flex-col items-center">
            <div className="bg-green-500/20 rounded-full p-4 mb-4">
              <Check className="h-12 w-12 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Registration Successful!
            </h2>
            
            <div className="space-y-4 mb-6">
              <p className="text-blue-300">
                Thank you for joining DocuVerse!
              </p>
              
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-300">
                Please verify your email address before logging in. We've sent a verification code to:
                <div className="font-medium mt-1">{email}</div>
              </div>
            </div>
            
            <Button 
              onClick={handleVerification}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Verify Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
