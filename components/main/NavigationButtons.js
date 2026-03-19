import Link from 'next/link';

const NavigationButtons = () => {
  return (
    <div className="flex gap-3 mt-2">
      <Link href="/login">
        <button className="bg-[#18181b] border border-[#3d3d3f] text-white hover:border-purple-500 rounded-lg px-6 py-2 text-sm font-medium transition">
          Log In
        </button>
      </Link>
      <Link href="/signup">
        <button className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-6 py-2 text-sm font-medium transition">
          Sign Up
        </button>
      </Link>
    </div>
  );
};

export default NavigationButtons;