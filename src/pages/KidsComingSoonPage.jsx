import React from 'react';
import { Link } from 'react-router-dom';

function KidsComingSoonPage() {
  // Kids-specific image
  const getKidsImage = () => {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <img
          src={getKidsImage()}
          alt="Kids Collection Coming Soon"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m0 0l-3-3m3 3V8m-9 4a9 9 0 019 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">KIDS COLLECTION</h1>
            <h2 className="text-2xl md:text-3xl font-light mb-6">Coming Soon</h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              We're working on something amazing for your little ones! Our kids collection will feature comfortable, stylish, and durable clothing designed specifically for children.
            </p>
            <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto text-white/80">
              Be the first to know when we launch. Sign up for our newsletter to get exclusive early access and special offers.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">What to Expect</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a4 4 0 014-4h6a4 4 0 014 4v12M9 21a4 4 0 01-4-4V5a4 4 0 014-4h6a4 4 0 014 4v12" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Quality Materials</h4>
              <p className="text-gray-600">
                Premium fabrics that are soft on skin and durable for everyday adventures
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M7 3v4M9 3v4M11 3v4M13 3v4M15 3v4M4 21h16M4 21v-4M4 17h-1M4 13h-1M4 9h-1M4 5h-1" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Kid-Friendly Designs</h4>
              <p className="text-gray-600">
                Fun colors and patterns that kids will love to wear
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m0 0l-3-3m3 3V8m-9 4a9 9 0 019 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Easy Care</h4>
              <p className="text-gray-600">
                Machine washable fabrics that make life easier for parents
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Get notified when our kids collection launches. Be the first to shop exclusive early bird offers!
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors">
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-black hover:text-gray-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7v8m0 0l-7 7m7-7v8" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default KidsComingSoonPage;
