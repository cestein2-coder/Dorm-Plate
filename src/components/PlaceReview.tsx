import React, { useState } from 'react';
import ReviewForm from './reviews/ReviewForm';

const PlaceReview: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-8 flex flex-col items-center">
      <button
        className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg"
        onClick={() => setOpen(true)}
      >
        Place a Review
      </button>
      {open && (
        <ReviewForm
          restaurantId="demo-restaurant"
          restaurantName="Demo Restaurant"
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default PlaceReview;
