
import { useEffect, useState } from 'react';
import { Truck, Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  timeout?: number;
}

const LoadingSpinner = ({ size = 40, message, timeout = 10000 }: LoadingSpinnerProps) => {
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    // Set timeout for showing additional user feedback
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      console.log('Loading timeout reached');
    }, timeout);

    // Track loading time
    const interval = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [timeout]);

  // Show different messages based on loading time
  const getTimeoutMessage = () => {
    if (loadingTime > 15) {
      return "This is taking longer than expected. You may want to refresh the page.";
    } else if (loadingTime > 5) {
      return "Still loading... please wait a moment.";
    }
    return null;
  };

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
        
        {timeoutReached && (
          <div className="mt-2 text-sm text-amber-600">
            {getTimeoutMessage() || "Taking longer than expected..."}
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
