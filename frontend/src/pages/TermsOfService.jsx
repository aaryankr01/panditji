import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8 text-sm uppercase tracking-widest font-bold">Last Updated: May 2024</p>
          
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the PanditJi platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">2. Services Provided</h2>
              <p>
                PanditJi provides a digital marketplace connecting devotees with verified Pandits for religious services. We are a facilitator and are not responsible for the direct performance of religious rituals.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">3. Booking & Payments</h2>
              <p>
                Payments for services must be made through our authorized payment gateway (Razorpay). A booking is only confirmed once the payment is successfully captured.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2">
                <li>10% of the booking fee is collected as a service charge by the platform.</li>
                <li>90% of the booking fee goes directly to the performing Pandit.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">4. Cancellation & Refunds</h2>
              <p>
                Cancellations made 24 hours before the scheduled time are eligible for a partial refund. Platform service fees are non-refundable. Refund processing may take 5-7 business days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">5. Conduct & Safety</h2>
              <p>
                All users must maintain a respectful environment. Any form of harassment, fraud, or misuse of the chat system will result in immediate account termination.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-4">6. Liability</h2>
              <p>
                PanditJi is not liable for any indirect, incidental, or consequential damages arising out of the use of our platform or the services performed by Pandits.
              </p>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Questions about our terms? Contact us at <span className="font-bold text-orange-600">support@panditji.com</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
