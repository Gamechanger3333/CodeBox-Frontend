'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for showing password

  const router = useRouter();

 

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Add password confirmation check
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/signup', {
  name,
  email,
  password,
  passwordConfirm: confirmPassword
});

      const data = response.data;
      console.log(data)



      if (data.error) {
        alert('Error occurred: ' + data.error);
      } else {
        Cookies.set("token", data.token)
        router.push("/")
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup. Please try again.');
    }

    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="bg-gray-200 w-full min-h-screen flex items-center justify-center">
      <div className="lg:flex items-center space-x-16">
        <div className="w-5/6 md:w-3/4 lg:w-2/3 xl:w-[500px] 2xl:w-[550px] mt-8 mx-auto px-16 py-8 rounded-lg">
          <h2 className="text-center text-2xl font-bold tracking-wide text-gray-800">Sign Up</h2>
          <p className="text-center text-sm text-gray-600 mt-2">
            Already have an account?{' '}
            <a href="login" className="text-blue-600 hover:text-blue-700 hover:underline" title="Sign In">
              Sign in here
            </a>
          </p>

          <form onSubmit={handleSubmit} className="my-8 text-sm">
            <div className="flex flex-col my-4">
              <label htmlFor="name" className="text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                name="name"
                id="name"
                className="mt-2 p-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 rounded text-sm text-gray-900"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="flex flex-col my-4">
              <label htmlFor="email" className="text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                id="email"
                className="mt-2 p-2 border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 rounded text-sm text-gray-900"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="flex flex-col my-4">
              <label htmlFor="password" className="text-gray-700">Password</label>
              <div className="relative flex items-center mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  id="password"
                  className="flex-1 p-2 border pr-10 border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 rounded text-sm text-gray-900"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 bg-transparent flex items-center justify-center text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col my-4">
              <label htmlFor="password_confirmation" className="text-gray-700">Password Confirmation</label>
              <div className="relative flex items-center mt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  name="password_confirmation"
                  id="password_confirmation"
                  className="flex-1 p-2 pr-10 border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 rounded text-sm text-gray-900"
                  placeholder="Enter your password again"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 bg-transparent flex items-center justify-center text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" name="remember_me" id="remember_me" className="mr-2 focus:ring-0 rounded" />
              <label htmlFor="remember_me" className="text-gray-700">
                I accept the{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">terms</a> and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">privacy policy</a>
              </label>
            </div>

            <div className="my-4 flex items-center justify-end space-x-4">
              <button type="submit" className="bg-slate-500 text-white hover:bg-slate-600 rounded-lg px-8 py-2 text-gray-100 hover:shadow-xl transition duration-150 uppercase">
                Sign Up
              </button>
            </div>
          </form>
        </div>
        <div className="flex items-center justify-center">
          <svg
            className="w-[300px] lg:w-[400px] xl:w-[450px] 2xl:w-[500px] h-[300px] lg:h-[400px] xl:h-[450px] 2xl:h-[500px] mt-8 lg:mt-0"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.366 7.1a1.455 1.455 0 011.455 1.456v7.437a1.455 1.455 0 01-2.91 0V8.555c0-.803.652-1.456 1.455-1.456zM11.999 4a1.455 1.455 0 011.455 1.455v13.018a1.455 1.455 0 01-2.91 0V5.455C10.544 4.652 11.196 4 11.999 4zM18.634 10.318a1.455 1.455 0 011.456 1.456v3.619a1.455 1.455 0 01-2.91 0v-3.619c0-.804.652-1.456 1.454-1.456z"
              fill="#30C88F"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Signup;
