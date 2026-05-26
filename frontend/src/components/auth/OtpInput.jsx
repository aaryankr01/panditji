import { useRef, useEffect } from "react";

/**
 * OtpInput — Reusable 6-box OTP input component
 * Matches PanditJi's orange/cream design system
 *
 * Props:
 *   value    {string}   - current OTP string (e.g. "123456")
 *   onChange {function} - called with new OTP string on every change
 *   length   {number}   - number of boxes (default: 6)
 *   autoFocus {boolean} - focus first box on mount (default: true)
 *
 * Usage:
 *   <OtpInput value={otp} onChange={setOtp} />
 */
const OtpInput = ({ value = "", onChange, length = 6, autoFocus = true }) => {
  const inputs = useRef([]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, ""); // digits only
    if (!val) return;
    const arr = value.split("");
    arr[index] = val.slice(-1);
    onChange(arr.join(""));
    // Auto-advance focus
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const arr = value.split("");
      arr[index] = "";
      onChange(arr.join(""));
      if (index > 0) inputs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length));
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  const boxStyle = (filled) => ({
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "700",
    border: filled ? "2px solid #E8710A" : "2px solid #EAD9CC", // styled with theme saffron and brandborder
    borderRadius: "12px",
    backgroundColor: filled ? "#FFF3E8" : "#FAF7F2", // styled with theme saffron-light and surface
    color: "#7B1D0E", // styled with theme maroon
    outline: "none",
    transition: "border 0.15s, background 0.15s",
    cursor: "text",
  });

  return (
    <div
      style={{ display: "flex", gap: "10px", justifyContent: "center" }}
      role="group"
      aria-label="One-time password input"
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          style={boxStyle(!!value[i])}
          aria-label={`OTP digit ${i + 1}`}
          onFocus={(e) => {
            e.target.style.borderColor = "#E8710A";
            e.target.style.boxShadow = "0 0 0 3px rgba(232, 113, 10, 0.15)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "none";
            if (!value[i]) e.target.style.borderColor = "#EAD9CC";
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
