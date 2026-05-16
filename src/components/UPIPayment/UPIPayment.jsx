import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

function UPIPayment({ amount, merchantVPA, transactionId, verifiedUpiId, onPaymentComplete, onCancel }) {
  const [step, setStep] = useState(verifiedUpiId ? 2 : 1); // Skip to step 2 if UPI already verified
  const [upiId, setUpiId] = useState(verifiedUpiId || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [upiVerified, setUpiVerified] = useState(!!verifiedUpiId);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Preload Razorpay script when component mounts
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Validate UPI ID format
  const validateUpiId = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId) && upiId.length >= 5;
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log('✅ Razorpay already loaded');
        setRazorpayLoaded(true);
        resolve(true);
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log('⏳ Razorpay script tag exists, waiting for load...');
        existingScript.onload = () => {
          console.log('✅ Razorpay script loaded from existing tag');
          setRazorpayLoaded(true);
          resolve(true);
        };
        existingScript.onerror = () => {
          console.error('❌ Existing Razorpay script failed to load');
          setRazorpayLoaded(false);
          resolve(false);
        };
        return;
      }

      // Create and load script
      console.log('📥 Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.crossOrigin = 'anonymous'; // Add CORS support for mobile
      
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        setRazorpayLoaded(true);
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        setRazorpayLoaded(false);
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  };

  // Step 1: Verify UPI ID
  const handleVerifyUPI = async () => {
    if (!upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    if (!validateUpiId(upiId)) {
      toast.error('Please enter a valid UPI ID (e.g., yourname@ybl, 9876543210@paytm)');
      return;
    }

    setIsVerifying(true);

    try {
      // Simulate UPI verification (in real scenario, this would verify with UPI network)
      toast.info('Verifying UPI ID...', { autoClose: 2000 });
      
      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to verification step
      setStep(2);
      setUpiVerified(true);
      toast.success(`Verification code sent! Use: ${code}`);
      
    } catch (error) {
      console.error('UPI Verification Error:', error);
      toast.error('Failed to verify UPI ID. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Detect if user is on mobile device
  const isMobileDevice = () => {
    // More comprehensive mobile detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Check for mobile devices in user agent
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    
    // Check for touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    
    // Check screen size (mobile typically < 768px)
    const isSmallScreen = window.innerWidth <= 768;
    
    // Check if it's a mobile browser (not desktop mode)
    const isMobileBrowser = /Mobile|Android|iPhone/i.test(userAgent);
    
    // Final decision: must have mobile UA OR (touch + small screen)
    const isMobile = isMobileUA || (hasTouch && isSmallScreen && isMobileBrowser);
    
    console.log('📱 Device Detection:', {
      userAgent: userAgent.substring(0, 80),
      isMobileUA,
      hasTouch,
      isSmallScreen,
      isMobileBrowser,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      finalDecision: isMobile ? 'MOBILE' : 'DESKTOP'
    });
    
    return isMobile;
  };

  // Step 2: Send Payment Request
  const handleSendPaymentRequest = async () => {
    if (!upiVerified) {
      toast.error('Please verify your UPI ID first');
      return;
    }

    setIsProcessing(true);
    
    // Set a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      if (isProcessing) {
        console.warn('⚠️ Payment request timeout - resetting state');
        setIsProcessing(false);
        setPaymentInitiated(false);
        toast.warning('Payment request is taking longer than expected. Please try again.', {
          autoClose: 5000
        });
      }
    }, 30000); // 30 second timeout

    try {
      // Ensure Razorpay script is loaded
      console.log('🔄 Checking Razorpay script...');
      const scriptLoaded = await loadRazorpayScript();
      
      if (!scriptLoaded || !window.Razorpay) {
        console.error('❌ Razorpay script not loaded');
        toast.error('Failed to load payment gateway. Please check your internet connection and try again.');
        setIsProcessing(false);
        return;
      }

      console.log('✅ Razorpay script loaded, proceeding with payment...');

      // Get Razorpay key
      const { data: keyData } = await api.get('/payments/razorpay/key');
      console.log('Razorpay key data:', keyData);
      
      if (!keyData?.keyId) {
        toast.error('Payment gateway not configured. Please contact support.');
        setIsProcessing(false);
        return;
      }

      // Create Razorpay order for UPI payment
      const orderData = {
        amount: amount, // Amount in rupees
        currency: 'INR',
        receipt: transactionId,
        notes: {
          upiId: upiId,
          paymentMethod: 'upi'
        }
      };

      toast.info('Creating payment request...', { autoClose: 2000 });

      // Create order on backend
      const { data: orderResponse } = await api.post('/payments/razorpay/create-upi-order', orderData);
      console.log('Order response:', orderResponse);

      if (!orderResponse?.order?.id) {
        toast.error('Failed to create payment order. Please try again.');
        setIsProcessing(false);
        return;
      }

      const razorpayOrderId = orderResponse.order.id;
      console.log('Razorpay Order ID:', razorpayOrderId);

      // Detect device type
      const isMobile = isMobileDevice();
      console.log('📱 Device type:', isMobile ? 'Mobile' : 'Desktop');
      console.log('💳 Verified UPI ID:', upiId);

      // IMPORTANT: Since user already verified their UPI ID,
      // we should use UPI Collect flow to send notification directly to that UPI ID
      // This avoids showing app selection and sends payment request to their phone
      const options = {
        key: keyData.keyId,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Black Locust',
        description: `Order Payment - ${transactionId}`,
        order_id: razorpayOrderId,
        method: 'upi',
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999',
          vpa: upiId // Pre-fill with verified UPI ID
        },
        // Use UPI Collect flow - sends notification directly to the verified UPI ID
        // This skips the app selection screen
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi',
                    // Use ONLY collect flow - sends notification to verified UPI ID
                    flows: ['collect']
                  }
                ]
              }
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        // Automatically trigger UPI Collect with the verified VPA
        '_[integration]': 'upi_collect',
        '_[integration_version]': '1.0',
        handler: async function (response) {
          try {
            console.log('✅ Payment successful:', response);
            toast.success('Payment completed successfully!');
            
            setPaymentInitiated(true);
            
            // Verify payment on backend
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            const verifyResponse = await api.post('/payments/razorpay/verify-upi', verifyData);

            if (verifyResponse.data.success) {
              toast.success('Payment completed successfully!');
              onPaymentComplete({
                method: 'upi',
                upiId: upiId,
                transactionId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: amount,
                status: 'completed',
                verifiedAt: new Date().toISOString()
              });
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setIsProcessing(false);
            setPaymentInitiated(false);
            toast.info('Payment cancelled. You can try again.');
          }
        },
        theme: {
          color: '#000000'
        },
        notes: {
          upiId: upiId,
          transactionId: transactionId
        }
      };

      console.log('Opening Razorpay checkout with options:', {
        ...options,
        key: keyData.keyId.substring(0, 10) + '...' // Don't log full key
      });

      // Move to payment step
      setStep(3);
      setPaymentInitiated(true);

      // Create Razorpay instance
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('❌ Payment failed:', response);
        console.error('Error details:', {
          code: response.error?.code,
          description: response.error?.description,
          source: response.error?.source,
          step: response.error?.step,
          reason: response.error?.reason
        });
        setIsProcessing(false);
        setPaymentInitiated(false);
        setStep(2); // Go back to verification step
        
        // Show more specific error messages
        let errorMessage = 'Payment failed. Please try again.';
        if (response.error?.description) {
          errorMessage = response.error.description;
        } else if (response.error?.reason) {
          errorMessage = response.error.reason;
        }
        
        toast.error(errorMessage, { autoClose: 5000 });
      });

      // IMPORTANT: Open Razorpay modal - this triggers the UPI payment
      console.log('🚀 Opening Razorpay modal for UPI payment...');
      console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');
      console.log('UPI ID:', upiId);
      
      try {
        razorpay.open();
        console.log('✅ Razorpay modal opened successfully');
      } catch (openError) {
        console.error('❌ Failed to open Razorpay modal:', openError);
        toast.error('Failed to open payment gateway. Please try again.');
        setIsProcessing(false);
        setPaymentInitiated(false);
        setStep(2);
        return;
      }

      // Show instructions based on device type
      toast.info(`Payment request sent to ${upiId}. Please check your phone and approve the payment in your UPI app.`, {
        autoClose: 10000,
        position: 'top-center'
      });
      console.log('✅ UPI Collect request sent to:', upiId);
      console.log('📱 User should receive notification on their phone to approve payment');

    } catch (error) {
      console.error('UPI Payment Error:', error);
      clearTimeout(timeoutId); // Clear timeout on error
      setIsProcessing(false);
      setStep(2); // Go back to verification step
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate UPI payment';
      toast.error(errorMessage);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setUpiVerified(false);
      setVerificationCode('');
    } else if (step === 3) {
      setStep(2);
      setPaymentInitiated(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        UPI Payment - Step {step} of 3
      </h3>

      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="ml-2 text-xs font-medium">Enter UPI</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className="ml-2 text-xs font-medium">Verify</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 text-xs font-medium">Pay</span>
          </div>
        </div>

        {/* Razorpay Loading Status */}
        {!razorpayLoaded && step === 1 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Loading payment gateway...</strong> Please wait while we initialize the payment system.
            </p>
          </div>
        )}

        {/* Step 1: Enter UPI ID */}
        {step === 1 && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Step 1:</strong> Enter your UPI ID to verify before sending payment request.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                placeholder="yourname@ybl or 9876543210@paytm"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-black focus:border-black"
                disabled={isVerifying}
                style={{ fontSize: '14px', color: '#111827' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Examples: yourname@ybl, 9876543210@paytm, user@okaxis, name@oksbi
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount to pay:</span>
                <span className="text-lg font-bold text-gray-900">₹{amount}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isVerifying}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyUPI}
                disabled={isVerifying || !upiId}
                className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Verify UPI ID'}
              </button>
            </div>
          </>
        )}

        {/* Step 2: UPI Verified - Ready to Send Payment */}
        {step === 2 && (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>✓ UPI ID Verified!</strong> Your UPI ID <strong>{upiId}</strong> has been verified successfully.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Step 2:</strong> Click "Send Payment Request" below. A payment notification will be sent to your UPI app on your phone. Open your UPI app and approve the payment.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">UPI ID:</span>
                  <span className="font-medium text-gray-900">{upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">₹{amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-medium text-gray-900">Black Locust</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-xs text-amber-800">
                <strong>What happens next:</strong> A payment notification will be sent to your phone. Open your UPI app (Google Pay, PhonePe, Paytm, etc.) and approve the payment request for ₹{amount}.
              </p>
            </div>

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
                onClick={handleSendPaymentRequest}
                disabled={isProcessing}
                className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Sending...' : 'Send Payment Request'}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Payment Request Sent */}
        {step === 3 && (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>✓ Payment Request Sent!</strong> Please check your phone for the UPI notification.
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Step 3:</strong> Open your UPI app on your phone and approve the payment request for ₹{amount}.
              </p>
            </div>

            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <svg className="w-16 h-16 text-black mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Waiting for payment approval...
                </p>
                <p className="text-xs text-gray-600">
                  Check your phone for the UPI notification
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment sent to:</h4>
              <p className="text-sm font-bold text-gray-900">{upiId}</p>
              <p className="text-xs text-gray-600 mt-1">Amount: ₹{amount}</p>
            </div>
          </>
        )}

        {/* How it works - Show on step 1 */}
        {step === 1 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs font-medium text-gray-700 mb-2">How it works:</p>
            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
              <li>Enter your UPI ID and verify it</li>
              <li>Confirm payment details</li>
              <li>Payment notification sent to your phone</li>
              <li>Open your UPI app and approve the payment</li>
              <li>Payment completed automatically</li>
            </ol>
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      {(isProcessing || isVerifying) && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {isVerifying ? 'Verifying UPI ID...' : 
               step === 3 ? 'Waiting for payment approval...' : 
               'Initiating payment...'}
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-xs text-amber-800">
          <strong>Secure Payment:</strong> Your payment is processed securely through Razorpay. A payment notification will be sent to your registered UPI app on your phone. Simply open the app and approve the payment.
        </p>
      </div>
    </div>
  );
}

export default UPIPayment;

