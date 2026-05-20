import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const categories = ["All", "Devotional", "Remedial", "Festival", "Celebration", "Ancestral"];

const pujaEmojis = {
  Devotional: "🙏", Remedial: "🔯", Festival: "🪔", Celebration: "🎊", Ancestral: "🪷"
};

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

function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.floor(rating) ? "#f59e0b" : i - 0.5 <= rating ? "url(#half)" : "#e5e7eb"}>
          <defs>
            <linearGradient id="half"><stop offset="50%" stopColor="#f59e0b" /><stop offset="50%" stopColor="#e5e7eb" /></linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 2 }}>{rating}</span>
    </div>
  );
}

function PujaCard({ puja, onBook }) {
  const bgColors = {
    Devotional: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    Remedial: "linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)",
    Festival: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    Celebration: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    Ancestral: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      border: "1px solid #f3f4f6",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; }}
    >
      {/* Image placeholder with gradient */}
      <div style={{
        background: bgColors[puja.category] || bgColors.Devotional,
        height: 180,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontSize: 56,
      }}>
        {pujaEmojis[puja.category] || "🙏"}
        {puja.discount && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "#ef4444",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 20,
          }}>{puja.discount}% OFF</div>
        )}
        {puja.tag && (
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "#7c3aed",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 20,
          }}>{puja.tag}</div>
        )}
      </div>

      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {puja.category}
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
          {puja.name}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#ea580c" }}>
            ₹{puja.price.toLocaleString("en-IN")}
          </span>
          {puja.originalPrice && (
            <span style={{ fontSize: 13, color: "#9ca3af", textDecoration: "line-through" }}>
              ₹{puja.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <StarRating rating={puja.rating} />

        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          <button
            onClick={() => onBook(puja)}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
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
        if (res.data && res.data.success) {
          setPujas(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load pujas from API:", err);
        toast.error("Could not fetch Puja services from server.");
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
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: 24,
                border: "1px solid",
                borderColor: activeCategory === cat ? "#ea580c" : "#e5e7eb",
                background: activeCategory === cat ? "#ea580c" : "#fff",
                color: activeCategory === cat ? "#fff" : "#6b7280",
                fontWeight: activeCategory === cat ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat !== "All" && pujaEmojis[cat]} {cat}
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
