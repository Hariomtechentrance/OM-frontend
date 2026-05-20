import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

// Pages where the back button should NOT appear
const NO_BACK_PAGES = ['/', '/login', '/register', '/admin/login'];

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (NO_BACK_PAGES.includes(location.pathname)) return null;
  if (window.history.length <= 1) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="flex items-center justify-center p-2 text-gray-600 hover:text-black transition-colors"
    >
      <FaArrowLeft className="w-4 h-4" />
    </button>
  );
};

export default BackButton;
