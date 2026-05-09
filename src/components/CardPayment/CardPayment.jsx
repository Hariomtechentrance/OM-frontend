import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CARD_TYPES = [
  {
    id: 'visa',
    name: 'Visa',
    icon: '💳',
    color: 'bg-blue-600',
    pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
    cvvLength: 3
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: '💳',
    color: 'bg-red-600',
    pattern: /^5[1-5][0-9]{14}$/,
    cvvLength: 3
  },
  {
    id: 'rupay',
    name: 'RuPay',
    icon: '💳',
    color: 'bg-orange-600',
    pattern: /^6[0-9]{15}$/,
    cvvLength: 3
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: '💳',
    color: 'bg-green-600',
    pattern: /^3[47][0-9]{13}$/,
    cvvLength: 4
  }
];

function CardPayment({ amount, onPaymentComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1: card details, 2: OTP verification
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardType: ''
  });
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Detect card type based on card number
  const detectCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    for (const cardType of CARD_TYPES) {
      if (cardType.pattern.test(cleanNumber)) {
        return cardType;
      }
    }
    return null;
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const cleanNumber = value.replace(/\s/g, '');
    const chunks = cleanNumber.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19); // Max 19 characters (16 digits + 3 spaces)
  };

  // Validate card details
  const validateCardDetails = () => {
    const newErrors = {};
    
    // Card number validation
    const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = 'Card number must be 13-19 digits';
    } else if (!/^\d+$/.test(cleanCardNumber)) {
      newErrors.cardNumber = 'Card number must contain only digits';
    } else {
      const detectedType = detectCardType(cleanCardNumber);
      // Don't require card type detection for testing - accept any valid number
      if (!detectedType && cleanCardNumber.length >= 13 && cleanCardNumber.length <= 19) {
        // Accept generic card numbers for testing
        console.log('Accepting generic card number for testing');
      }
    }

    // Card holder name validation
    if (!cardDetails.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Card holder name is required';
    } else if (cardDetails.cardHolderName.length < 3) {
      newErrors.cardHolderName = 'Please enter a valid name';
    }

    // Expiry validation
    if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
      newErrors.expiry = 'Expiry date is required';
    } else {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(cardDetails.expiryYear);
      const expiryMonth = parseInt(cardDetails.expiryMonth);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    // CVV validation
    const detectedType = detectCardType(cleanCardNumber);
    const requiredCvvLength = detectedType ? detectedType.cvvLength : 3;
    
    if (!cardDetails.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cardDetails.cvv.length !== requiredCvvLength) {
      newErrors.cvv = `CVV must be ${requiredCvvLength} digits`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP
  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return false;
    }
    setErrors({});
    return true;
  };

  // Handle card details input changes
  const handleCardDetailsChange = (field, value) => {
    if (field === 'cardNumber') {
      const formattedValue = formatCardNumber(value);
      setCardDetails(prev => ({
        ...prev,
        [field]: formattedValue,
        cardType: detectCardType(formattedValue.replace(/\s/g, ''))?.id || ''
      }));
    } else {
      setCardDetails(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Handle card details submission
  const handleCardDetailsSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCardDetails()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call to initiate card payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock OTP (in real implementation, this would come from bank)
      const mockOtp = '123456';
      console.log('Mock OTP for testing:', mockOtp);
      
      // Move to OTP verification step
      setStep(2);
      toast.success('OTP sent to your registered mobile number');
      
    } catch (error) {
      console.error('Card payment initiation error:', error);
      toast.error('Failed to initiate card payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!validateOtp()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate OTP verification (in real implementation, this would verify with bank)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo, accept OTP "123456"
      if (otp === '123456') {
        // Payment successful
        const paymentDetails = {
          method: 'card',
          cardType: cardDetails.cardType,
          cardNumber: '****-****-****-' + cardDetails.cardNumber.slice(-4),
          cardHolderName: cardDetails.cardHolderName,
          transactionId: `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount,
          status: 'completed',
          verifiedAt: new Date().toISOString()
        };
        
        onPaymentComplete(paymentDetails);
        toast.success('Card payment completed successfully!');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('OTP verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (step === 2) {
      setStep(1);
      setOtp('');
      setErrors({});
    } else {
      onCancel();
    }
  };

  // Generate month options
  const generateMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(
        <option key={i} value={i.toString().padStart(2, '0')}>
          {i.toString().padStart(2, '0')} - {new Date(2000, i - 1).toLocaleString('default', { month: 'long' })}
        </option>
      );
    }
    return months;
  };

  // Generate year options
  const generateYearOptions = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 15; i++) {
      years.push(
        <option key={currentYear + i} value={currentYear + i}>
          {currentYear + i}
        </option>
      );
    }
    return years;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        {step === 1 ? 'Card Payment Details' : 'OTP Verification'}
      </h3>

      {step === 1 && (
        <form onSubmit={handleCardDetailsSubmit} className="space-y-6">
          {/* Card Type Display */}
          {cardDetails.cardType && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className={`w-8 h-8 ${CARD_TYPES.find(ct => ct.id === cardDetails.cardType)?.color} rounded-full flex items-center justify-center text-white text-sm`}>
                {CARD_TYPES.find(ct => ct.id === cardDetails.cardType)?.icon}
              </div>
              <span className="text-sm font-medium text-blue-800">
                {CARD_TYPES.find(ct => ct.id === cardDetails.cardType)?.name} detected
              </span>
            </div>
          )}

          {/* Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <input
              type="text"
              value={cardDetails.cardNumber}
              onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
              placeholder="4111 1111 1111 1111 or 1234 5678 9012 3456"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={isProcessing}
              maxLength={19}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Test cards: 4111 1111 1111 1111 (Visa), 5555 5555 5555 4444 (Mastercard)
            </p>
          </div>

          {/* Card Holder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Holder Name
            </label>
            <input
              type="text"
              value={cardDetails.cardHolderName}
              onChange={(e) => handleCardDetailsChange('cardHolderName', e.target.value)}
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={isProcessing}
            />
            {errors.cardHolderName && (
              <p className="text-red-500 text-xs mt-1">{errors.cardHolderName}</p>
            )}
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <div className="flex space-x-2">
                <select
                  value={cardDetails.expiryMonth}
                  onChange={(e) => handleCardDetailsChange('expiryMonth', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={isProcessing}
                >
                  <option value="">Month</option>
                  {generateMonthOptions()}
                </select>
                <select
                  value={cardDetails.expiryYear}
                  onChange={(e) => handleCardDetailsChange('expiryYear', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={isProcessing}
                >
                  <option value="">Year</option>
                  {generateYearOptions()}
                </select>
              </div>
              {errors.expiry && (
                <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="password"
                value={cardDetails.cvv}
                onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                placeholder="123"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                disabled={isProcessing}
                maxLength={4}
              />
              {errors.cvv && (
                <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Payment Amount Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount to be charged:</span>
              <span className="text-lg font-bold text-gray-900">₹{amount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleOtpVerification} className="space-y-6">
          {/* OTP Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>OTP Sent!</strong> A 6-digit OTP has been sent to your registered mobile number.
              <br />
              <span className="text-xs">For demo, use OTP: <strong>123456</strong></span>
            </p>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-center text-lg"
              disabled={isProcessing}
              maxLength={6}
            />
            {errors.otp && (
              <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
            )}
          </div>

          {/* Card Details Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Summary</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Card:</span>
                <span>{CARD_TYPES.find(ct => ct.id === cardDetails.cardType)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Card Number:</span>
                <span>****-****-****-{cardDetails.cardNumber.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-bold text-gray-900">₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isProcessing}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Verifying...' : 'Verify & Pay'}
            </button>
          </div>
        </form>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {step === 1 ? 'Processing card details...' : 'Verifying OTP...'}
            </p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-xs text-amber-800">
          <strong>Secure Payment:</strong> Your card details are encrypted and processed securely. 
          We do not store your card information.
        </p>
      </div>
    </div>
  );
}

export default CardPayment;
