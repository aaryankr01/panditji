const fs = require('fs');
const path = require('path');

const devoteePath = path.join(__dirname, 'DevoteeDashboard.jsx');
let devotee = fs.readFileSync(devoteePath, 'utf8');

// Replace the brand area
const target = `<div className="dd-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>\r\n              <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>\r\n              <span className="dd-brand-om">🕉</span>\r\n              <div>\r\n                <div className="dd-brand-name">पंडितजी</div>\r\n                <div className="dd-brand-sub">Sacred Services</div>\r\n              </div>\r\n            </div>`;

const targetLF = `<div className="dd-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>\n              <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>\n              <span className="dd-brand-om">🕉</span>\n              <div>\n                <div className="dd-brand-name">पंडितजी</div>\n                <div className="dd-brand-sub">Sacred Services</div>\n              </div>\n            </div>`;

const replacement = `<div className="dd-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '10px' }}>
              <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="dd-brand-om">🕉</span>
                <div>
                  <div className="dd-brand-name">पंडितजी</div>
                  <div className="dd-brand-sub">Sacred Services</div>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMobileSidebarOpen(false); }}
                className="dd-close-btn"
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', marginRight: '16px' }}
              >
                <X size={16} />
              </button>
            </div>`;

if (devotee.includes(target)) {
  devotee = devotee.replace(target, replacement);
  fs.writeFileSync(devoteePath, devotee, 'utf8');
  console.log('Devotee patched successfully (CRLF)');
} else if (devotee.includes(targetLF)) {
  devotee = devotee.replace(targetLF, replacement);
  fs.writeFileSync(devoteePath, devotee, 'utf8');
  console.log('Devotee patched successfully (LF)');
} else {
  console.log('Devotee target not found.');
}
