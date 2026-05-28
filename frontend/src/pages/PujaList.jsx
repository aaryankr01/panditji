import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import PanditCard from '../components/pandit/PanditCard';
import PanditFilter from '../components/pandit/PanditFilter';
import { Search } from 'lucide-react';
import useT from '../hooks/useT';

const PujaList = () => {
  const t = useT();
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  const fetchPandits = async (queryParams = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`https://panditji-1tf8.onrender.com/api/pandits${queryParams}`);
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
    <div className="flex flex-col min-h-screen bg-surface font-sans">
      <Navbar />

      <div className="bg-maroon text-white py-12 px-4 sm:px-6 lg:px-8 border-b-8 border-saffron relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-saffron opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl font-bold font-serif mb-4">{t('pandit_list_title')}</h1>
          <p className="text-maroon-light max-w-2xl mx-auto">{t('pandit_list_subtitle')}</p>
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
            <div className="mb-6 bg-green-50 text-[#1E7D3C] p-4 rounded-xl border border-green-200">
              {locationMessage}
            </div>
          )}

          <div className="mb-6 flex justify-between items-end border-b border-brandborder pb-4">
            <h2 className="text-2xl font-bold font-serif text-maroon">{t('pandit_list_available')}</h2>
            <span className="text-textMid text-sm font-bold">{filteredPandits.length} {t('pandit_list_results')}</span>
          </div>

          {loading ? (
            <div className="py-20"><Loader size={48} /></div>
          ) : filteredPandits.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-brandborder shadow-sm">
              <Search size={48} className="text-textMuted mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-maroon mb-2">{t('pandit_list_no_found')}</h3>
              <p className="text-textMid">{t('pandit_list_try_adjusting')}</p>
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
