import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      school: "UC Berkeley",
      year: "Junior",
      rating: 5,
      text: "DormPlate has been a lifesaver during finals week. Fast delivery right to the library, and the student discounts actually make it affordable!",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Marcus Johnson",
      school: "UCLA",
      year: "Sophomore",
      rating: 5,
      text: "The group ordering feature is amazing for our dorm floor. We can all chip in for pizza night without the hassle of collecting cash.",
      avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Emma Rodriguez",
      school: "Stanford",
      year: "Senior",
      rating: 5,
      text: "I love how they deliver anywhere on campus. Getting food delivered to the engineering building during late-night study sessions is perfect.",
      avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Alex Kim",
      school: "USC",
      year: "Graduate Student",
      rating: 5,
      text: "The quality of restaurants on DormPlate is way better than other delivery apps. Plus, they actually understand campus addresses!",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Maya Patel",
      school: "UC San Diego",
      year: "Freshman",
      rating: 5,
      text: "As a freshman, DormPlate helped me discover the best food spots around campus. The recommendations are always spot-on!",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    },
    {
      name: "Tyler Brooks",
      school: "Cal Poly",
      year: "Junior",
      rating: 5,
      text: "Super reliable delivery times and great customer service. They once helped me track down a driver when I gave the wrong dorm number.",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Students Everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied students who've made DormPlate their go-to for campus food delivery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.year} at {testimonial.school}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full">
            <Star className="h-6 w-6 fill-current mr-2" />
            <span className="font-semibold text-lg">4.9/5 from 12,000+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;