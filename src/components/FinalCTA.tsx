import WaitlistForm from './WaitlistForm';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Campus Dining?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Be the first to know when DormPlate launches at your university. Early access members get exclusive perks and discounts.
            </p>
          </div>
          <WaitlistForm variant="cta" />
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Exclusive early access</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>Free delivery on first order</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
