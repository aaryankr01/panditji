import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import { Star, MapPin, CheckCircle, CalendarCheck } from 'lucide-react';

const PanditProfile = () => {
  const { id } = useParams();
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPandit = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/pandits/${id}`);
        setPandit(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchPandit();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader size={48} /></div>;
  if (!pandit) return <div className="min-h-screen flex items-center justify-center">Pandit not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-10">
          {/* Left Column - Avatar & Quick Info */}
          <div className="w-full md:w-1/3 flex flex-col items-center text-center">
            <div className="w-40 h-40 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-6xl mb-6 shadow-inner">
              {pandit.firstName.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pt. {pandit.firstName} {pandit.lastName}</h1>
            <div className="flex items-center gap-2 text-yellow-500 font-bold mb-4">
              <Star fill="currentColor" /> 4.9 <span className="text-gray-400 font-normal text-sm">(120 reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 mb-6 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <MapPin size={18} /> {pandit.city || 'Available Worldwide'}
            </div>
            
            <div className="flex flex-col w-full gap-3">
              <Link 
                to={`/book/${pandit._id}`}
                className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-md flex items-center justify-center gap-2 text-lg"
              >
                <CalendarCheck /> Book Puja
              </Link>
              <Link 
                to="/chat"
                state={{ preSelectedUser: pandit }}
                className="w-full bg-orange-50 text-orange-600 border border-orange-200 font-bold py-4 rounded-xl hover:bg-orange-100 transition-all shadow-sm flex items-center justify-center gap-2 text-lg"
              >
                Message Pandit
              </Link>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="w-full md:w-2/3">
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg font-bold text-sm w-max mb-8 border border-green-100">
              <CheckCircle size={18} /> Verified PanditJi Partner
            </div>
            
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">About PanditJi</h2>
                <p className="text-gray-600 leading-relaxed">
                  {pandit.panditProfile?.bio || `Acharya ${pandit.firstName} is a highly respected Vedic scholar with years of experience in conducting auspicious ceremonies. Known for their deep understanding of scriptures and perfect pronunciation of mantras.`}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {(pandit.panditProfile?.specialization || 'Griha Pravesh, Vivah, Satyanarayan, Havan').split(',').map((spec, idx) => (
                    <span key={idx} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-semibold border border-orange-100">
                      {spec.trim()}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Experience</h2>
                <p className="text-gray-600">
                  {pandit.panditProfile?.experience || '10+'} Years of spiritual service.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PanditProfile;
