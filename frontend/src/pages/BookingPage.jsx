import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';

const BookingPage = () => {
  const { id } = useParams(); // Pandit ID
  const { token, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    pujaType: 'Griha Pravesh',
    date: '',
    time: '',
    address: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        panditId: id,
        ...formData
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none placeholder-gray-400" placeholder="123 Auspicious Street, City, State"></textarea>
            </div>

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
