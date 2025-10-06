import React, { useState } from 'react';

const DeliveryLocationSelector: React.FC = () => {
  const [zip, setZip] = useState('');
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Simulate a map as a simple box for demo
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPin({ x, y });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip && pin) {
      setSubmitted(true);
    }
  };

  return (
    <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
      <h3 className="text-xl font-bold text-food-brown mb-2">Set Your Delivery Location</h3>
      {submitted ? (
        <div className="text-food-brown text-center">
          <p className="mb-2">Delivery set for zip code <span className="font-bold">{zip}</span></p>
          <p>Pin dropped at map location (<span className="font-mono">{pin?.x.toFixed(0)}, {pin?.y.toFixed(0)}</span>)</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
          <input
            type="text"
            value={zip}
            onChange={e => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
            placeholder="Enter Zip Code"
            className="w-full max-w-xs px-4 py-2 rounded-lg border border-food-brown focus:ring-2 focus:ring-food-yellow focus:border-transparent text-food-brown"
            required
          />
          <div className="relative w-full max-w-xs h-48 bg-food-yellow rounded-lg border-2 border-food-brown cursor-crosshair" onClick={handleMapClick}>
            {pin && (
              <div
                className="absolute w-6 h-6 bg-food-brown rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                style={{ left: pin.x - 12, top: pin.y - 12 }}
              >
                📍
              </div>
            )}
            <span className="absolute left-2 top-2 text-food-brown/60 text-xs">Click to drop pin</span>
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-lg font-medium mt-2"
            disabled={!zip || !pin}
          >
            Set Delivery Location
          </button>
        </form>
      )}
    </section>
  );
};

export default DeliveryLocationSelector;
