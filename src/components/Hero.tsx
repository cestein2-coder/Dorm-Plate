import WaitlistForm from './WaitlistForm';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-red-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Campus Food Delivery
              <br />
              Made Ridiculously Easy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Skip the dining hall. Order from your favorite campus restaurants with friends, save with student discounts, and get it delivered right to your dorm.
            </p>
          </div>
          <WaitlistForm variant="hero" />
          <p className="text-sm text-gray-500">
            🎓 Join 10,000+ students on the waitlist • Launching Spring 2026
          </p>
        </div>
      </div>
    </section>
  );
}
