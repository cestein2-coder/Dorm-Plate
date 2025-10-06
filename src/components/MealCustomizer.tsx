import React, { useState } from 'react';

const ingredients = [
  'Chicken', 'Beef', 'Tofu', 'Rice', 'Noodles', 'Broccoli', 'Carrots', 'Cheese', 'Egg', 'Avocado', 'Hot Sauce', 'Soy Sauce'
];

const MealCustomizer: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleIngredient = (item: string) => {
    setSelected(sel => sel.includes(item) ? sel.filter(i => i !== item) : [...sel, item]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
      <h3 className="text-xl font-bold text-food-brown mb-2">Build Your Own Meal</h3>
      {submitted ? (
        <div className="text-food-brown text-center">
          <p className="mb-2">Your meal:</p>
          <ul className="flex flex-wrap gap-2 justify-center">
            {selected.map(item => (
              <li key={item} className="bg-food-yellow px-3 py-1 rounded-full text-food-brown font-medium border border-food-brown">{item}</li>
            ))}
          </ul>
          <p className="mt-2">Thanks for customizing!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {ingredients.map(item => (
              <button
                type="button"
                key={item}
                className={`px-3 py-1 rounded-full border font-medium ${selected.includes(item) ? 'bg-food-brown text-white border-food-brown' : 'bg-food-yellow text-food-brown border-food-brown'}`}
                onClick={() => toggleIngredient(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-lg font-medium mt-2"
            disabled={selected.length === 0}
          >
            Submit Meal
          </button>
        </form>
      )}
    </section>
  );
};

export default MealCustomizer;
