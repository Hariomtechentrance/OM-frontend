import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function TrackOrderPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [orderId, setOrderId] = useState(location.state?.orderId || '');
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If we arrived from success page, orderId will be present in navigation state.
    if (orderId) {
      (async () => {
        setLoading(true);
        try {
          const res = await api.get(`/orders/${orderId}/track`);
          setTracking(res.data?.tracking || null);
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to load tracking');
          setTracking(null);
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, orderId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error('Please enter your Order ID');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/orders/${orderId.trim()}/track`);
      setTracking(res.data?.tracking || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load tracking');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Order</h1>
        <p className="text-gray-600 mb-8">
          Enter your Order ID (shown on the success page) to see the latest shipping status.
        </p>

        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 662c5d9f1c..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Track'}
          </button>
        </form>

        {tracking ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Status: <span className="text-black">{tracking.status}</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Order Number: <span className="font-medium text-gray-900">{tracking.orderNumber}</span>
            </p>

            {tracking.trackingUrl ? (
              <p className="text-sm text-gray-600 mb-6">
                Tracking URL:{' '}
                <a href={tracking.trackingUrl} target="_blank" rel="noreferrer" className="text-black underline">
                  {tracking.trackingUrl}
                </a>
              </p>
            ) : null}

            <div className="space-y-3">
              {(tracking.timeline || []).map((t, idx) => (
                <div key={`${t.status}-${idx}`} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 ${t.completed ? 'bg-black' : 'bg-gray-300'}`} />
                  <div>
                    <div className="font-medium text-gray-900">{t.title}</div>
                    <div className="text-sm text-gray-600">{t.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="text-gray-600">Loading tracking…</div>
        ) : (
          <div className="text-gray-600">No tracking data yet.</div>
        )}
      </div>
    </div>
  );
}

export default TrackOrderPage;

