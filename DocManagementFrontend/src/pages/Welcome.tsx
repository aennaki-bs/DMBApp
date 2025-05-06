
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import DocuVerseLogo from '@/components/DocuVerseLogo';

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const verified = location.state?.verified || false;
  const userEmail = location.state?.email || '';

  useEffect(() => {
    if (verified) {
      toast.success('Registration completed successfully!', {
        description: 'Welcome to DocuVerse!',
      });
    }
  }, [verified]);

  const handleContinue = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md text-center">
        <DocuVerseLogo className="mx-auto mb-8 h-10 text-docuBlue" />
        
        <Card className="bg-[#121212] border-blue-900/30 shadow-xl">
          <CardContent className="pt-8 pb-0 flex flex-col items-center">
            <div className="bg-green-500/20 rounded-full p-4 mb-4">
              <Check className="h-12 w-12 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Registration Complete
            </h2>
            
            <p className="text-blue-300 mb-4">
              Your account has been verified and is ready to use
            </p>
            
            {userEmail && (
              <p className="text-sm text-gray-400 mb-4">
                You've successfully registered with {userEmail}
              </p>
            )}
            
            <p className="text-sm text-gray-300 max-w-[300px] px-4">
              Thank you for joining DocuVerse! You can now sign in to your 
              account and start managing your documents securely.
            </p>
          </CardContent>
          
          <CardFooter className="p-6 pt-0">
            <Button 
              onClick={handleContinue} 
              className="w-full bg-docuBlue hover:bg-docuBlue-700 text-white"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
