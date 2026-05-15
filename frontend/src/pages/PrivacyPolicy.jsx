import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brandborder">
          <h1 className="text-4xl font-black text-maroon mb-2 font-serif">Privacy Policy</h1>
          <p className="text-textMuted mb-8 text-sm uppercase tracking-widest font-bold">Last Updated: May 2024</p>
          
          <div className="space-y-8 text-textMid leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-maroon mb-4">1. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, such as when you create an account, update your profile, use the interactive features of our services, or communicate with us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services, to process transactions, and to send you related information, including confirmations and receipts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">3. Information Sharing</h2>
              <p>
                We may share information about you with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., payment processing via Razorpay). We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">4. Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">5. Your Choices</h2>
              <p>
                You may update, correct, or delete your account information at any time by logging into your account or by contacting our support team.
              </p>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-brandborder text-center">
            <p className="text-textMuted text-sm">
              Questions about our privacy practices? Contact us at <span className="font-bold text-saffron">support@panditji.com</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
