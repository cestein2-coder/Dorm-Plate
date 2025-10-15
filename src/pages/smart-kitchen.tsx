import React from 'react';
import FridgeWizard from '../components/FridgeWizard';

const SmartKitchenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-food-cream py-12 px-4">
      <h1 className="text-4xl font-bold text-food-brown mb-8 text-center">Smart Kitchen</h1>
      <div className="max-w-4xl mx-auto">
        <FridgeWizard />
      </div>
    </div>
  );
};

export default SmartKitchenPage;
