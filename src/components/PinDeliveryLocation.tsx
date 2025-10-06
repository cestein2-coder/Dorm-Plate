import React, { useState } from 'react';

interface PinDeliveryLocationProps {
  onLocationSet?: (address: string) => void;
}

const PinDeliveryLocation: React.FC<PinDeliveryLocationProps> = ({ onLocationSet }) => {
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (onLocationSet) {
      onLocationSet(address);
    }
  };

  return (
    <div className="bg-food-yellow rounded-lg shadow-md p-6 max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-food-brown">Pin Your Delivery Location</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        <div className="mt-4 text-food-brown">
          <strong>Delivery will be sent to:</strong> {address}
        </div>
      )}
    </div>
  );
};

export default PinDeliveryLocation;
