import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/mvp-supabase';

interface WaitlistFormProps {
  variant?: 'hero' | 'cta';
}

export default function WaitlistForm({ variant = 'hero' }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!email.toLowerCase().endsWith('.edu')) {
      setError('Please use your college email (.edu)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('waitlist_entries')
        .insert([{ email: email.toLowerCase(), university: university || null }]);

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          setError('Something went wrong. Please try again.');
        }
      } else {
        setSuccess(true);
        setEmail('');
        setUniversity('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your college email (.edu)"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
            disabled={loading || success}
            required
          />
          <button
            type="submit"
            disabled={loading || success}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : success ? (
              'Joined!'
            ) : (
              <>
                Join Waitlist
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
        <input
          type="text"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          placeholder="University name (optional)"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
          disabled={loading || success}
        />
        {error && (
          <div className="bg-orange-50 border border-orange-300 text-orange-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-lg">
            🎉 You're on the list! We'll email you when we launch on your campus.
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your college email"
          className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
          disabled={loading || success}
          required
        />
        <button
          type="submit"
          disabled={loading || success}
          className="px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : success ? (
            'Joined!'
          ) : (
            'Get Early Access'
          )}
        </button>
      </div>
      <input
        type="text"
        value={university}
        onChange={(e) => setUniversity(e.target.value)}
        placeholder="University name (optional)"
        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-500"
        disabled={loading || success}
      />
      {error && (
  <div className="bg-orange-50 border border-orange-300 text-orange-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-white/20 text-white px-4 py-3 rounded-lg">
          🎉 You're on the list! Check your email for updates.
        </div>
      )}
    </form>
  );
}
