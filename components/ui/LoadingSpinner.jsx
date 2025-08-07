// export const LoadingSpinner = () => (
//     <div className="flex items-center justify-center space-x-2">
//       <div className="w-4 h-4 bg-white rounded-full animate-bounce" />
//       <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-100" />
//       <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-200" />
//     </div>
//   );

const LoadingSpinner = ({ progress }) => {
  return (
    <div className="flex flex-row items-center justify-center w-full h-screen">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      {progress !== undefined && (
        <div className="text-sm text-gray-600">
          Loading: {progress}%
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;