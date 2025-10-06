import MealCustomizer from './MealCustomizer';
import GroupOrderInvite from './GroupOrderInvite';
import DeliveryTimePicker from './DeliveryTimePicker';
import DietaryPreferencesFilter from './DietaryPreferencesFilter';
import DeliveryLocationSelector from './DeliveryLocationSelector';
import PlaceReview from './PlaceReview';
import React, { useState } from 'react';
import AuthModal from './auth/AuthModal';
import { useAuth } from './auth/AuthProvider';

const features = [
  {
    title: 'Group Order Demo',
    description: 'Simulate starting or joining a group order with friends!',
    icon: '🍕',
  },
  {
    title: 'Live Food Poll',
    description: 'Vote for your favorite campus meal and see live results!',
    icon: '🥗',
  },
  {
    title: 'Feature Carousel',
    description: 'Click through to learn about DormPlate’s best features.',
    icon: '🍔',
  },
  {
    title: 'Testimonials',
    description: 'Read and like real student reviews.',
    icon: '🗣️',
  },
  {
    title: 'Newsletter Signup',
    description: 'Join our mailing list for exclusive offers!',
    icon: '📧',
  },
];

const testimonials = [
  { id: 1, text: 'DormPlate made group orders so easy!', likes: 0 },
  { id: 2, text: 'I love the live food polls!', likes: 0 },
];

const pollOptions = [
  'Pizza',
  'Burgers',
  'Salad',
  'Sushi',
];

const NewLandingPage: React.FC = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [pollVotes, setPollVotes] = useState<number[]>(Array(pollOptions.length).fill(0));
  const [userVoted, setUserVoted] = useState<number | null>(null);
  const [testimonialLikes, setTestimonialLikes] = useState<number[]>(testimonials.map(t => t.likes));
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Carousel navigation
  const nextFeature = () => setCarouselIndex((i) => (i + 1) % features.length);
  const prevFeature = () => setCarouselIndex((i) => (i - 1 + features.length) % features.length);

  // Poll voting
  const votePoll = (idx: number) => {
    if (userVoted !== null) return;
    const newVotes = [...pollVotes];
    newVotes[idx] += 1;
    setPollVotes(newVotes);
    setUserVoted(idx);
  };

  // Like testimonial
  const likeTestimonial = (idx: number) => {
    const newLikes = [...testimonialLikes];
    newLikes[idx] += 1;
    setTestimonialLikes(newLikes);
  };

  // Newsletter
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    }
  };

  return (
  <div className="min-h-screen bg-food-yellow-light flex flex-col items-center py-10">
      <header className="w-full flex justify-between items-center px-8 mb-8">
        <h1 className="text-4xl font-bold text-food-brown">DormPlate</h1>
        {user ? (
          <span className="text-food-brown">Welcome, {user.email}</span>
        ) : (
          <button
            className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg"
            onClick={() => { setAuthMode('signin'); setAuthModalOpen(true); }}
          >
            Sign In / Sign Up
          </button>
        )}
      </header>

      {/* Feature Carousel */}
  <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
        <div className="flex items-center space-x-4">
          <button onClick={prevFeature} className="text-food-brown text-2xl">&#8592;</button>
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">{features[carouselIndex].icon}</span>
            <h2 className="text-2xl font-bold text-food-brown mb-1">{features[carouselIndex].title}</h2>
            <p className="text-food-brown/80">{features[carouselIndex].description}</p>
          </div>
          <button onClick={nextFeature} className="text-food-brown text-2xl">&#8594;</button>
        </div>
      </section>

      {/* Live Poll */}
  <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-food-brown mb-2">Vote for your favorite food!</h3>
        <div className="flex flex-col space-y-2">
          {pollOptions.map((option, idx) => (
            <button
              key={option}
              className={`w-full px-4 py-2 rounded-lg border border-food-brown text-food-brown font-medium ${userVoted === idx ? 'bg-food-brown/10' : 'bg-food-yellow-light'}`}
              onClick={() => votePoll(idx)}
              disabled={userVoted !== null}
            >
              {option} ({pollVotes[idx]})
            </button>
          ))}
        </div>
        {userVoted !== null && (
          <p className="mt-2 text-food-brown">Thanks for voting!</p>
        )}
      </section>

      {/* Testimonials with Like */}
  <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-food-brown mb-2">Student Testimonials</h3>
        <ul className="space-y-4">
          {testimonials.map((t, idx) => (
            <li key={t.id} className="flex items-center justify-between bg-food-yellow rounded-lg px-4 py-3">
              <span className="text-food-brown">{t.text}</span>
              <button
                className="flex items-center space-x-1 text-food-brown hover:text-food-yellow-dark font-medium"
                onClick={() => likeTestimonial(idx)}
              >
                <span>👍</span>
                <span>{testimonialLikes[idx]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Group Order Demo */}
  <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
        <h3 className="text-xl font-bold text-food-brown mb-2">Group Order Demo</h3>
        <div className="flex space-x-4">
          <button className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-lg font-medium">Start Group Order</button>
          <button className="bg-food-brown text-white px-4 py-2 rounded-lg font-medium">Join Group Order</button>
        </div>
        <p className="mt-2 text-food-brown/80">(Demo only: No real orders placed)</p>
      </section>

      {/* Newsletter Signup */}
  <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
        <h3 className="text-xl font-bold text-food-brown mb-2">Join Our Newsletter</h3>
        <form onSubmit={handleNewsletter} className="flex w-full max-w-sm">
          <input
            type="email"
            value={newsletterEmail}
            onChange={e => setNewsletterEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 rounded-l-lg border border-food-brown focus:ring-2 focus:ring-food-yellow focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-r-lg font-medium"
          >
            Subscribe
          </button>
        </form>
        {newsletterSuccess && <p className="mt-2 text-food-brown">Thanks for subscribing!</p>}
      </section>



  {/* Delivery Location Selector */}
  <DeliveryLocationSelector />

  {/* Meal Customizer */}
  <MealCustomizer />

  {/* Group Order Invite */}
  <GroupOrderInvite />

  {/* Delivery Time Picker */}
  <DeliveryTimePicker />

  {/* Dietary Preferences Filter */}
  <DietaryPreferencesFilter />

  {/* Place a Review */}
  <PlaceReview />

  {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default NewLandingPage;
