import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'How fast is delivery to my dorm?',
    answer: 'Most deliveries arrive within 15-25 minutes. We prioritize speed and freshness, with real-time tracking so you always know when your food will arrive.'
  },
  {
    id: 2,
    question: 'Are there any delivery fees?',
    answer: 'Small delivery fees apply, typically $1.99-$3.99 depending on distance. Students with DormPlate Plus get unlimited free delivery!'
  },
  {
    id: 3,
    question: 'Can I use my dining dollars or meal plan?',
    answer: 'Yes! We accept dining dollars, meal swipes, and regular payment methods. Check with your specific campus to see which options are available.'
  },
  {
    id: 4,
    question: 'What if my order is wrong or late?',
    answer: 'We guarantee your satisfaction. Contact support immediately and we will refund or remake your order at no additional cost. Your happiness is our priority.'
  },
  {
    id: 5,
    question: 'How do group orders work?',
    answer: 'Create a group order link and share it with friends. Everyone adds their items, and you split the delivery fee. One person checks out for everyone, making group meals easy and affordable.'
  },
  {
    id: 6,
    question: 'Is DormPlate available at my university?',
    answer: 'We are currently on 50+ campuses nationwide and expanding rapidly. Enter your university email to check availability and join the waitlist if we are not there yet!'
  }
];

const FAQAccordion: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about DormPlate
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-6 w-6 text-purple-600 flex-shrink-0 transition-transform duration-300 ${
                    openId === faq.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openId === faq.id ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
