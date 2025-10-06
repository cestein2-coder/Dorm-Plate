import React, { useState } from 'react';

const dietaryOptions = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'
];

const DietaryPreferencesFilter: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (item: string) => {
    setSelected(sel => sel.includes(item) ? sel.filter(i => i !== item) : [...sel, item]);
  };

  return (
    <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
      <h3 className="text-xl font-bold text-food-brown mb-2">Dietary Preferences</h3>
      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {dietaryOptions.map(item => (
          <button
            type="button"
            key={item}
            className={`px-3 py-1 rounded-full border font-medium ${selected.includes(item) ? 'bg-food-brown text-white border-food-brown' : 'bg-food-yellow text-food-brown border-food-brown'}`}
            onClick={() => toggleOption(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="text-food-brown text-center">
          <p className="mb-1">Selected:</p>
          <ul className="flex flex-wrap gap-2 justify-center">
            {selected.map(item => (
              <li key={item} className="bg-food-yellow px-3 py-1 rounded-full text-food-brown font-medium border border-food-brown">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DietaryPreferencesFilter;
