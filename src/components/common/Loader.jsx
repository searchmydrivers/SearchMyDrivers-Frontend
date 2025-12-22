
const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#2BB673] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
