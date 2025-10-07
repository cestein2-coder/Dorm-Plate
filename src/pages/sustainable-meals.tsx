import React from 'react';

const sustainableMeals = [
  {
    name: 'Farm-to-Table Salad',
    description: 'Locally sourced greens, organic veggies, and house vinaigrette.',
    restaurant: 'Green Eats Cafe',
    location: '123 Main St',
  },
  {
    name: 'Vegan Grain Bowl',
    description: 'Quinoa, roasted chickpeas, seasonal veggies, tahini dressing.',
    restaurant: 'Earth Bowl',
    location: '456 Oak Ave',
  },
  {
    name: 'Sustainable Sushi',
    description: 'Wild-caught fish, organic rice, local seaweed.',
    restaurant: 'Ocean Roll',
    location: '789 River Rd',
  },
  {
    name: 'Plant-Based Burger',
    description: 'Impossible patty, local lettuce, tomato, whole grain bun.',
    restaurant: 'Burger Roots',
    location: '321 Elm St',
  },
];

const SustainableMealsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-food-cream py-12 px-4">
      <h1 className="text-4xl font-bold text-food-brown mb-8 text-center">Sustainable Food Options Nearby</h1>
      <div className="max-w-3xl mx-auto grid gap-8">
        {sustainableMeals.map((meal, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center md:items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-food-green mb-2">{meal.name}</h2>
              <p className="text-food-brown mb-2">{meal.description}</p>
              <div className="text-food-brown text-sm">
                <span className="font-semibold">Restaurant:</span> {meal.restaurant}<br />
                <span className="font-semibold">Location:</span> {meal.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SustainableMealsPage;
