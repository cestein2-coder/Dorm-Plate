import { Utensils } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed w-full top-0 z-50 bg-food-cream/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-food-orange to-food-green p-2 rounded-lg">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-food-brown">DormPlate</span>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
            Join Waitlist
          </button>
        </div>
      </div>
    </header>
  );
}
