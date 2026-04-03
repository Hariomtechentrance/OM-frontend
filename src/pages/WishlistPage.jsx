import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-white pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{totalItems} item(s) saved</p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50"
            >
              Clear Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Tap the heart on products to save them here.</p>
            <Link
              to="/products"
              className="inline-block px-5 py-2.5 rounded-md bg-black text-white hover:bg-gray-800"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <div key={item.productId} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => navigate(`/product/${item.productId}`)}
                >
                  <img
                    src={item.image || 'https://dummyimage.com/600x600/efefef/444&text=Product'}
                    alt={item.name}
                    className="w-full h-64 object-cover"
                  />
                </button>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px]">{item.name}</h3>
                  <p className="text-lg font-bold text-gray-900 mt-1">₹{item.price}</p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.productId)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
