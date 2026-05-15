import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import PanditCard from '../components/pandit/PanditCard';
import PanditFilter from '../components/pandit/PanditFilter';

const PujaList = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  const fetchPandits = async (queryParams = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/pandits${queryParams}`);
      setPandits(res.data.data);
      if (res.data.message) {
        setLocationMessage(res.data.message);
      } else {
        setLocationMessage('');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPandits();
  }, []);

  const handleFilterChange = (type, value) => {
    if (type === 'location') {
      if (value) {
        fetchPandits(`?city=${value}`);
      } else {
        fetchPandits();
      }
    }
  };

  const handleLocationRequest = (lat, lng) => {
    fetchPandits(`?lat=${lat}&lng=${lng}`);
  };

  const filteredPandits = pandits.filter(p => 
    p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="bg-orange-600 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold font-serif mb-4">Find the Perfect Pandit</h1>
          <p className="text-orange-100 max-w-2xl mx-auto">Browse our curated list of highly experienced, verified Pandits available for all your spiritual needs.</p>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <PanditFilter 
            onSearch={setSearchQuery} 
            onFilterChange={handleFilterChange} 
            onLocationRequest={handleLocationRequest}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {locationMessage && (
            <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
              {locationMessage}
            </div>
          )}

          <div className="mb-6 flex justify-between items-end border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Available Pandits</h2>
            <span className="text-gray-500 text-sm">{filteredPandits.length} results</span>
          </div>

          {loading ? (
            <div className="py-20"><Loader size={48} /></div>
          ) : filteredPandits.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Pandits Found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPandits.map(pandit => (
                <PanditCard key={pandit._id} pandit={pandit} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PujaList;
