
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Check, ArrowLeft } from 'lucide-react';
import DocuVerseLogo from '@/components/DocuVerseLogo';
import { toast } from 'sonner';
import authService from '@/services/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address to continue');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      setIsSuccess(true);
      toast.success('A password reset link has been sent to your email.');
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Handle email not verified case - but don't redirect
      if (err.message?.includes('Email not verified')) {
        toast.info('Your email is not verified. A new verification code has been sent to your inbox.');
        setError('Your email is not verified. A verification code has been sent to your inbox.');
        return;
      }
      
      // Handle specific error cases with user-friendly messages
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data;
        
        if (status === 404) {
          setError('No account exists with this email address. Please check your email or create a new account.');
        } else if (status === 401 && errorMessage.includes('Desactivated')) {
          setError('Your account has been deactivated. Please contact support for assistance.');
        } else {
          setError(errorMessage || 'An unexpected error occurred. Please try again later.');
        }
      } else if (err.request) {
        setError('Unable to reach the server. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      
      toast.error(error || 'Failed to process your request.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <DocuVerseLogo className="mx-auto h-14 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-white">
              Reset Link Sent
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Check your email inbox for instructions
            </p>
          </div>
          
          <div className="border border-gray-800 bg-[#161b22] rounded-lg shadow-xl p-8">
            <div className="space-y-6">
              <div className="mx-auto bg-green-900/30 rounded-full p-3 w-16 h-16 flex items-center justify-center border border-green-700">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-center text-white">Success!</h3>
            
              <div className="space-y-4 text-center">
                <p className="text-gray-300">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-white bg-[#1c2128] py-2 px-4 rounded-md">{email}</p>
                <p className="text-sm text-gray-400">
                  Please check your email and follow the instructions to reset your password.
                  If you don't see the email in your inbox, please check your spam folder.
                </p>
              </div>
              
              <Link to="/login" className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
                  Return to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <DocuVerseLogo className="mx-auto h-14 w-auto" />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>
        
        <div className="border border-gray-800 bg-[#161b22] rounded-lg shadow-xl p-6">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-800 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  className={`pl-10 border-gray-700 bg-[#0d1117] text-gray-300 ${error ? 'border-red-500' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 relative overflow-hidden group"
              disabled={isLoading}
            >
              <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></span>
              <span className="relative z-10">
                {isLoading ? 'Processing...' : 'Send Reset Link'}
              </span>
            </Button>
            
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-800 mt-4">
              <ArrowLeft size={16} className="text-gray-400" />
              <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
