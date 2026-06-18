import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import useT from '../hooks/useT';
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Star, Clock, ChevronRight, MapPin, Shield, Tag, CheckCircle } from 'lucide-react';
import api from '../utils/api';

const initialPujas = [
  { _id: 1, name: 'Rudrabhishek', image: '/pictures/rudrabhisek.jpg', rating: 4.8, conducted: 875, isPopular: true, desc: 'Lord Shiva abhisheka for peace and prosperity.', longDesc: 'Rudrabhishek is a highly auspicious puja dedicated to Lord Shiva. It involves bathing the Shiva Lingam with sacred items like milk, honey, and gangajal while chanting powerful mantras. This brings peace, prosperity, and removes negative energies.', duration: '2-3 hrs', price: 3100, category: 'Devotional' },
  { _id: 2, name: 'Sunderkand Path', image: '/pictures/sunderkand.jpg', rating: 4.5, conducted: 187, isPopular: true, desc: "Recitation of Hanumanji's glory.", longDesc: "Sunderkand Path is the recitation of the fifth chapter of the Ramcharitmanas, which highlights the glory, devotion, and triumphs of Lord Hanuman. It brings courage, confidence, and removes obstacles from one's path.", duration: '4-5 hrs', price: 3500, category: 'Devotional' },
  { _id: 3, name: 'Griha Pravesh', image: '/pictures/grihaparvesh.jpg', rating: 4.9, conducted: 540, isPopular: true, desc: 'Blessings for your new home.', longDesc: "Griha Pravesh is a Hindu ceremony performed on the occasion of an individual's first time entering their new home. It cleanses the space of any negative energies and invites divine blessings for a peaceful living.", duration: '3-4 hrs', price: 11, category: 'Home' },
  { _id: 4, name: 'Vivah Ceremony', image: '/pictures/vivahceremony.jpg', rating: 4.7, conducted: 320, isPopular: false, desc: 'Sacred marriage ceremonies.', longDesc: 'A complete traditional Hindu wedding ceremony guided by a knowledgeable Pandit. It includes all crucial rituals like Kanyadaan, Mangal Phera, and Saptapadi, ensuring the couple begins their new journey with divine blessings.', duration: '6-8 hrs', price: 11000, category: 'Wedding' },
  { _id: 5, name: 'Satyanarayan Katha', image: '/pictures/satnaraynkatha.jpg', rating: 4.6, conducted: 410, isPopular: true, desc: 'Traditional thanksgiving story.', longDesc: 'The Satyanarayan Katha is a popular ritual performed to express gratitude to Lord Vishnu. It is often conducted during auspicious occasions like housewarmings, marriages, or simply for the general well-being of the family.', duration: '2-3 hrs', price: 2100, category: 'Devotional' },
  { _id: 6, name: 'Mundan Ceremony', image: '/pictures/mundanceremony.jpg', rating: 4.5, conducted: 215, isPopular: false, desc: 'First haircut ritual for child.', longDesc: "Mundan is a highly auspicious ceremony where a child receives their first haircut. It is believed to purify the child, free them from past life karma, and promote healthy mental and physical growth.", duration: '1-2 hrs', price: 2100, category: 'Life Events' },
  { _id: 7, name: 'Navratri Puja', image: '/pictures/navratripuja.jpg', rating: 4.8, conducted: 630, isPopular: true, desc: '9 days of Goddess Durga worship.', longDesc: "A powerful 9-day puja dedicated to the nine forms of Goddess Durga. This puja invokes divine feminine energy, bringing strength, prosperity, and protection to the devotee's household.", duration: '1-2 hrs/day', price: 3100, category: 'Festival' },
  { _id: 8, name: 'Durga Puja', image: '/pictures/durgapuja.jpg', rating: 4.9, conducted: 410, isPopular: false, desc: 'Elaborate worship of Maa Durga.', longDesc: 'An elaborate and grand worship of Goddess Durga, celebrating her victory over Mahishasura. This puja is performed to overcome evil forces, obstacles, and to seek power and courage.', duration: '4-5 hrs', price: 5100, category: 'Festival' },
  { _id: 9, name: 'Havan & Yagya', image: '/pictures/havanand%20yagya.jpg', rating: 4.7, conducted: 820, isPopular: true, desc: 'Fire sacrifice for purification.', longDesc: 'Havan is a sacred fire ritual where offerings are made to the fire god, Agni. The chanting of mantras along with the fire purifies the environment, eliminates negativity, and brings spiritual upliftment.', duration: '2-3 hrs', price: 3100, category: 'Ritual' },
  { _id: 10, name: 'Naamkaran', image: '/pictures/namkaran.jpg', rating: 4.6, conducted: 345, isPopular: false, desc: 'Naming ceremony for newborns.', longDesc: "The Naamkaran ceremony is the official naming of a newborn baby. According to Vedic astrology, the name is chosen based on the child's birth star (Nakshatra) to ensure a prosperous and auspicious life.", duration: '1-2 hrs', price: 2100, category: 'Life Events' },
  { _id: 11, name: 'Ganesh Puja', image: '/pictures/ganeshpuja.jpg', rating: 4.9, conducted: 1120, isPopular: true, desc: 'Worship of Lord Ganesha for success.', longDesc: 'Lord Ganesha is the remover of obstacles and the god of new beginnings. This puja is highly recommended before starting any new venture, business, or significant life event to ensure success.', duration: '1-2 hrs', price: 2100, category: 'Devotional' },
  { _id: 12, name: 'Lakshmi Puja', image: '/pictures/lakshmipuja.jpg', rating: 4.8, conducted: 950, isPopular: true, desc: 'Goddess of wealth worship.', longDesc: "Lakshmi Puja is performed to invite Goddess Lakshmi, the deity of wealth, fortune, and prosperity, into one's home or business. It is especially significant during Diwali to ensure financial stability.", duration: '1-2 hrs', price: 2100, category: 'Festival' },
  { _id: 13, name: 'Surya Puja', image: '/pictures/suryapuja.jpg', rating: 4.5, conducted: 120, isPopular: false, desc: 'Sun God worship for health.', longDesc: "Surya Puja honors the Sun God, who is the source of all life and energy. It is performed for good health, vitality, success in career, and to mitigate the negative effects of the Sun in one's horoscope.", duration: '1-2 hrs', price: 2100, category: 'Ritual' },
  { _id: 14, name: 'Kaal Sarp Dosh', image: '/pictures/kaalsarpdosh.jpg', rating: 4.6, conducted: 290, isPopular: false, desc: 'Remedial puja for Kaal Sarp Dosh.', longDesc: 'This remedial puja is specifically for individuals who have Kaal Sarp Dosh in their Kundali. It neutralizes the malefic effects of Rahu and Ketu, bringing relief from struggles and unlocking blocked success.', duration: '3-4 hrs', price: 5500, category: 'Remedial' },
  { _id: 15, name: 'Vastu Shanti', image: '/pictures/vastushanti.jpg', rating: 4.7, conducted: 410, isPopular: false, desc: 'Removing vastu defects from home.', longDesc: 'Vastu Shanti is performed to correct any architectural or directional faults (Vastu Doshas) in a building. It appeases Vastu Purusha, ensuring peace, harmony, and prosperity for the inhabitants.', duration: '3-4 hrs', price: 6100, category: 'Home' },
  { _id: 16, name: 'Maha Mrityunjaya', image: '/pictures/maha%20mrityunjaya.jpg', rating: 4.9, conducted: 560, isPopular: false, desc: 'Jaap for health and longevity.', longDesc: 'The Maha Mrityunjaya Jaap is a highly potent chant dedicated to Lord Shiva. It is performed to overcome severe illnesses, prevent untimely death, and grant the devotee longevity and spiritual growth.', duration: '5-6 hrs', price: 3100, category: 'Remedial' },
  { _id: 17, name: 'Annaprashan', image: '/pictures/annaprashann.jpg', rating: 4.4, conducted: 180, isPopular: false, desc: 'First solid food ritual for baby.', longDesc: "Annaprashan marks the milestone of a baby consuming solid food for the first time. The puja invokes blessings for the child's health, digestion, and a life filled with abundance and nourishment.", duration: '1-2 hrs', price: 1500, category: 'Life Events' },
  { _id: 18, name: 'Navagraha Puja', image: '/pictures/navgarahpuja.jpg', rating: 4.5, conducted: 310, isPopular: false, desc: 'Worship of nine planets.', longDesc: "Navagraha Puja aims to appease all nine astrological planets. It balances their energies, mitigating adverse planetary alignments (Doshas) and amplifying the positive influences in one's life.", duration: '2-3 hrs', price: 3500, category: 'Remedial' },
  { _id: 19, name: 'Lakshmi Narayan', image: '/pictures/lakshminarayan.jpg', rating: 4.8, conducted: 430, isPopular: false, desc: 'Joint worship of Vishnu and Lakshmi.', longDesc: 'This puja is dedicated to the divine couple, Lord Vishnu and Goddess Lakshmi. It is performed to seek marital bliss, harmonious family life, and sustained material and spiritual prosperity.', duration: '2-3 hrs', price: 2500, category: 'Devotional' },
  { _id: 20, name: 'Janmashtami Puja', image: '/pictures/janmashtamipuja.jpg', rating: 4.9, conducted: 780, isPopular: true, desc: 'Lord Krishna birth celebration.', longDesc: 'Celebrated on the birth anniversary of Lord Krishna, this puja involves midnight prayers, chanting, and offering Makhan Mishri. It fills the home with joy, love, and divine grace.', duration: '2-3 hrs', price: 3100, category: 'Festival' },
];

/* --- Rating Stars --- */
function RatingStars({ rating }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={11}
          style={{
            fill: i <= Math.round(rating) ? "#ff9f00" : "none",
            color: "#ff9f00",
            strokeWidth: 1.5,
          }}
        />
      ))}
    </span>
  );
}
/* ─── Puja Card (Flipkart style) ─── */
function PujaCard({ puja, onBook, clientType, getCalculatedPrice }) {
  const t = useT();
  const calcPrice = getCalculatedPrice(puja.price || 0);
  const discount = Math.round(((puja.price - calcPrice) / puja.price) * 100);
  const pujaId = puja._id || puja.id;
  const displayName = t(`puja_${pujaId}_name`) || puja.name;
  const displayDesc = t(`puja_${pujaId}_desc`) || puja.desc;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: hovered ? "1px solid #2874f0" : "1px solid #e0e0e0",
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 4px 20px rgba(40,116,240,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden", background: "#f5f5f5" }}>
        <img
          src={puja.image || '/pictures/rudrabhisek.jpg'}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
        />
        {puja.isPopular && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            background: "#388e3c",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}>
            {t('bap_popular') || 'POPULAR'}
          </div>
        )}
        {clientType === "international" ? (
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#c62828",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 7px",
          }}>
            INTL RATE
          </div>
        ) : discount > 0 ? (
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#388e3c",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 7px",
          }}>
            {discount}% OFF
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#212121", marginBottom: 4, lineHeight: 1.35, fontFamily: "'Georgia', serif" }}>
          {displayName}
        </div>

        {/* Rating row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{
            background: "#388e3c",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}>
            {puja.rating}
            <Star size={9} style={{ fill: "#fff", color: "#fff" }} />
          </span>
          <span style={{ fontSize: 11, color: "#878787" }}>({(puja.conducted || 0).toLocaleString()})</span>
        </div>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#212121" }}>
            &#8377;{(calcPrice || 0).toLocaleString("en-IN")}
          </span>
          <span style={{ fontSize: 12, color: "#878787", textDecoration: "line-through" }}>
            &#8377;{(puja.price || 0).toLocaleString("en-IN")}
          </span>
          {clientType !== "international" && discount > 0 && (
            <span style={{ fontSize: 12, color: "#388e3c", fontWeight: 600 }}>{discount}% off</span>
          )}
        </div>

        {/* Duration chip */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "#f5f5f5",
          borderRadius: 2,
          padding: "3px 8px",
          fontSize: 11,
          color: "#555",
          marginBottom: 8,
          width: "fit-content",
        }}>
          <Clock size={11} color="#888" />
          {puja.duration || '1-2 hrs'}
        </div>

        <p style={{
          fontSize: 12, color: "#6b6b6b", lineHeight: 1.45, marginBottom: 12, flex: 1,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {displayDesc}
        </p>

        <button
          onClick={() => onBook(puja)}
          style={{
            width: "100%",
            padding: "10px 0",
            background: "#ff6000",
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 0.3,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#e05500"}
          onMouseLeave={e => e.currentTarget.style.background = "#ff6000"}
        >
          {t('ep_book_now') || 'BOOK NOW'}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function EPujaPage() {
  const t = useT();

  const categories = [t('bap_cat_all'), t('bap_cat_home'), t('bap_cat_wedding'), t('bap_cat_devotional'), t('bap_cat_festival'), t('bap_cat_ritual'), t('bap_cat_remedial'), t('bap_cat_life_events')];

  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [bookedPuja, setBookedPuja] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);

  const [clientType, setClientType] = useState(null);
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [locationError, setLocationError] = useState(null);

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
    { title: t('ep_hero_title1'), subtitle: t('ep_hero_sub'), desc: t('ep_hero_desc1'), hindi: t('ep_hero_hindi1') || "सुख, शांति और समृद्धि के लिए पावन पूजा" },
    { title: t('ep_hero_title2'), subtitle: t('ep_hero_sub'), desc: t('ep_hero_desc2'), hindi: t('ep_hero_hindi2') || "ग्रह दोषों से मुक्ति के लिए ऑनलाइन पूजा" },
  ];

  const steps = [
    { icon: "01", title: t('ep_step1_title') || "Visit PanditJi", desc: t('ep_step1_desc') || "Go to our website to explore puja services and details." },
    { icon: "02", title: t('ep_step2_title') || "Select Your Puja", desc: t('ep_step2_desc') || "Choose the puja you want to perform from our wide list." },
    { icon: "03", title: t('ep_step3_title') || "Advance Booking Payment", desc: t('ep_step3_desc') || "Securely pay in advance to confirm your booking." },
    { icon: "04", title: t('ep_step4_title') || "Perform Online Puja", desc: t('ep_step4_desc') || "Join the online puja session from the comfort of your home." },
  ];

  const advantages = [
    t('ep_adv1') || "Book only verified Pandits for every ritual.",
    t('ep_adv2') || "Experience 100% trust with PanditJi secure booking.",
    t('ep_adv3') || "Get quality services at an affordable price.",
    t('ep_adv4') || "No Hidden Charges – pay only what you see.",
    t('ep_adv5') || "Perform online rituals easily with E-Puja.",
    t('ep_adv6') || "Expert guidance through Astrology services.",
    t('ep_adv7') || "Choose from 180+ Vedic Pujas as you need.",
    t('ep_adv8') || "Follow every custom with complete Hindu Rituals.",
  ];

  const getCalculatedPrice = (basePrice) => {
    if (clientType === "international") return basePrice * 2;
    return Math.round(basePrice * 0.7);
  };

  const detectClientType = () => {
    setCheckingLocation(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please enable permissions or use a modern browser.");
      setCheckingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const countryCode = data.address?.country_code?.toLowerCase();
          if (countryCode) {
            setClientType(countryCode === "in" ? "domestic" : "international");
          } else {
            const isInsideIndia = latitude >= 8.0 && latitude <= 38.0 && longitude >= 68.0 && longitude <= 98.0;
            setClientType(isInsideIndia ? "domestic" : "international");
          }
        } catch {
          const isInsideIndia = latitude >= 8.0 && latitude <= 38.0 && longitude >= 68.0 && longitude <= 98.0;
          setClientType(isInsideIndia ? "domestic" : "international");
        } finally {
          setCheckingLocation(false);
        }
      },
      (error) => {
        let errorMsg = "Please allow location access to continue.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access was denied. Sharing location is mandatory to calculate the proper Vedic service fee (domestic vs. international rates). Please enable location permissions in your browser settings.";
        }
        setLocationError(errorMsg);
        setCheckingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { detectClientType(); }, []);

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const res = await api.get("/pujas");
        if (res.data && res.data.success && res.data.data.length > 0) {
          setPujas(res.data.data);
        } else {
          setPujas(initialPujas);
        }
      } catch {
        setPujas(initialPujas);
      } finally {
        setLoading(false);
      }
    };
    fetchPujas();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setHeroSlide(s => (s + 1) % heroSlides.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = pujas.filter(p => {
    const englishCategory = ['All', 'Home', 'Wedding', 'Devotional', 'Festival', 'Ritual', 'Remedial', 'Life Events'][activeCategoryIndex] || 'All';
    const matchCat = englishCategory === "All" || p.category === englishCategory;
    const localizedName = t(`puja_${p._id || p.id}_name`) || p.name;
    const matchSearch = localizedName.toLowerCase().includes(search.toLowerCase()) || p.name.toLowerCase().includes(search.toLowerCase());
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
    if (!bookingFormDate) { toast.error("Please select a date."); return; }
    if (!bookingFormTime) { toast.error("Please select a time."); return; }
    setBookingFormLoading(true);
    try {
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
        fee: getCalculatedPrice(selectedPujaForBooking.price),
        pujaMode: "online",
        panditId: null,
      };
      const res = await api.post("/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.success) {
        setBookedPuja({ puja: selectedPujaForBooking, date: bookingFormDate });
        setSelectedPujaForBooking(null);
        toast.success("E-Puja booking request created successfully!");
        setTimeout(() => { setBookedPuja(null); navigate("/devotee-dashboard"); }, 3000);
      } else {
        toast.error(res.data?.message || "Booking request failed.");
      }
    } catch {
      toast.error("Failed to make a booking. Please try again.");
    } finally {
      setBookingFormLoading(false);
    }
  };

  /* ── Loading screen ── */
  if (checkingLocation) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #3d0c05 0%, #7b1d0e 50%, #2c1a0e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: 24,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(232,113,10,0.08)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: "1px solid rgba(232,113,10,0.05)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />

        {/* ॐ Om Logo */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          {/* Outer glow ring */}
          <div style={{
            position: "absolute",
            inset: -12,
            borderRadius: "50%",
            border: "2px solid rgba(232,113,10,0.4)",
            animation: "pulse-ring 2s ease-out infinite",
          }} />
          {/* Inner ring */}
          <div style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: "1.5px solid rgba(232,113,10,0.25)",
          }} />
          {/* Om circle */}
          <div style={{
            width: 110,
            height: 110,
            background: "radial-gradient(circle at 35% 35%, rgba(232,113,10,0.25), rgba(123,29,14,0.6))",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid rgba(232,113,10,0.5)",
            boxShadow: "0 0 40px rgba(232,113,10,0.2), inset 0 0 30px rgba(0,0,0,0.3)",
          }}>
            <span style={{
              fontSize: 56,
              lineHeight: 1,
              fontFamily: "'Noto Serif Devanagari', 'Georgia', serif",
              color: "#f97316",
              textShadow: "0 0 20px rgba(249,115,22,0.6), 0 2px 8px rgba(0,0,0,0.5)",
              userSelect: "none",
            }}>
              ॐ
            </span>
          </div>
        </div>

        {/* Brand name */}
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4, color: "rgba(249,115,22,0.8)", marginBottom: 12, textTransform: "uppercase" }}>
          PanditJi
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px", color: "#fff", letterSpacing: -0.2 }}>
          {t('ep_detecting') || 'Detecting your location...'}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, maxWidth: 340, margin: "0 0 36px", lineHeight: 1.7 }}>
          {t('ep_detecting_desc') || 'We need your location to show you the correct service pricing.'}
        </p>

        {/* Spinner */}
        <div style={{
          width: 26,
          height: 26,
          border: "2.5px solid rgba(249,115,22,0.25)",
          borderTopColor: "#f97316",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.7; }
            70% { transform: scale(1.15); opacity: 0; }
            100% { transform: scale(1.15); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  /* ── Location error screen ── */
  if (locationError) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f1f3f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 4,
          padding: "40px 36px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: "#fff3e0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <MapPin size={28} color="#ff6000" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#212121", margin: "0 0 12px" }}>
            {t('ep_loc_req') || 'Location Required'}
          </h2>
          <p style={{ color: "#6b6b6b", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
            {locationError}
          </p>
          <button
            onClick={detectClientType}
            style={{
              width: "100%",
              padding: "14px",
              background: "#ff6000",
              color: "#fff",
              border: "none",
              borderRadius: 2,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.3,
            }}
          >
            {t('ep_grant_loc') || 'ALLOW LOCATION ACCESS'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={{ minHeight: "100vh", background: "#f1f3f6", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Navbar />

      {/* Location status banner */}
      <div style={{
        background: clientType === "international"
          ? "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)"
          : "linear-gradient(135deg, #1b4332 0%, #0c2a1c 100%)",
        color: "#fff",
        padding: "14px 24px",
        fontSize: "13.5px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        borderBottom: "2.5px solid #d4af37", // Auspicious gold border
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>
        <span style={{ fontSize: "18px", display: "inline-flex", alignItems: "center" }}>
          {clientType === "international" ? "🌐" : "🪔"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center" }}>
          {clientType === "international" ? (
            <>
              <span style={{ fontWeight: 700, color: "#fde047", letterSpacing: "0.3px" }}>
                {t('ep_intl_client') || 'International Access Activated'}
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}>
                {t('ep_intl_desc') || 'Location outside India detected. International pricing has been applied.'}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 700, color: "#fde047", letterSpacing: "0.3px" }}>
                {t('ep_dom_client') || 'Blessed Indian Region — 30% Local Discount Applied'}
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}>
                {t('ep_dom_desc') || 'We detected your location in India. Enjoy special local rates for your auspicious E-Puja.'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Success toast */}
      {bookedPuja && (
        <div style={{
          position: "fixed",
          top: 72,
          right: 20,
          background: "#fff",
          borderLeft: "4px solid #388e3c",
          padding: "14px 18px",
          borderRadius: 2,
          zIndex: 9999,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontSize: 13,
          maxWidth: 300,
          animation: "slideIn 0.25s ease",
        }}>
          <div style={{ fontWeight: 700, color: "#212121", marginBottom: 3 }}>
            {t('ep_booking_req') || 'Booking Request Placed!'}
          </div>
          <div style={{ color: "#6b6b6b" }}>
            {t(`puja_${bookedPuja.puja._id || bookedPuja.puja.id}_name`) || bookedPuja.puja.name}
            {bookedPuja.date ? ` — ${bookedPuja.date}` : ""}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedPujaForBooking && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 4,
            width: "100%",
            maxWidth: 480,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
          }}>
            {/* Modal header */}
            <div style={{
              background: "#2874f0",
              color: "#fff",
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>
                  {t('ep_book_epuja') || 'Book E-Puja'}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                  {t(`puja_${selectedPujaForBooking._id || selectedPujaForBooking.id}_name`) || selectedPujaForBooking.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPujaForBooking(null)}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "none",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                &#10005;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmBooking} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: t('ep_sel_date') || 'SELECT DATE', type: "date", value: bookingFormDate, onChange: e => setBookingFormDate(e.target.value), extra: { min: new Date().toISOString().split("T")[0] }, required: true },
                { label: t('ep_sel_time') || 'SELECT TIME', type: "time", value: bookingFormTime, onChange: e => setBookingFormTime(e.target.value), required: true },
                { label: t('ep_your_city') || 'YOUR CITY', type: "text", value: bookingFormCity, onChange: e => setBookingFormCity(e.target.value), required: true, placeholder: t('ep_city_ph') || 'Enter your city' },
                { label: t('ep_medium') || 'MEETING MEDIUM', type: "text", value: bookingFormAddress, onChange: e => setBookingFormAddress(e.target.value), required: true },
              ].map(({ label, type, value, onChange, extra, required, placeholder }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#2874f0", letterSpacing: 0.6, textTransform: "uppercase" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    {...extra}
                    style={{
                      padding: "10px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                      fontSize: 14,
                      color: "#212121",
                      outline: "none",
                      fontFamily: "inherit",
                      background: "#fafafa",
                    }}
                    onFocus={e => e.target.style.borderColor = "#2874f0"}
                    onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              ))}

              {/* Gotra / Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#2874f0", letterSpacing: 0.6, textTransform: "uppercase" }}>
                  {t('ep_gotra') || 'GOTRA / NOTES'}
                </label>
                <textarea
                  value={bookingFormNotes}
                  onChange={e => setBookingFormNotes(e.target.value)}
                  placeholder={t('ep_gotra_ph') || 'Enter your Gotra or any special instructions'}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    fontSize: 14,
                    color: "#212121",
                    height: 72,
                    resize: "none",
                    fontFamily: "inherit",
                    background: "#fafafa",
                    outline: "none",
                  }}
                  onFocus={e => e.target.style.borderColor = "#2874f0"}
                  onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              {/* Fee summary */}
              <div style={{
                background: "#f5f5f5",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>{t('ep_total_fee') || 'Total Fee'}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, color: "#878787", textDecoration: "line-through", marginRight: 8 }}>
                    &#8377;{(selectedPujaForBooking.price || 0).toLocaleString("en-IN")}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#212121" }}>
                    &#8377;{getCalculatedPrice(selectedPujaForBooking.price || 0).toLocaleString("en-IN")}
                  </span>
                  <div style={{ fontSize: 10, color: clientType === "international" ? "#c62828" : "#388e3c", fontWeight: 700, marginTop: 2 }}>
                    {clientType === "international" ? t('ep_intl_rate') || 'International Rate' : t('ep_dom_rate') || 'Domestic Rate'}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setSelectedPujaForBooking(null)}
                  style={{
                    flex: 1,
                    padding: "13px",
                    background: "#fff",
                    color: "#2874f0",
                    border: "1px solid #2874f0",
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    letterSpacing: 0.3,
                  }}
                >
                  {t('ep_cancel') || 'CANCEL'}
                </button>
                <button
                  type="submit"
                  disabled={bookingFormLoading}
                  style={{
                    flex: 2,
                    padding: "13px",
                    background: "#ff6000",
                    color: "#fff",
                    border: "none",
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    letterSpacing: 0.3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    opacity: bookingFormLoading ? 0.8 : 1,
                  }}
                >
                  {bookingFormLoading ? (
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  ) : (t('ep_confirm_booking') || 'CONFIRM BOOKING')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Banner — Flipkart-style full-width */}
      <div style={{
        background: "linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)",
        padding: "0",
        position: "relative",
        overflow: "hidden",
      }}>


        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "36px 32px 40px",
          display: "flex",
          alignItems: "center",
          gap: 40,
          flexWrap: "wrap",
        }}>
          <div style={{
            flex: "0 0 auto",
            width: 180,
            height: 200,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {/* Outer glow rings */}
            <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.15)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
            <div style={{ position: "absolute", width: 145, height: 145, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.2)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
            {/* Main circle */}
            <div style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, rgba(249,115,22,0.3), rgba(123,29,14,0.7))",
              border: "1.5px solid rgba(249,115,22,0.45)",
              boxShadow: "0 0 32px rgba(249,115,22,0.18), inset 0 0 24px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}>
              <span style={{
                fontSize: 58,
                lineHeight: 1,
                fontFamily: "'Noto Serif Devanagari', 'Georgia', serif",
                color: "#fbbf24",
                textShadow: "0 0 18px rgba(251,191,36,0.5)",
                userSelect: "none",
              }}>ॐ</span>
            </div>
            {/* Label below */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 2.5,
              color: "rgba(251,191,36,0.7)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}>
              E · P U J A
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              color: "#fde68a",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 2,
              marginBottom: 10,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              {t('ep_online_epuja') || 'Online E-Puja'}
            </div>
            <h1 style={{
              margin: "0 0 6px",
              color: "#fff",
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.15,
              fontFamily: "'Georgia', serif",
              letterSpacing: -0.5,
            }}>
              {heroSlides[heroSlide].title}
              {" "}
              <span style={{
                background: "#ff6000",
                fontSize: "0.6em",
                padding: "3px 10px",
                borderRadius: 2,
                fontFamily: "'Segoe UI', sans-serif",
                fontWeight: 700,
                letterSpacing: 0,
              }}>
                {heroSlides[heroSlide].subtitle}
              </span>
            </h1>
            <p style={{ color: "#fde68a", fontSize: 15, margin: "6px 0 4px", fontWeight: 500 }}>
              {heroSlides[heroSlide].desc}
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 20px" }}>
              {heroSlides[heroSlide].hindi}
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { icon: <Shield size={13} />, label: t('ep_badge_trusted') || 'Verified Pandits' },
                { icon: <Tag size={13} />, label: t('ep_badge_online') || 'Online Puja' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                  {icon}
                  {label}
                </div>
              ))}
            </div>
            <button
              onClick={() => document.getElementById("puja-listings").scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "#ff6000",
                color: "#fff",
                border: "none",
                borderRadius: 2,
                padding: "13px 28px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              {t('ep_book_now') || 'BOOK NOW'}
            </button>
          </div>
        </div>

        {/* Slide dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 20 }}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              style={{
                width: heroSlide === i ? 20 : 7,
                height: 7,
                borderRadius: 3.5,
                background: heroSlide === i ? "#fff" : "rgba(255,255,255,0.4)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 48px" }} id="puja-listings">

        {/* Section title */}
        <div style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          padding: "14px 20px",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#212121", margin: 0 }}>
              {t('ep_online_services') || 'Online E-Puja Services'}
            </h2>
            <p style={{ color: "#878787", fontSize: 12, margin: "3px 0 0" }}>
              {t('ep_online_services_desc') || 'Perform authentic Vedic rituals from the comfort of your home'}
            </p>
          </div>
          {/* Search */}
          <div style={{ position: "relative", width: 280 }}>
            <span style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#878787",
            }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('ep_search_placeholder') || 'Search pujas...'}
              style={{
                width: "100%",
                padding: "9px 12px 9px 34px",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
                color: "#212121",
              }}
              onFocus={e => e.target.style.borderColor = "#2874f0"}
              onBlur={e => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          marginBottom: 12,
          overflowX: "auto",
          display: "flex",
          whiteSpace: "nowrap",
        }}>
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryIndex(idx)}
              style={{
                padding: "13px 18px",
                border: "none",
                borderBottom: activeCategoryIndex === idx ? "3px solid #2874f0" : "3px solid transparent",
                background: "transparent",
                color: activeCategoryIndex === idx ? "#2874f0" : "#555",
                fontWeight: activeCategoryIndex === idx ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: 0.2,
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results meta */}
        <div style={{
          fontSize: 13,
          color: "#6b6b6b",
          marginBottom: 14,
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <span style={{ fontWeight: 600, color: "#212121" }}>{filtered.length}</span>
          {t('ep_showing_end') || 'puja services found'}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            padding: 60,
            textAlign: "center",
            color: "#2874f0",
            fontWeight: 600,
            fontSize: 15,
          }}>
            {t('ep_loading_pujas') || 'Loading puja services...'}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 48,
          }}>
            {filtered.map(puja => (
              <PujaCard key={puja._id} puja={puja} onBook={handleOpenBookingModal} clientType={clientType} getCalculatedPrice={getCalculatedPrice} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            padding: "56px 24px",
            textAlign: "center",
            color: "#878787",
          }}>
            <svg width="48" height="48" fill="none" stroke="#ccc" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 16 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#555", marginBottom: 6 }}>
              {t('ep_no_pujas_found') || 'No pujas found'}
            </div>
            <div style={{ fontSize: 13 }}>{t('ep_no_pujas_found_sub') || 'Try a different search term or category'}</div>
          </div>
        )}

        {/* How it works */}
        <div style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          padding: "28px 24px 32px",
          marginBottom: 12,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#212121", margin: "0 0 6px" }}>
            {t('ep_why_title') || 'Why E-Puja?'}
          </h2>
          <p style={{ color: "#878787", fontSize: 13, margin: "0 0 24px", lineHeight: 1.6, maxWidth: 680 }}>
            {t('ep_why_desc') || 'Are you out of the country or not present physically? Our e-puja service makes it possible to perform your puja virtually anywhere through WhatsApp, Google Meet, or Zoom.'}
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 1,
            background: "#e0e0e0",
            border: "1px solid #e0e0e0",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                background: "#fff",
                padding: "20px 18px",
                position: "relative",
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  background: "#2874f0",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  marginBottom: 12,
                  letterSpacing: 0.5,
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#212121", marginBottom: 6 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          padding: "28px 24px 32px",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#212121", margin: "0 0 20px" }}>
            {t('ep_advantages_title') || 'PanditJi Advantages'}
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 10,
          }}>
            {advantages.map((adv, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 14px",
                background: "#f9f9f9",
                borderRadius: 3,
                border: "1px solid #f0f0f0",
              }}>
                <CheckCircle size={15} color="#388e3c" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#3d3d3d", lineHeight: 1.45 }}>{adv}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />

      <style>{`
        @keyframes slideIn { from { transform: translateX(80px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; }
      `}</style>
    </div>
  );
}
