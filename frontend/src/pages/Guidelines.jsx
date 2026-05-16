import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Guidelines = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brandborder">
          <h1 className="text-4xl font-black text-maroon mb-2 font-serif">Community Guidelines</h1>
          <p className="text-textMuted mb-8 text-sm uppercase tracking-widest font-bold">Last Updated: May 2024</p>
          
          <div className="space-y-8 text-textMid leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-maroon mb-4">Our Core Values</h2>
              <p>
                PanditJi is built on respect, devotion, and trust. Our community guidelines exist to ensure that every interaction between Devotees and Pandits is conducted with the utmost dignity and reverence for our traditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">Guidelines for Devotees</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Respectful Communication:</strong> Always communicate politely with the Pandits. Any abusive or derogatory language will lead to a permanent ban.</li>
                <li><strong>Punctuality:</strong> Please be ready for the Puja at the agreed-upon time and location to respect the Pandit's schedule.</li>
                <li><strong>Clear Requirements:</strong> Be clear about your specific puja needs, samagri (materials), and traditions before the booking is confirmed.</li>
                <li><strong>Timely Payments:</strong> Complete payments promptly as per the platform's guidelines to ensure smooth coordination.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">Guidelines for Pandits</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Professionalism & Punctuality:</strong> Arrive at the devotee's location or join the online meeting on time. Preparation is key to a successful ceremony.</li>
                <li><strong>Authenticity:</strong> Perform all rituals with genuine devotion and adhere to the authentic Vedic procedures as requested by the devotee.</li>
                <li><strong>Transparency:</strong> Be transparent about any additional samagri requirements before the puja begins. Avoid demanding unexpected extra fees offline.</li>
                <li><strong>Communication:</strong> Respond to booking requests and devotee messages in a timely and courteous manner.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-maroon mb-4">Zero Tolerance Policy</h2>
              <p>
                We have a zero-tolerance policy for:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Harassment, discrimination, or hate speech of any kind.</li>
                <li>Fraudulent bookings or fake profiles.</li>
                <li>Attempting to bypass the platform's payment system to conduct offline transactions.</li>
              </ul>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-brandborder text-center">
            <p className="text-textMuted text-sm">
              To report a violation of these guidelines, contact <span className="font-bold text-saffron">support@panditji.com</span>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Guidelines;
