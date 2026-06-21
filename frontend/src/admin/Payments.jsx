import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import AdminDashboardLayout from './AdminDashboard';
import { CreditCard, Coins, Upload, X, ExternalLink } from 'lucide-react';

const Payments = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState('devotee_payments'); // 'devotee_payments' | 'payouts'
  
  // Devotee transactions state
  const [payments, setPayments] = useState([]);
  
  // Weekly payouts state
  const [pendingPayouts, setPendingPayouts] = useState([]);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/admin/login'); return; }
    
    // Fetch devotee payments
    api.get('/admin/payments')
      .then(res => setPayments(res.data.data || []))
      .catch(console.error);
  }, [token, navigate, user]);

  const fetchPendingPayouts = () => {
    api.get('/admin/payouts/pending')
      .then(res => setPendingPayouts(res.data.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    if (activeSubTab === 'payouts') {
      fetchPendingPayouts();
    }
  }, [activeSubTab]);

  const handleProcessPayoutSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      alert('Please enter a Transaction ID');
      return;
    }
    if (!receiptFile) {
      alert('Please upload a screenshot of the payment receipt');
      return;
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append('panditId', selectedPayout.pandit._id);
    formData.append('transactionId', transactionId);
    formData.append('payoutMethod', selectedPayout.pandit.panditProfile?.bankDetails?.payoutMethod || 'bank_transfer');
    formData.append('receipt', receiptFile);
    
    const paymentIds = selectedPayout.payments.map(p => p._id);
    formData.append('paymentIds', JSON.stringify(paymentIds));

    try {
      await api.post('/admin/payouts/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      alert('Payout processed successfully!');
      setSelectedPayout(null);
      setTransactionId('');
      setReceiptFile(null);
      fetchPendingPayouts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to process payout.');
    } finally {
      setProcessing(false);
    }
  };

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <AdminDashboardLayout activeTab="/admin/payments">
      <div className="p-8 overflow-y-auto flex-1 bg-gray-50">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Financial Ledger</h2>
            <p className="text-sm text-gray-500 mt-1">Manage devotee transactions and weekly Pandit payouts.</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 font-bold">
            Total Company Income: ₹{(totalRevenue / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveSubTab('devotee_payments')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all border-b-2 ${
              activeSubTab === 'devotee_payments' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <CreditCard size={16} /> Devotee Payments
          </button>
          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm transition-all border-b-2 ${
              activeSubTab === 'payouts' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Coins size={16} /> Weekly Pandit Payouts
          </button>
        </div>

        {/* TAB 1: Devotee Payments List */}
        {activeSubTab === 'devotee_payments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Transaction ID</th>
                  <th className="p-4 font-semibold">Devotee</th>
                  <th className="p-4 font-semibold">Pandit</th>
                  <th className="p-4 font-semibold">Booking Fee</th>
                  <th className="p-4 font-semibold">Pandit Share (90%)</th>
                  <th className="p-4 font-semibold">Method</th>
                  <th className="p-4 font-semibold">Payout Status</th>
                  <th className="p-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                    <td className="p-4 font-mono text-xs text-gray-500">{p.transactionId || p.razorpayPaymentId || '-'}</td>
                    <td className="p-4 text-gray-800">{p.devotee?.firstName} {p.devotee?.lastName}</td>
                    <td className="p-4 text-gray-600">Pt. {p.pandit?.firstName} {p.pandit?.lastName}</td>
                    <td className="p-4 font-bold text-gray-800">₹{(p.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-green-700 font-semibold">₹{(p.panditEarnings / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 text-gray-600 capitalize">{p.paymentMethod}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${
                        p.payoutStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.payoutStatus || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && <div className="p-8 text-center text-gray-400">No payment records yet.</div>}
          </div>
        )}

        {/* TAB 2: Pandit Weekly Payouts List */}
        {activeSubTab === 'payouts' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="p-4 font-semibold">Pandit</th>
                  <th className="p-4 font-semibold">Preferred Payout Method</th>
                  <th className="p-4 font-semibold">Payment Details / QR</th>
                  <th className="p-4 font-semibold">Eligible Weekly Amount</th>
                  <th className="p-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayouts.map(p => (
                  <tr key={p.pandit._id} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                    <td className="p-4 font-bold text-gray-800">
                      <div>Pt. {p.pandit.firstName} {p.pandit.lastName}</div>
                      <div className="text-xs text-gray-400 font-normal">{p.pandit.email} | {p.pandit.phone}</div>
                    </td>
                    <td className="p-4 text-gray-600 capitalize">
                      {p.pandit.panditProfile?.bankDetails?.payoutMethod?.replace('_', ' ') || 'Bank Transfer'}
                    </td>
                    <td className="p-4 text-gray-600">
                      {p.pandit.panditProfile?.bankDetails?.payoutMethod === 'upi' ? (
                        <span className="font-mono text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg border border-orange-100">
                          {p.pandit.panditProfile.bankDetails.upiId}
                        </span>
                      ) : p.pandit.panditProfile?.bankDetails?.payoutMethod === 'qr_code' ? (
                        p.pandit.panditProfile.bankDetails.qrCode ? (
                          <a 
                            href={p.pandit.panditProfile.bankDetails.qrCode} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-orange-600 font-bold hover:underline"
                          >
                            View QR Code <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-red-500 text-xs font-semibold">No QR Uploaded</span>
                        )
                      ) : (
                        <div className="text-xs leading-normal">
                          <div><strong>Holder:</strong> {p.pandit.panditProfile?.bankDetails?.accountHolderName || '-'}</div>
                          <div><strong>Acc:</strong> {p.pandit.panditProfile?.bankDetails?.accountNumber || '-'}</div>
                          <div><strong>Bank:</strong> {p.pandit.panditProfile?.bankDetails?.bankName || '-'}</div>
                          <div><strong>IFSC:</strong> {p.pandit.panditProfile?.bankDetails?.ifscCode || '-'}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-green-700 text-base">
                      ₹{(p.pendingAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedPayout(p)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all"
                      >
                        Process Payout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pendingPayouts.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                <Coins size={36} className="mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-500">No pending payouts due</p>
                <p className="text-xs text-gray-400 mt-1">All weekly completed pujas before this Monday have been settled.</p>
              </div>
            )}
          </div>
        )}

        {/* Process Payout Modal */}
        {selectedPayout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => setSelectedPayout(null)}
                className="absolute top-6 right-6 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">Process Weekly Payout</h3>
              <p className="text-sm text-gray-500 mb-6">Process manual payment details to update the Pandit's earnings ledger.</p>
              
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 text-sm text-gray-700">
                <div className="mb-2"><strong>Pandit:</strong> Pt. {selectedPayout.pandit.firstName} {selectedPayout.pandit.lastName}</div>
                <div className="mb-2"><strong>Payout Sum:</strong> <span className="text-green-700 font-bold">₹{(selectedPayout.pendingAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div className="mb-2"><strong>Method:</strong> <span className="capitalize">{selectedPayout.pandit.panditProfile?.bankDetails?.payoutMethod?.replace('_', ' ') || 'Bank Transfer'}</span></div>
                
                {/* Method instructions */}
                <div className="mt-3 pt-3 border-t border-orange-200/50">
                  <p className="font-semibold text-gray-800 mb-1">Transfer Destination Details:</p>
                  {selectedPayout.pandit.panditProfile?.bankDetails?.payoutMethod === 'upi' ? (
                    <div>UPI ID: <span className="font-mono font-bold text-orange-800">{selectedPayout.pandit.panditProfile.bankDetails.upiId}</span></div>
                  ) : selectedPayout.pandit.panditProfile?.bankDetails?.payoutMethod === 'qr_code' ? (
                    <div>
                      {selectedPayout.pandit.panditProfile.bankDetails.qrCode ? (
                        <a href={selectedPayout.pandit.panditProfile.bankDetails.qrCode} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline font-bold inline-flex items-center gap-1">
                          Open Payout QR Link <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-red-500">No QR Code available. Contact Pandit.</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs space-y-1">
                      <div><strong>Holder:</strong> {selectedPayout.pandit.panditProfile?.bankDetails?.accountHolderName || '-'}</div>
                      <div><strong>Acc:</strong> {selectedPayout.pandit.panditProfile?.bankDetails?.accountNumber || '-'}</div>
                      <div><strong>Bank:</strong> {selectedPayout.pandit.panditProfile?.bankDetails?.bankName || '-'}</div>
                      <div><strong>IFSC:</strong> {selectedPayout.pandit.panditProfile?.bankDetails?.ifscCode || '-'}</div>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleProcessPayoutSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Transaction ID / Reference Number</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                    placeholder="e.g. UTR123456789 or TXN-987654"
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Upload Payment Receipt Screenshot</label>
                  <div className="border-2 border-dashed border-gray-200 hover:border-orange-500/50 rounded-2xl p-4 transition-all relative flex flex-col items-center justify-center bg-gray-50 cursor-pointer">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={e => setReceiptFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={24} className="text-gray-400 mb-2" />
                    {receiptFile ? (
                      <p className="text-xs font-semibold text-green-700">{receiptFile.name}</p>
                    ) : (
                      <p className="text-xs text-gray-500 text-center">Click or drag & drop receipt image to upload</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedPayout(null)}
                    className="flex-1 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 p-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-orange-600/10 flex items-center justify-center gap-2"
                  >
                    {processing ? 'Processing...' : 'Mark as Paid'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminDashboardLayout>
  );
};

export default Payments;
