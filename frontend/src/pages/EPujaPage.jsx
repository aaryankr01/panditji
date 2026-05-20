import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Star, Clock } from 'lucide-react';

const categories = ['All', 'Home', 'Wedding', 'Devotional', 'Festival', 'Ritual', 'Remedial', 'Life Events'];

const initialPujas = [
  { _id: 1, name: 'Rudrabhishek', image: '/pictures/rudrabhisek.png', rating: 4.8, conducted: 875, isPopular: true, desc: 'Lord Shiva abhisheka for peace and prosperity.', longDesc: 'Rudrabhishek is a highly auspicious puja dedicated to Lord Shiva. It involves bathing the Shiva Lingam with sacred items like milk, honey, and gangajal while chanting powerful mantras. This brings peace, prosperity, and removes negative energies.', duration: '2-3 hrs', price: 3100, category: 'Devotional' },
  { _id: 2, name: 'Sunderkand Path', image: '/pictures/sunderkand.png', rating: 4.5, conducted: 187, isPopular: true, desc: 'Recitation of Hanumanji\'s glory.', longDesc: 'Sunderkand Path is the recitation of the fifth chapter of the Ramcharitmanas, which highlights the glory, devotion, and triumphs of Lord Hanuman. It brings courage, confidence, and removes obstacles from one\'s path.', duration: '4-5 hrs', price: 3500, category: 'Devotional' },
  { _id: 3, name: 'Griha Pravesh', image: '/pictures/grihaparvesh.png', rating: 4.9, conducted: 540, isPopular: true, desc: 'Blessings for your new home.', longDesc: 'Griha Pravesh is a Hindu ceremony performed on the occasion of an individual\'s first time entering their new home. It cleanses the space of any negative energies and invites divine blessings for a peaceful living.', duration: '3-4 hrs', price: 5100, category: 'Home' },
  { _id: 4, name: 'Vivah Ceremony', image: '/pictures/vivahceremony.png', rating: 4.7, conducted: 320, isPopular: false, desc: 'Sacred marriage ceremonies.', longDesc: 'A complete traditional Hindu wedding ceremony guided by a knowledgeable Pandit. It includes all crucial rituals like Kanyadaan, Mangal Phera, and Saptapadi, ensuring the couple begins their new journey with divine blessings.', duration: '6-8 hrs', price: 11000, category: 'Wedding' },
  { _id: 5, name: 'Satyanarayan Katha', image: '/pictures/satnaraynkatha.png', rating: 4.6, conducted: 410, isPopular: true, desc: 'Traditional thanksgiving story.', longDesc: 'The Satyanarayan Katha is a popular ritual performed to express gratitude to Lord Vishnu. It is often conducted during auspicious occasions like housewarmings, marriages, or simply for the general well-being of the family.', duration: '2-3 hrs', price: 2100, category: 'Devotional' },
  { _id: 6, name: 'Mundan Ceremony', image: '/pictures/mundanceremony.png', rating: 4.5, conducted: 215, isPopular: false, desc: 'First haircut ritual for child.', longDesc: 'Mundan is a highly auspicious ceremony where a child receives their first haircut. It is believed to purify the child, free them from past life karma, and promote healthy mental and physical growth.', duration: '1-2 hrs', price: 2100, category: 'Life Events' },
  { _id: 7, name: 'Navratri Puja', image: '/pictures/navratripuja.png', rating: 4.8, conducted: 630, isPopular: true, desc: '9 days of Goddess Durga worship.', longDesc: 'A powerful 9-day puja dedicated to the nine forms of Goddess Durga. This puja invokes divine feminine energy, bringing strength, prosperity, and protection to the devotee\'s household.', duration: '1-2 hrs/day', price: 3100, category: 'Festival' },
  { _id: 8, name: 'Durga Puja', image: '/pictures/durgapuja.png', rating: 4.9, conducted: 410, isPopular: false, desc: 'Elaborate worship of Maa Durga.', longDesc: 'An elaborate and grand worship of Goddess Durga, celebrating her victory over Mahishasura. This puja is performed to overcome evil forces, obstacles, and to seek power and courage.', duration: '4-5 hrs', price: 5100, category: 'Festival' },
  { _id: 9, name: 'Havan & Yagya', image: '/pictures/havanand%20yagya.png', rating: 4.7, conducted: 820, isPopular: true, desc: 'Fire sacrifice for purification.', longDesc: 'Havan is a sacred fire ritual where offerings are made to the fire god, Agni. The chanting of mantras along with the fire purifies the environment, eliminates negativity, and brings spiritual upliftment.', duration: '2-3 hrs', price: 3100, category: 'Ritual' },
  { _id: 10, name: 'Naamkaran', image: '/pictures/namkaran.png', rating: 4.6, conducted: 345, isPopular: false, desc: 'Naming ceremony for newborns.', longDesc: 'The Naamkaran ceremony is the official naming of a newborn baby. According to Vedic astrology, the name is chosen based on the child\'s birth star (Nakshatra) to ensure a prosperous and auspicious life.', duration: '1-2 hrs', price: 2100, category: 'Life Events' },
  { _id: 11, name: 'Ganesh Puja', image: '/pictures/ganeshpuja.png', rating: 4.9, conducted: 1120, isPopular: true, desc: 'Worship of Lord Ganesha for success.', longDesc: 'Lord Ganesha is the remover of obstacles and the god of new beginnings. This puja is highly recommended before starting any new venture, business, or significant life event to ensure success.', duration: '1-2 hrs', price: 2100, category: 'Devotional' },
  { _id: 12, name: 'Lakshmi Puja', image: '/pictures/lakshmipuja.png', rating: 4.8, conducted: 950, isPopular: true, desc: 'Goddess of wealth worship.', longDesc: 'Lakshmi Puja is performed to invite Goddess Lakshmi, the deity of wealth, fortune, and prosperity, into one\'s home or business. It is especially significant during Diwali to ensure financial stability.', duration: '1-2 hrs', price: 2100, category: 'Festival' },
  { _id: 13, name: 'Surya Puja', image: '/pictures/suryapuja.png', rating: 4.5, conducted: 120, isPopular: false, desc: 'Sun God worship for health.', longDesc: 'Surya Puja honors the Sun God, who is the source of all life and energy. It is performed for good health, vitality, success in career, and to mitigate the negative effects of the Sun in one\'s horoscope.', duration: '1-2 hrs', price: 2100, category: 'Ritual' },
  { _id: 14, name: 'Kaal Sarp Dosh', image: '/pictures/kaalsarpdosh.png', rating: 4.6, conducted: 290, isPopular: false, desc: 'Remedial puja for Kaal Sarp Dosh.', longDesc: 'This remedial puja is specifically for individuals who have Kaal Sarp Dosh in their Kundali. It neutralizes the malefic effects of Rahu and Ketu, bringing relief from struggles and unlocking blocked success.', duration: '3-4 hrs', price: 5500, category: 'Remedial' },
  { _id: 15, name: 'Vastu Shanti', image: '/pictures/vastushanti.png', rating: 4.7, conducted: 410, isPopular: false, desc: 'Removing vastu defects from home.', longDesc: 'Vastu Shanti is performed to correct any architectural or directional faults (Vastu Doshas) in a building. It appeases Vastu Purusha, ensuring peace, harmony, and prosperity for the inhabitants.', duration: '3-4 hrs', price: 6100, category: 'Home' },
  { _id: 16, name: 'Maha Mrityunjaya', image: '/pictures/maha%20mrityunjaya.png', rating: 4.9, conducted: 560, isPopular: false, desc: 'Jaap for health and longevity.', longDesc: 'The Maha Mrityunjaya Jaap is a highly potent chant dedicated to Lord Shiva. It is performed to overcome severe illnesses, prevent untimely death, and grant the devotee longevity and spiritual growth.', duration: '5-6 hrs', price: 3100, category: 'Remedial' },
  { _id: 17, name: 'Annaprashan', image: '/pictures/annaprashann.png', rating: 4.4, conducted: 180, isPopular: false, desc: 'First solid food ritual for baby.', longDesc: 'Annaprashan marks the milestone of a baby consuming solid food for the first time. The puja invokes blessings for the child\'s health, digestion, and a life filled with abundance and nourishment.', duration: '1-2 hrs', price: 1500, category: 'Life Events' },
  { _id: 18, name: 'Navagraha Puja', image: '/pictures/navgarahpuja.png', rating: 4.5, conducted: 310, isPopular: false, desc: 'Worship of nine planets.', longDesc: 'Navagraha Puja aims to appease all nine astrological planets. It balances their energies, mitigating adverse planetary alignments (Doshas) and amplifying the positive influences in one\'s life.', duration: '2-3 hrs', price: 3500, category: 'Remedial' },
  { _id: 19, name: 'Lakshmi Narayan', image: '/pictures/lakshminarayan.png', rating: 4.8, conducted: 430, isPopular: false, desc: 'Joint worship of Vishnu and Lakshmi.', longDesc: 'This puja is dedicated to the divine couple, Lord Vishnu and Goddess Lakshmi. It is performed to seek marital bliss, harmonious family life, and sustained material and spiritual prosperity.', duration: '2-3 hrs', price: 2500, category: 'Devotional' },
  { _id: 20, name: 'Janmashtami Puja', image: '/pictures/janmashtamipuja.png', rating: 4.9, conducted: 780, isPopular: true, desc: 'Lord Krishna birth celebration.', longDesc: 'Celebrated on the birth anniversary of Lord Krishna, this puja involves midnight prayers, chanting, and offering Makhan Mishri. It fills the home with joy, love, and divine grace.', duration: '2-3 hrs', price: 3100, category: 'Festival' },
];

const steps = [
  { icon: "🌐", title: "Visit PanditJi", desc: "Go to our website to explore puja services and details." },
  { icon: "📿", title: "Select Your Puja", desc: "Choose the puja you want to perform from our wide list." },
  { icon: "💳", title: "Advance Booking Payment", desc: "Securely pay in advance to confirm your booking." },
  { icon: "🖥️", title: "Perform Online Puja", desc: "Join the online puja session from the comfort of your home." },
];

const advantages = [
  "Book only verified Pandits for every ritual.",
  "Experience 100% trust with PanditJi secure booking.",
  "Get quality services at an affordable price.",
  "No Hidden Charges – pay only what you see.",
  "Perform online rituals easily with E-Puja.",
  "Expert guidance through Astrology services.",
  "Choose from 180+ Vedic Pujas as you need.",
  "Follow every custom with complete Hindu Rituals.",
];

function PujaCard({ puja, onBook }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brandborder shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
      <div className="relative h-48 overflow-hidden shrink-0">
        <img src={puja.image || '/pictures/rudrabhisek.png'} alt={puja.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {puja.isPopular && (
          <div className="absolute top-4 left-4 bg-saffron text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
            Popular
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold font-serif text-maroon mb-1 group-hover:text-saffron transition-colors">
          {puja.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-gold text-gold" />)}
            <span className="text-xs font-bold text-maroon ml-1">{puja.rating || 4.5}</span>
          </div>
          <span className="text-saffron font-bold">₹{puja.price.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-textMid mb-4 bg-surface px-3 py-1.5 rounded-lg w-fit">
          <Clock size={14} className="text-saffron" />
          <span className="font-medium">{puja.duration || '1-2 hrs'}</span>
        </div>

        <p className="text-textMid text-xs mb-6 line-clamp-2 flex-1">{puja.desc || 'Perform this auspicious puja with our expert Pandits.'}</p>

        <div className="flex gap-3 mt-auto">
          <button
            onClick={() => onBook(puja)}
            className="w-full px-3 py-2.5 bg-saffron text-white font-bold rounded-xl hover:bg-saffron-dark transition-all shadow-md shadow-saffron/20 text-xs"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EPujaPage() {
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [bookedPuja, setBookedPuja] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);

  // New booking form modal state variables
  const [selectedPujaForBooking, setSelectedPujaForBooking] = useState(null);
  const [bookingFormDate, setBookingFormDate] = useState("");
  const [bookingFormTime, setBookingFormTime] = useState("10:00");
  const [bookingFormCity, setBookingFormCity] = useState("");
  const [bookingFormAddress, setBookingFormAddress] = useState("Zoom Video Call / Online");
  const [bookingFormNotes, setBookingFormNotes] = useState("");
  const [bookingFormLoading, setBookingFormLoading] = useState(false);

  const { isAuthenticated, token, user } = useAuthStore();
  const navigate = useNavigate();

  const heroSlides = [
    { title: "Satyanarayan", subtitle: "E-Puja", desc: "Sacred Puja For Peace, Happiness & Prosperity", hindi: "सुख, शांति और समृद्धि के लिए पावन पूजा" },
    { title: "Kaal Sarp Dosh", subtitle: "E-Puja", desc: "Remove planetary obstacles from your life", hindi: "ग्रह दोषों से मुक्ति के लिए ऑनलाइन पूजा" },
  ];

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pujas");
        if (res.data && res.data.success && res.data.data.length > 0) {
          setPujas(res.data.data);
        } else {
          setPujas(initialPujas);
        }
      } catch (err) {
        console.error("Failed to load pujas from API:", err);
        setPujas(initialPujas);
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = pujas.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenBookingModal = (puja) => {
    if (!isAuthenticated) {
      toast.error("Please login to book an E-Puja!");
      navigate("/login");
      return;
    }

    if (user?.role !== "devotee") {
      toast.error("Only Devotees can book Puja ceremonies.");
      return;
    }

    setSelectedPujaForBooking(puja);
    setBookingFormDate("");
    setBookingFormTime("10:00");
    setBookingFormCity(user?.city || "");
    setBookingFormAddress("Zoom Video Call / Online");
    setBookingFormNotes("");
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingFormDate) {
      toast.error("Please select a date.");
      return;
    }
    if (!bookingFormTime) {
      toast.error("Please select a time.");
      return;
    }

    setBookingFormLoading(true);
    try {
      // Format 24h time input to user-friendly "hh:mm AM/PM"
      let formattedTime = bookingFormTime;
      const [hours, minutes] = bookingFormTime.split(":");
      if (hours && minutes) {
        const hourNum = parseInt(hours);
        const ampm = hourNum >= 12 ? "PM" : "AM";
        const hour12 = hourNum % 12 || 12;
        formattedTime = `${hour12}:${minutes} ${ampm}`;
      }

      const bookingData = {
        pujaType: selectedPujaForBooking.name,
        date: bookingFormDate,
        time: formattedTime,
        address: bookingFormAddress || "Zoom Video Call / Online",
        city: bookingFormCity || user?.city || "Online",
        notes: bookingFormNotes || `E-Puja requested online for ${selectedPujaForBooking.name}`,
        fee: selectedPujaForBooking.price,
        pujaMode: "online",
        panditId: null
      };

      const res = await axios.post("http://localhost:5000/api/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setBookedPuja({ puja: selectedPujaForBooking, date: bookingFormDate });
        setSelectedPujaForBooking(null);
        toast.success("E-Puja booking request created successfully!");
        setTimeout(() => {
          setBookedPuja(null);
          navigate("/devotee-dashboard");
        }, 3000);
      } else {
        toast.error(res.data?.message || "Booking request failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to make a booking. Please try again.");
    } finally {
      setBookingFormLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />

      {/* Toast notification */}
      {bookedPuja && (
        <div style={{
          position: "fixed",
          top: 80,
          right: 24,
          background: "#1a1a1a",
          color: "#fff",
          padding: "14px 20px",
          borderRadius: 12,
          zIndex: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          fontSize: 14,
          maxWidth: 320,
          animation: "slideIn 0.3s ease",
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>🎉 Booking Requested!</div>
          <div style={{ color: "#d1d5db" }}>
            {bookedPuja.puja.name} {bookedPuja.date ? `on ${bookedPuja.date}` : ""}
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedPujaForBooking && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(44, 26, 14, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            width: "100%",
            maxWidth: 500,
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #7b1d0e 0%, #e8710a 100%)",
              color: "#fff",
              padding: "24px 32px",
              position: "relative",
            }}>
              <button
                type="button"
                onClick={() => setSelectedPujaForBooking(null)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  color: "#fff",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                Book E-Puja
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255, 255, 255, 0.8)", fontWeight: 500 }}>
                {selectedPujaForBooking.name}
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmBooking} style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* Date Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#7b1d0e", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Select Date *
                </label>
                <input
                  type="date"
                  value={bookingFormDate}
                  onChange={e => setBookingFormDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#2c1a0e",
                    background: "#FAF7F2",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Time Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#7b1d0e", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Select Time Slot *
                </label>
                <input
                  type="time"
                  value={bookingFormTime}
                  onChange={e => setBookingFormTime(e.target.value)}
                  required
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#2c1a0e",
                    background: "#FAF7F2",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* City Input */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#7b1d0e", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Your City *
                </label>
                <input
                  type="text"
                  value={bookingFormCity}
                  onChange={e => setBookingFormCity(e.target.value)}
                  required
                  placeholder="e.g. Jammu, Delhi, Mumbai"
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#2c1a0e",
                    background: "#FAF7F2",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Link Preference (Address field mapped) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#7b1d0e", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Meeting Medium *
                </label>
                <input
                  type="text"
                  value={bookingFormAddress}
                  onChange={e => setBookingFormAddress(e.target.value)}
                  required
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#2c1a0e",
                    background: "#FAF7F2",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Notes / Gotra */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#7b1d0e", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Gotra & Family Details (Optional)
                </label>
                <textarea
                  value={bookingFormNotes}
                  onChange={e => setBookingFormNotes(e.target.value)}
                  placeholder="Enter your Gotra, names of family members, or specific requests..."
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#2c1a0e",
                    background: "#FAF7F2",
                    outline: "none",
                    height: 80,
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Fee Information */}
              <div style={{
                background: "#FAF7F2",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}>
                <span style={{ fontSize: 14, color: "#6b4c3b", fontWeight: 600 }}>Total Fee:</span>
                <span style={{ fontSize: 18, color: "#e8710a", fontWeight: 800 }}>₹{selectedPujaForBooking.price.toLocaleString("en-IN")}</span>
              </div>

              {/* Form Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setSelectedPujaForBooking(null)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "#FAF7F2",
                    color: "#6b4c3b",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingFormLoading}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "linear-gradient(135deg, #e8710a 0%, #c45f06 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(232, 113, 10, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {bookingFormLoading ? (
                    <span style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }} />
                  ) : "Confirm Booking"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #7c2d12 0%, #9a3412 40%, #c2410c 100%)",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 32 }}>
          {/* Left: Illustration placeholder */}
          <div style={{
            flex: "0 0 auto",
            width: 200,
            height: 200,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            🛕
          </div>

          {/* Right: Text */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "4px 12px",
              marginBottom: 12,
            }}>
              <span style={{ color: "#fed7aa", fontSize: 13, fontWeight: 600, letterSpacing: 1 }}>🪔 ONLINE E-PUJA</span>
            </div>
            <h1 style={{ margin: "0 0 8px", color: "#fff", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, lineHeight: 1.1 }}>
              {heroSlides[heroSlide].title}{" "}
              <span style={{
                background: "#ea580c",
                borderRadius: 8,
                padding: "2px 12px",
                fontSize: "0.7em",
              }}>{heroSlides[heroSlide].subtitle}</span>
            </h1>
            <p style={{ color: "#fed7aa", fontSize: 18, margin: "8px 0 6px" }}>{heroSlides[heroSlide].desc}</p>
            <p style={{ color: "#fca5a5", fontSize: 16, margin: "0 0 24px" }}>{heroSlides[heroSlide].hindi}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ color: "#fef3c7", fontSize: 14 }}>🤲 Online Puja</div>
              <div style={{ color: "#fef3c7", opacity: 0.5 }}>|</div>
              <div style={{ color: "#fef3c7", fontSize: 14 }}>✅ Trusted Pandits</div>
            </div>
            <button
              onClick={() => document.getElementById("puja-listings").scrollIntoView({ behavior: "smooth" })}
              style={{
                marginTop: 24,
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 32px",
                fontWeight: 800,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Book E-Puja »
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              style={{
                width: heroSlide === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: heroSlide === i ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }} id="puja-listings">

        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
            Online E-Puja Services
          </h2>
          <p style={{ color: "#6b7280", fontSize: 16, margin: 0 }}>
            Perform authentic Vedic rituals from the comfort of your home
          </p>
        </div>

        {/* Search + Filter bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#9ca3af" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Puja name or category..."
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                fontSize: 15,
                background: "#fff",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-saffron text-white shadow-lg' : 'bg-white border border-brandborder text-textMid hover:border-saffron hover:text-saffron'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div style={{ marginBottom: 20, color: "#6b7280", fontSize: 14 }}>
          Showing <strong style={{ color: "#111827" }}>{filtered.length}</strong> puja services
        </div>

        {/* Loading state / skeletons */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#ea580c" }}>Loading divine E-Puja services...</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 20,
            marginBottom: 60,
          }}>
            {filtered.map(puja => (
              <PujaCard key={puja._id} puja={puja} onBook={handleOpenBookingModal} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>No pujas found</div>
            <div>Try a different search term or category</div>
          </div>
        )}

        {/* How it works */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>Why E-Puja?</h2>
          <p style={{ color: "#6b7280", maxWidth: 700, margin: "0 auto 40px", lineHeight: 1.6 }}>
            Are you out of the country or not present physically? Our e-puja service makes it possible
            to perform your puja virtually anywhere through WhatsApp, Google Meet, or Zoom.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 48,
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                background: "#fff",
                borderRadius: 16,
                padding: 24,
                border: "1px solid #f3f4f6",
                textAlign: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  background: "#fff7ed",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  margin: "0 auto 16px",
                  border: "2px solid #fed7aa",
                }}>{step.icon}</div>
                <div style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  width: 24,
                  height: 24,
                  background: "#ea580c",
                  borderRadius: "50%",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>{i + 1}</div>
                <h4 style={{ margin: "0 0 8px", fontWeight: 700, color: "#111827", fontSize: 15 }}>{step.title}</h4>
                <p style={{ margin: 0, color: "#6b7280", fontSize: 13, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)",
          borderRadius: 20,
          padding: "40px 32px",
          border: "1px solid #fed7aa",
          marginBottom: 60,
        }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 32px" }}>
            PanditJi Advantages
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}>
            {advantages.map((adv, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 16px",
                background: "#fff",
                borderRadius: 10,
                border: "1px solid #fde8c8",
              }}>
                <span style={{ color: "#16a34a", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: "#374151", fontSize: 14, lineHeight: 1.4 }}>{adv}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
