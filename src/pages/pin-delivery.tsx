import React, { useState } from 'react';
import LiveOrderTracking from '../components/LiveOrderTracking';

const PinDeliveryPage: React.FC = () => {
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-6 text-food-brown">Pin Your Delivery Location</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mb-8">
        <input
          type="text"
          placeholder="Enter your address..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="border border-food-brown rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-food-brown"
          required
        />
        <button
          type="submit"
          className="bg-food-brown text-white py-2 px-4 rounded hover:bg-food-yellow hover:text-food-brown transition"
        >
          Pin Location
        </button>
      </form>
      {submitted && (
        <div className="mb-8 text-food-brown">
          <strong>Delivery will be sent to:</strong> {address}
        </div>
      )}
      <div className="w-full max-w-2xl">
        <LiveOrderTracking />
      </div>
    </div>
  );
};

export default PinDeliveryPage;
