'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import api from '../api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

const Signup = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData) => {
    try {
      const response = await api.post('/signup', formData);
      Cookies.set('token', response.data.token, { expires: 90, sameSite: 'lax' });
      toast.success('Account created!');
      router.push('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#18181b] rounded-2xl shadow-2xl p-8 border border-[#3d3d3f]">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">CodeBox</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
        <p className="text-[#adadb8] text-sm mb-7">
          Already have an account?{' '}
          <a href="/login" className="text-purple-400 hover:text-purple-300 transition font-medium">Sign in</a>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#dedee3] mb-1.5">Username</label>
            <input {...register('name')} type="text" placeholder="cooluser123"
              className="w-full bg-[#0e0e10] border border-[#3d3d3f] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-[#6b6b7b] transition" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#dedee3] mb-1.5">Email</label>
            <input {...register('email')} type="email" placeholder="you@example.com"
              className="w-full bg-[#0e0e10] border border-[#3d3d3f] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-[#6b6b7b] transition" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#dedee3] mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                className="w-full bg-[#0e0e10] border border-[#3d3d3f] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-[#6b6b7b] pr-16 transition" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b7b] hover:text-[#dedee3] transition text-xs font-medium">
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#dedee3] mb-1.5">Confirm Password</label>
            <input {...register('passwordConfirm')} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
              className="w-full bg-[#0e0e10] border border-[#3d3d3f] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-[#6b6b7b] transition" />
            {errors.passwordConfirm && <p className="text-red-400 text-xs mt-1">{errors.passwordConfirm.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition duration-200 mt-2">
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;