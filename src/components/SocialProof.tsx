import { Star } from 'lucide-react';

export default function SocialProof() {
  const testimonials = [
    {
      name: 'Sarah M.',
      university: 'UC Berkeley',
      text: 'Finally! No more walking across campus in the rain to get food. DormPlate is a game-changer.',
      rating: 5,
    },
    {
      name: 'Jake T.',
      university: 'NYU',
      text: 'The group ordering feature is genius. My roommates and I save so much on delivery fees now.',
      rating: 5,
    },
    {
      name: 'Emily R.',
      university: 'UCLA',
      text: 'Late night study sessions just got way better. Food delivered right to the library!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Students Are Talking
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of students who are already hooked
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div>
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.university}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 text-gray-600">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">10K+</div>
              <div className="text-sm">Students Waiting</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">50+</div>
              <div className="text-sm">Universities</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">4.9</div>
              <div className="text-sm">Beta Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
