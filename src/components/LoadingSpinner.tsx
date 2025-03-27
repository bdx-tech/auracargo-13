
import { useEffect, useState } from 'react';
import { Truck } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  timeout?: number; // Add timeout prop with default
}

const LoadingSpinner = ({ size = 40, message, timeout = 5000 }: LoadingSpinnerProps) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  useEffect(() => {
    // Show timeout message after specified time
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, timeout);
    
    return () => clearTimeout(timeoutId);
  }, [timeout]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center">
        <div className="animate-bounce mb-4">
          <div className="h-16 w-16 bg-kargon-red rounded-full flex items-center justify-center">
            <Truck className="text-white" size={size} />
          </div>
        </div>
        <div className="text-2xl font-bold text-kargon-dark">AuraCargo</div>
        
        {message && <div className="mt-2 text-sm text-gray-500">{message}</div>}
        
        {showTimeoutMessage && !message && (
          <div className="mt-2 text-sm text-gray-500">
            This is taking longer than expected. Please be patient...
          </div>
        )}
        
        <div className="mt-4 flex space-x-1">
          <div className="h-3 w-3 bg-kargon-red rounded-full animate-pulse"></div>
          <div className="h-3 w-3 bg-kargon-red rounded-full animate-pulse delay-150"></div>
          <div className="h-3 w-3 bg-kargon-red rounded-full animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
