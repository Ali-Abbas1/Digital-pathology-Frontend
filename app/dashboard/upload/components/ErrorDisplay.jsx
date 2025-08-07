import { AlertCircle } from 'lucide-react';

export const ErrorDisplay = ({ error, onRetry }) => {
    if (!error) return null;

    return (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                        Upload Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        {error}
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
