import React, { useState } from 'react';
import { supabase } from '../lib/mvp-supabase';

interface WaitlistEntry {
  name: string;
  email: string;
}

const UserSignupWaitlist: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setWaitlist([...waitlist, { name, email }]);
      setMessage('Signup successful! You are added to the waitlist.');
      setName('');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Login successful!');
      setName('');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="bg-food-yellow rounded-lg shadow-md p-6 max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-food-brown">{isLogin ? 'Login' : 'Sign Up & Join Waitlist'}</h2>
      <form onSubmit={isLogin ? handleLogin : handleSignup} className="flex flex-col gap-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border border-food-brown rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-food-brown"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-food-brown rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-food-brown"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-food-brown rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-food-brown"
          required
        />
        <button
          type="submit"
          className="bg-food-brown text-white py-2 px-4 rounded hover:bg-food-yellow hover:text-food-brown transition"
          disabled={loading}
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <button
        className="mt-2 text-food-brown underline"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Need to sign up?' : 'Already have an account? Login'}
      </button>
      {message && <div className="mt-4 text-food-brown">{message}</div>}
      {!isLogin && waitlist.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-food-brown mb-2">Waitlist:</h3>
          <ul className="list-disc pl-5">
            {waitlist.map((entry, idx) => (
              <li key={idx} className="text-food-brown">{entry.name} ({entry.email})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSignupWaitlist;
