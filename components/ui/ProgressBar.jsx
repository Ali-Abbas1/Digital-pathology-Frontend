export const ProgressBar = ({ progress }) => (
    <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <div className="mt-2 text-white text-center">
        {Math.round(progress)}% loaded
      </div>
    </div>
  );