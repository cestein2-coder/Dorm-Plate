import React, { useState } from 'react';

const DeliveryTimePicker: React.FC = () => {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const times = [
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM',
    '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) setSubmitted(true);
  };

  return (
    <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
      <h3 className="text-xl font-bold text-food-brown mb-2">Choose Delivery Time</h3>
      {submitted ? (
        <div className="text-food-brown text-center">
          <p>Delivery time set for <span className="font-bold">{selected}</span></p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {times.map(time => (
              <button
                type="button"
                key={time}
                className={`px-3 py-1 rounded-full border font-medium ${selected === time ? 'bg-food-brown text-white border-food-brown' : 'bg-food-yellow text-food-brown border-food-brown'}`}
                onClick={() => setSelected(time)}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-lg font-medium mt-2"
            disabled={!selected}
          >
            Set Delivery Time
          </button>
        </form>
      )}
    </section>
  );
};

export default DeliveryTimePicker;
