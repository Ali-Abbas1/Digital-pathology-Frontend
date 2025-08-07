// export const ErrorMessage = ({ message }) => (
//     <div className="absolute inset-0 flex items-center justify-center bg-red-50">
//       <div className="p-4 text-red-600 bg-white rounded-lg shadow">
//         {message}
//       </div>
//     </div>
//   );

const ErrorMessage = ({ message }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;