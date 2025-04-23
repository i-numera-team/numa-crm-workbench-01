
import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Mail, Check } from 'lucide-react';

export default function VerifyEmail() {
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Get email from location state
  const email = location.state?.email;
  
  // If no email in state, redirect to login
  if (!email) {
    return <Navigate to="/login" />;
  }
  
  const handleVerify = async () => {
    setIsVerifying(true);
    
    try {
      await verifyEmail(email);
      setIsVerified(true);
      
      // Start countdown for redirection
      let timeLeft = 5;
      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Auto redirect after verification
  useEffect(() => {
    if (isVerified && countdown <= 0) {
      // The redirection is handled by the verifyEmail function
    }
  }, [isVerified, countdown]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          {!isVerified ? (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-numa-100 p-3">
                  <Mail className="h-8 w-8 text-numa-500" />
                </div>
              </div>
              
              <h1 className="mt-4 text-xl font-semibold text-gray-900">Verify your email address</h1>
              
              <p className="mt-2 text-gray-600">
                We've sent a verification link to <span className="font-medium">{email}</span>.
                Please check your inbox and click the link to verify your email address.
              </p>
              
              <div className="mt-6">
                <p className="text-gray-500 text-sm mb-4">
                  For demo purposes, click the button below to simulate email verification:
                </p>
                
                <Button
                  onClick={handleVerify}
                  className="w-full bg-numa-500 hover:bg-numa-600"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Simulate Email Verification'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <h1 className="mt-4 text-xl font-semibold text-gray-900">Email verified successfully!</h1>
              
              <p className="mt-2 text-gray-600">
                Your email has been verified. You will be redirected to the login page in {countdown} seconds.
              </p>
              
              <div className="mt-6">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-numa-500 hover:bg-numa-600"
                >
                  Go to Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
