import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaThumbsUp } from 'react-icons/fa';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function StarRow({ value, max = 5, size = 'md' }) {
  const v = Math.round(Number(value) || 0);
  const cls = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <span className={`flex gap-0.5 ${cls} text-black`} aria-hidden>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < v ? '' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductReviews({ productId, onReviewsChanged }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    numReviews: 0,
    fiveStarCount: 0,
    totalReviews: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadError, setLoadError] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const load = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setLoadError(null);
      const res = await api.get(`/products/${productId}/reviews`, {
        params: { page, limit: 8 }
      });
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
      setLoadError('Reviews could not be loaded. You can still browse this product.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const customerGallery = reviews
    .flatMap((r) => (r.images || []).filter(Boolean))
    .slice(0, 6);
  const moreImages = Math.max(
    0,
    reviews.reduce((n, r) => n + (r.images?.length || 0), 0) - customerGallery.length
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to write a review');
      return;
    }
    const text = comment.trim();
    if (text.length < 10) {
      toast.error('Please write at least 10 characters');
      return;
    }
    const images = imageUrl.trim() ? [imageUrl.trim()] : [];
    try {
      setSubmitting(true);
      const res = await api.post(`/products/${productId}/reviews`, {
        rating: Number(rating),
        comment: text,
        images
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Review submitted');
        setComment('');
        setImageUrl('');
        setPage(1);
        await load();
        onReviewsChanged?.();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.info('Sign in to mark reviews as helpful');
      return;
    }
    try {
      const res = await api.post(
        `/products/${productId}/reviews/${reviewId}/helpful`,
        {}
      );
      if (res.data?.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId ? { ...r, helpfulCount: res.data.helpfulCount } : r
          )
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update');
    }
  };

  const avg = summary.averageRating ?? 0;
  const total = summary.totalReviews ?? 0;
  const five = summary.fiveStarCount ?? 0;

  return (
    <section id="product-reviews" className="border-t border-gray-200 mt-12 pt-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left py-2"
      >
        <h2 className="text-lg font-bold tracking-wide text-gray-900">REVIEWS</h2>
        <span className="text-xl text-gray-500">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="pb-8 space-y-8">
          {loadError && (
            <p
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              role="status"
            >
              {loadError}
            </p>
          )}
          {loading && reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">Loading reviews…</p>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-gray-100 pb-6">
                <div>
                  <p className="text-4xl font-bold text-gray-900 leading-none">
                    {total ? avg.toFixed(1) : '—'}
                  </p>
                  <StarRow value={avg} size="lg" />
                  <p className="text-sm text-gray-600 mt-2 max-w-xs">
                    {total ? (
                      <>
                        Loved by shoppers! <strong>{five}</strong> out of{' '}
                        <strong>{total}</strong> rated 5 stars.
                      </>
                    ) : (
                      'No reviews yet — be the first to share your experience.'
                    )}
                  </p>
                </div>
              </div>

              {customerGallery.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Customer images
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {customerGallery.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-16 h-16 rounded overflow-hidden border border-gray-200 bg-gray-50"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                    {moreImages > 0 && (
                      <div className="shrink-0 w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                        +{moreImages}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                  Customer reviews
                </h3>
                <ul className="space-y-6">
                  {reviews.map((r) => (
                    <li
                      key={r._id}
                      className="border-b border-gray-100 pb-6 last:border-0"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 bg-black text-white text-xs font-bold px-2 py-0.5 rounded">
                          {r.rating} ★
                        </span>
                        <span className="font-semibold text-gray-900">{r.name}</span>
                        {r.verifiedPurchase && (
                          <span className="text-xs font-semibold text-amber-600">
                            Verified buyer
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {r.comment}
                      </p>
                      {r.images?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {r.images.slice(0, 3).map((url) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-14 h-14 rounded overflow-hidden border border-gray-200"
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleHelpful(r._id)}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black"
                        >
                          <FaThumbsUp className="opacity-70" />
                          Helpful ({r.helpfulCount ?? 0})
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="text-sm text-gray-600 disabled:opacity-30"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="text-sm text-gray-600 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Write a review</h3>
                {!isAuthenticated && (
                  <p className="text-sm text-gray-600 mb-4">
                    Sign in to share feedback and help us improve.
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-auto"
                      disabled={!isAuthenticated}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} stars
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Your experience (min 10 characters)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Fit, fabric, delivery — what should other buyers know?"
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Photo link (optional)
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="https://… (ImageKit, Imgur, etc.)"
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!isAuthenticated || submitting}
                    className="bg-black text-white px-6 py-2.5 text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-40"
                  >
                    {submitting ? 'Submitting…' : 'Submit review'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
