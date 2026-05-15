import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import { Video, MapPin, Clock, Calendar, ShieldCheck, Tag } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams(); // Pandit ID
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    pujaType: 'Griha Pravesh',
    date: '',
    time: '',
    address: '',
    city: '',
    notes: '',
    pujaMode: 'in-person'
  });
  const [pandit, setPandit] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPandit = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/pandits/${id}`);
        setPandit(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (id !== 'any') fetchPandit();
  }, [id]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const baseFee = pandit?.panditProfile?.feePerPuja || 1500;
  const currentFee = formData.pujaMode === 'online' ? baseFee * 0.7 : baseFee;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        panditId: id === 'any' ? null : id,
        ...formData,
        fee: currentFee
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Booking request sent successfully!');
      navigate('/devotee-dashboard');
    } catch (err) {
      alert('Failed to book. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-orange-600 text-white p-6 text-center">
            <h1 className="text-2xl font-bold font-serif">Book Your Puja</h1>
            <p className="text-orange-100 text-sm mt-1">Fill out the details below to request a booking.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1">Select Puja Mode</p>
                <div className="flex bg-white p-1 rounded-xl border border-orange-200">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, pujaMode: 'in-person'})}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${formData.pujaMode === 'in-person' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    In-Person
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, pujaMode: 'online'})}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${formData.pujaMode === 'online' ? 'bg-orange-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Online <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded uppercase">-30%</span>
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Booking Fee</p>
                <div className="flex items-center gap-2 justify-end">
                  {formData.pujaMode === 'online' && (
                    <span className="text-gray-400 line-through text-sm">₹{baseFee}</span>
                  )}
                  <span className="text-2xl font-black text-gray-900">₹{currentFee}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Puja Type</label>
                <select name="pujaType" value={formData.pujaType} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none">
                  <option>Griha Pravesh</option>
                  <option>Vivah Sanskar</option>
                  <option>Satyanarayan Katha</option>
                  <option>Namakaran</option>
                  <option>Ganesh Puja</option>
                  <option>Laxmi Puja</option>
                  <option>Navratri Puja</option>
                  <option>Havan &amp; Yagya</option>
                  <option>Maha Mrityunjaya</option>
                  <option>Rudrabhishek</option>
                  <option>Kaal Sarp Dosh</option>
                  <option>Vastu Shanti</option>
                  <option>Mundan Ceremony</option>
                  <option>Annaprashan</option>
                  <option>Durga Puja</option>
                  <option>Hanuman Puja</option>
                  <option>Sunderkand Path</option>
                  <option>Pitru Tarpan</option>
                  <option>Navgrah Puja</option>
                  <option>Janeu Ceremony</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. Mumbai" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
                <textarea name="address" value={formData.address} onChange={handleChange} required rows="1" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none placeholder-gray-400" placeholder={formData.pujaMode === 'online' ? "Not required for online, but add for records" : "123 Auspicious Street, City"}></textarea>
              </div>
            </div>

            {formData.pujaMode === 'online' && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="bg-blue-600 text-white p-2 rounded-lg">
                  <Video size={20} />
                </div>
                <div>
                  <p className="font-bold text-blue-900 text-sm">Online Puja via Video Call</p>
                  <p className="text-xs text-blue-700 mt-0.5">PanditJi will provide a Zoom/Meet link once the booking is confirmed. Perform rituals from the comfort of your home.</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Special Requests / Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors shadow-md flex justify-center items-center h-14 text-lg">
              {loading ? <Loader size={24} className="text-white" /> : 'Confirm Booking Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
