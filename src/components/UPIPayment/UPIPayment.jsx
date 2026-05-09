import React, { useState } from 'react';
import { toast } from 'react-toastify';

const UPI_APPS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '📱',
    color: 'bg-purple-500',
    upiScheme: 'phonepe'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: '💰',
    color: 'bg-blue-500',
    upiScheme: 'paytm'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    icon: '🔵',
    color: 'bg-green-500',
    upiScheme: 'gpay'
  },
  {
    id: 'bhim',
    name: 'BHIM',
    icon: '🏦',
    color: 'bg-orange-500',
    upiScheme: 'bhim'
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    icon: '🛒',
    color: 'bg-yellow-500',
    upiScheme: 'amazonpay'
  },
  {
    id: 'mobikwik',
    name: 'MobiKwik',
    icon: '💳',
    color: 'bg-red-500',
    upiScheme: 'mobikwik'
  }
];

function UPIPayment({ amount, merchantVPA, transactionId, onPaymentComplete, onCancel }) {
  const [selectedApp, setSelectedApp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: UPI ID entry, 2: App selection, 3: Payment
  const [upiVerified, setUpiVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  const handleAppSelection = (appId) => {
    setSelectedApp(appId);
  };

  // Validate UPI ID format
  const validateUpiId = (upiId) => {
    // More lenient UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Also accept simple format without domain extension for testing
    const simpleRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    
    return (upiRegex.test(upiId) || simpleRegex.test(upiId)) && upiId.length >= 5;
  };

  // Handle UPI ID verification
  const handleUpiVerification = async () => {
    if (!upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    if (!validateUpiId(upiId)) {
      toast.error('Please enter a valid UPI ID (e.g., yourname@ybl, test@paytm, user@okaxis)');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate UPI ID verification API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock verification code (in real implementation, this would be sent to user's UPI app)
      const mockCode = 'UPI123';
      setVerificationCode(mockCode);
      setUpiVerified(true);
      setStep(2);
      
      toast.success('UPI ID verified! Verification code sent to your UPI app.');
      console.log('Mock verification code for testing:', mockCode);
      
    } catch (error) {
      console.error('UPI verification error:', error);
      toast.error('UPI ID verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle verification code confirmation
  const handleVerificationCodeConfirm = () => {
    if (verificationCode === 'UPI123') { // Mock code for testing
      setStep(3);
      toast.success('Verification successful! Please select your UPI app.');
    } else {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const generateUPIUrl = (appId, upiId, amount, merchantVpa, transactionId) => {
    // Use the user's UPI ID as the payee (receiver) instead of merchant
    const params = new URLSearchParams({
      pa: upiId, // Pay to user's UPI ID
      pn: 'Black Locust', // Payer name
      tr: transactionId, // Transaction ID
      tn: 'Payment for Black Locust order', // Transaction note
      am: amount.toString(), // Amount in paise
      cu: 'INR', // Currency
      mc: '5814', // Merchant category code
      mode: 'UPI' // Payment mode
    });

    // Different UPI apps have different URL schemes
    const schemes = {
      phonepe: `phonepe://pay?${params.toString()}`,
      paytm: `paytmmp://pay?${params.toString()}`,
      googlepay: `gpay://upi/pay?${params.toString()}`,
      bhim: `bhim://upi/pay?${params.toString()}`,
      amazonpay: `amazonpay://upi/pay?${params.toString()}`,
      mobikwik: `mobikwik://upi/pay?${params.toString()}`
    };

    return schemes[appId] || schemes.phonepe;
  };

  const handlePayment = async () => {
    if (!selectedApp) {
      toast.error('Please select a UPI app');
      return;
    }

    if (!upiVerified) {
      toast.error('Please verify your UPI ID first');
      return;
    }

    setIsProcessing(true);

    try {
      const upiUrl = generateUPIUrl(selectedApp, upiId, amount, merchantVPA, transactionId);
      
      console.log('Generated UPI URL:', upiUrl);
      setPaymentLink(upiUrl);
      
      // Multiple methods to open UPI app
      const openUPIApp = (url) => {
        // Method 1: Direct window.location change for mobile
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          window.location.href = url;
        } else {
          // Method 2: For desktop, try to open in new window
          const newWindow = window.open(url, '_blank', 'width=400,height=600');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            // Method 3: Fallback - show the link for manual copy
            toast.error('Could not open UPI app. Please use the payment link manually.');
          }
        }
      };

      // Try to open the UPI app
      openUPIApp(upiUrl);
      
      // Show success message
      toast.success(`Opening ${selectedApp} for payment...`);
      
      // Show the payment link for manual copy after 2 seconds
      setTimeout(() => {
        toast.info(`Payment link copied to clipboard!`, {
          autoClose: 5000,
          position: 'top-center'
        });
        
        // Copy to clipboard
        if (navigator.clipboard) {
          navigator.clipboard.writeText(upiUrl);
        }
      }, 2000);
      
      // Simulate payment completion (in real implementation, you'd use webhooks)
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentComplete({
          method: 'upi',
          app: selectedApp,
          upiId: upiId,
          transactionId: transactionId,
          amount: amount,
          status: 'completed',
          verifiedAt: new Date().toISOString()
        });
      }, 5000); // 5 seconds for user to complete payment
      
    } catch (error) {
      console.error('UPI Payment Error:', error);
      setIsProcessing(false);
      toast.error('Failed to open UPI app. Please try again.');
    }
  };

  // Handle back/cancel based on current step
  const handleBack = () => {
    if (step === 1) {
      onCancel();
    } else if (step === 2) {
      setStep(1);
      setUpiVerified(false);
      setVerificationCode('');
    } else if (step === 3) {
      setStep(2);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        {step === 1 && 'UPI Payment - Enter UPI ID'}
        {step === 2 && 'UPI Payment - Verify Code'}
        {step === 3 && 'UPI Payment - Select App'}
      </h3>

      {/* Step 1: UPI ID Entry */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="test@ybl or yourname@paytm"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black"
              disabled={isProcessing}
              style={{ fontSize: '14px', color: '#111827' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Examples: test@ybl, yourname@paytm, user@okaxis, demo@upi
            </p>
          </div>

          {/* Payment Amount Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount to pay:</span>
              <span className="text-lg font-bold text-gray-900">₹{amount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpiVerification}
              disabled={isProcessing || !upiId}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Verifying...' : 'Verify UPI ID'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Verification Code */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Verification Code Sent!</strong> A verification code has been sent to your UPI app.
              <br />
              <span className="text-xs">For demo, use code: <strong>UPI123</strong></span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="UPI123"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-black"
              disabled={isProcessing}
              style={{ fontSize: '14px', color: '#111827' }}
            />
          </div>

          {/* UPI ID Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>UPI ID:</strong> {upiId}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleVerificationCodeConfirm}
              disabled={isProcessing || !verificationCode}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Verifying...' : 'Confirm Code'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: App Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>UPI ID Verified!</strong> Please select your preferred UPI app.
            </p>
          </div>

          {/* UPI Apps Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose your preferred UPI app
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {UPI_APPS.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleAppSelection(app.id)}
                  disabled={isProcessing}
                  className={`p-3 border rounded-lg transition-all duration-200 ${
                    selectedApp === app.id
                      ? 'border-black bg-gray-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 ${app.color} rounded-full flex items-center justify-center text-white text-xl`}>
                      {app.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{app.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Amount Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount to pay:</span>
              <span className="text-lg font-bold text-gray-900">₹{amount}</span>
            </div>
          </div>

          {/* Payment Link Display */}
          {paymentLink && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm font-medium text-blue-800 mb-2">Payment Link:</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 text-xs bg-white border border-blue-300 rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentLink);
                    toast.success('Payment link copied to clipboard!');
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                If the UPI app doesn't open automatically, please copy this link and paste it in your UPI app.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handlePayment}
              disabled={isProcessing || !selectedApp}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Pay with ${selectedApp ? UPI_APPS.find(app => app.id === selectedApp)?.name : 'UPI'}`}
            </button>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {step === 1 && 'Verifying UPI ID...'}
              {step === 2 && 'Confirming verification...'}
              {step === 3 && 'Opening UPI app...'}
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Secure Payment:</strong> Your UPI ID is verified and payment is processed securely through your UPI app.
        </p>
      </div>
    </div>
  );
}

export default UPIPayment;
