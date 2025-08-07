export const ProgressBar = ({ progress, status, showPercentage = true }) => {
    const getStatusColor = () => {
        switch (status) {
            case 'uploading': return 'bg-blue-600';
            case 'processing': return 'bg-yellow-500';
            case 'completed': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-300';
        }
    };

    return (
        <div className="w-full">
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${getStatusColor()}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {showPercentage && (
                <div className="mt-1 text-sm text-gray-600 text-right">
                    {Math.round(progress)}%
                </div>
            )}
        </div>
    );
};
