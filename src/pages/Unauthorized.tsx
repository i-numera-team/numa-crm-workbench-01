
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Unauthorized() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Unauthorized Access
          </h1>
          
          <p className="mt-2 text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          
          <div className="mt-6 space-y-2">
            <Button
              asChild
              className="w-full bg-numa-500 hover:bg-numa-600"
            >
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            
            <Button
              onClick={logout}
              className="w-full bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
