
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, ChevronLeft } from 'lucide-react';
import DocuVerseLogo from '@/components/DocuVerseLogo';
import authService from '@/services/authService';
import { Input } from '@/components/ui/input';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const { email } = useParams<{ email?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      console.log("No email found in URL params");
    }
  }, [email]);

  const handleResendCode = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is missing. Please ensure you have a valid email.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.resendVerificationCode(email);
      toast({
        title: "Success",
        description: "Verification code has been resent to your email.",
      });
    } catch (error: any) {
      console.error("Error resending verification code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resend verification code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    if (!email) {
      setError("Email is missing. Please ensure you have a valid email in the URL.");
      setIsLoading(false);
      return;
    }

    if (!verificationCode) {
      setError("Please enter the verification code sent to your email.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await authService.verifyEmail(email, verificationCode);
      if (success) {
        toast({
          title: "Success",
          description: "Email verified successfully!",
        });
        navigate('/welcome', { 
          state: { 
            verified: true,
            email: email
          }
        });
      } else {
        setError("Invalid verification code.");
      }
    } catch (error: any) {
      console.error("Email verification error:", error);
      setError("Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] p-4">
      <Card className="w-full max-w-md border-gray-800 bg-gradient-to-b from-[#161b22] to-[#0d1117] shadow-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center pb-2 px-8 pt-6 border-b border-gray-800">
          <DocuVerseLogo className="mx-auto h-10 w-auto text-blue-500" />
          <CardTitle className="text-2xl font-semibold text-white mt-4 text-center">Email Verification</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 pt-6">
          {/* Progress Steps */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          </div>
          
          <div className="mx-auto bg-blue-900/20 rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm">We've sent a verification code to:</p>
            <p className="font-medium text-blue-400 mt-1">{email}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="code" className="text-gray-300 text-center block">Verification Code</Label>
            <Input
              id="code"
              placeholder="Enter 6-digit code"
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                setVerificationCode(onlyNumbers);
              }}
              className="bg-[#1c2333] border-gray-700 text-white text-center text-lg tracking-wider"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-md p-4">
              <p className="text-red-400 text-center font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <Button 
              onClick={handleVerifyEmail} 
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
            
            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </div>
          
          <div className="flex justify-center pt-4 border-t border-gray-800 mt-4">
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
