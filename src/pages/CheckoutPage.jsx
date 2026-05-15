import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import UPIPayment from '../components/UPIPayment/UPIPayment';
import CardPayment from '../components/CardPayment/CardPayment';

function CheckoutPage() {
  const { items: cart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUPIPayment, setShowUPIPayment] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  
  // UPI Verification states
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [isVerifyingUPI, setIsVerifyingUPI] = useState(false);
  
  // Reset UPI verification when payment method changes
  useEffect(() => {
    if (paymentMethod !== 'cod' && paymentMethod !== 'upi') {
      setUpiId('');
      setUpiVerified(false);
    }
  }, [paymentMethod]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Check if cart is empty
      if (!cart || cart.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error('Please login to continue with checkout');
        // Store current path to return after login
        localStorage.setItem('returnPath', '/checkout');
        navigate('/login');
        return;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cart, navigate, isAuthenticated]);

  const calculateSubtotal = () => {
    return (cart || []).reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 999 ? 0 : 50;
    return subtotal + shipping - discount;
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  // Validate UPI ID format
  const validateUpiId = (upiId) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId) && upiId.length >= 5;
  };

  // Handle UPI Verification
  const handleVerifyUPI = async () => {
    if (!upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    if (!validateUpiId(upiId)) {
      toast.error('Please enter a valid UPI ID (e.g., yourname@ybl, 9876543210@paytm)');
      return;
    }

    setIsVerifyingUPI(true);

    try {
      // Simulate UPI verification (in production, this would call a verification API)
      toast.info('Verifying UPI ID...', { autoClose: 2000 });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark as verified
      setUpiVerified(true);
      toast.success(`UPI ID verified successfully: ${upiId}`);
      
    } catch (error) {
      console.error('UPI Verification Error:', error);
      toast.error('Failed to verify UPI ID. Please try again.');
    } finally {
      setIsVerifyingUPI(false);
    }
  };

  // Helper: load Razorpay checkout script (cached after first load)
  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(window.Razorpay);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });

  /**
   * COD Confirmation Flow:
   * Opens Razorpay for ₹100 confirmation fee. Returns a Promise that
   * resolves with the Razorpay payment ID on success, or rejects on
   * failure / dismissal.
   */
  const collectCODConfirmationPayment = async (fullName) => {
    const { data: keyData } = await api.get('/payments/razorpay/key');
    if (!keyData?.keyId) {
      throw new Error('Razorpay is not configured on the server.');
    }

    await loadRazorpayScript();

    // Call backend to create a Razorpay order for ₹100 confirmation fee
    const { data: codOrderResp } = await api.post('/payments/cod/confirmation-order', {
      amount: 100,
      currency: 'INR'
    });

    const rzpOrderId = codOrderResp?.order?.id || codOrderResp?.orderId;
    if (!rzpOrderId) {
      throw new Error('Failed to create COD confirmation order');
    }

    return new Promise((resolve, reject) => {
      const rzpOptions = {
        key: keyData.keyId,
        order_id: rzpOrderId,
        amount: 10000, // ₹100 in paise
        currency: 'INR',
        name: 'Black Locust',
        description: 'COD Confirmation Fee - ₹100',
        prefill: {
          name: fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: { color: '#000000' },
        handler: function (response) {
          // Payment successful — resolve with the payment details
          resolve({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
        },
        modal: {
          ondismiss: function () {
            reject(new Error('COD confirmation payment was cancelled'));
          }
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response) {
        reject(new Error('COD confirmation payment failed. Please try again.'));
      });
      rzp.open();
    });
  };

  // UPI Payment Handlers
  const handleUPIPayment = () => {
    setShowUPIPayment(true);
  };

  const handleUPIPaymentComplete = async (paymentDetails) => {
    try {
      setIsProcessing(true);
      
      // Create order with UPI payment details
      const subtotal = calculateSubtotal();
      const shippingPrice = subtotal > 999 ? 0 : 50;
      const totalPrice = calculateTotal();
      
      const orderItems = (cart || []).map((item) => ({
        product: item.product || item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          ...shippingAddress,
          fullName: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim()
        },
        paymentMethod: 'upi',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
        paymentDetails: {
          upiId: paymentDetails.upiId,
          transactionId: paymentDetails.transactionId,
          orderId: paymentDetails.orderId,
          status: paymentDetails.status,
          verifiedAt: paymentDetails.verifiedAt
        }
      };

      const res = await api.post('/orders', orderData);
      
      // Backend returns order object directly (not wrapped in success)
      if (res.data && res.data._id) {
        toast.success('UPI payment completed successfully!');
        clearCart();
        navigate('/order-success', { state: { orderId: res.data._id, order: res.data } });
      } else {
        toast.error('Order creation failed. Please try again.');
      }
    } catch (error) {
      console.error('UPI Order Error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowUPIPayment(false);
    }
  };

  const handleUPIPaymentCancel = () => {
    setShowUPIPayment(false);
  };

  // Card Payment Handlers
  const handleCardPayment = () => {
    setShowCardPayment(true);
  };

  const handleCardPaymentComplete = async (paymentDetails) => {
    try {
      setIsProcessing(true);
      
      // Create order with card payment details
      const subtotal = calculateSubtotal();
      const shippingPrice = subtotal > 999 ? 0 : 50;
      const totalPrice = calculateTotal();
      
      const orderItems = (cart || []).map((item) => ({
        product: item.product || item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }));

      const orderData = {
        orderItems,
        shippingAddress: {
          ...shippingAddress,
          fullName: `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim()
        },
        paymentMethod: 'card',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
        paymentDetails: {
          cardType: paymentDetails.cardType,
          cardNumber: paymentDetails.cardNumber,
          cardHolderName: paymentDetails.cardHolderName,
          transactionId: paymentDetails.transactionId,
          status: paymentDetails.status,
          verifiedAt: paymentDetails.verifiedAt
        }
      };

      const res = await api.post('/orders', orderData);
      
      // Backend returns order object directly (not wrapped in success)
      if (res.data && res.data._id) {
        toast.success('Card payment completed successfully!');
        clearCart();
        navigate('/order-success', { state: { orderId: res.data._id, order: res.data } });
      } else {
        toast.error('Order creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Card Order Error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
      setShowCardPayment(false);
    }
  };

  const handleCardPaymentCancel = () => {
    setShowCardPayment(false);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Check UPI verification for COD and UPI payments
    if ((paymentMethod === 'cod' || paymentMethod === 'upi') && !upiVerified) {
      toast.error('Please verify your UPI ID before placing order');
      return;
    }
    
    setIsProcessing(true);
    let razorpayFlow = false;

    try {
      if (!cart || cart.length === 0) {
        toast.error('Your cart is empty');
        navigate('/cart');
        return;
      }

      if (!isAuthenticated) {
        toast.info('Please sign in to complete payment');
        navigate('/login', { state: { redirectTo: '/checkout' } });
        setIsProcessing(false);
        return;
      }

      const subtotal = calculateSubtotal();
      const shippingPrice = subtotal > 999 ? 0 : 50;
      const totalPrice = calculateTotal();

      // Backend StoreOrder expects `orderItems` + `shippingAddress` + `paymentMethod`
      const orderItems = (cart || []).map((item) => ({
        product: item.product || item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size || 'Default',
        color: item.color || 'Default',
        // storeOrderController calculates `subtotal` internally using price * quantity,
        // but we can still include it for clarity.
        subtotal: item.price * item.quantity
      }));

      const fullName = `${shippingAddress.firstName || ''} ${shippingAddress.lastName || ''}`.trim();

      // ─── COD Flow: collect ₹100 confirmation fee BEFORE creating the order ───
      if (paymentMethod === 'cod') {
        razorpayFlow = true; // Razorpay modal will be opened

        let codPaymentDetails;
        try {
          codPaymentDetails = await collectCODConfirmationPayment(fullName);
        } catch (codErr) {
          // User cancelled or payment failed — don't place the order
          toast.error(codErr.message || 'COD confirmation payment failed');
          setIsProcessing(false);
          return;
        }

        // ₹100 paid successfully — now create the COD order with real payment proof
        const orderPayload = {
          orderItems,
          shippingAddress: {
            fullName,
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            country: shippingAddress.country
          },
          paymentMethod: 'cod',
          itemsPrice: subtotal,
          taxPrice: 0,
          shippingPrice,
          totalPrice,
          promoCode,
          codConfirmation: {
            paid: true,
            amount: 100,
            razorpayPaymentId: codPaymentDetails.razorpayPaymentId,
            razorpayOrderId: codPaymentDetails.razorpayOrderId,
            razorpaySignature: codPaymentDetails.razorpaySignature
          }
        };

        let createdOrder;
        try {
          const orderRes = await api.post('/orders', orderPayload);
          createdOrder = orderRes.data;
        } catch (error) {
          console.error('COD order creation error:', error);
          if (error.response?.status === 401) {
            toast.error('Your session has expired. Please login again.');
            localStorage.setItem('returnPath', '/checkout');
            navigate('/login');
            setIsProcessing(false);
            return;
          }
          const errorMessage = error.response?.data?.message || 'Failed to create order. Please try again.';
          toast.error(errorMessage);
          setIsProcessing(false);
          return;
        }

        // Try Shiprocket (non-blocking)
        try {
          await api.post('/shipping/shiprocket/shipment', { orderId: createdOrder._id });
        } catch (err) {
          console.warn('Shiprocket shipment creation failed:', err?.response?.data || err.message);
        }

        clearCart();
        navigate('/order-success', { state: { orderId: createdOrder._id } });
        toast.success('Order placed successfully! ₹100 COD confirmation paid.');
        setIsProcessing(false);
        return;
      }

      // ─── UPI Payment Flow ───
      if (paymentMethod === 'upi') {
        setIsProcessing(false);
        handleUPIPayment();
        return;
      }

      // ─── Card Payment Flow ───
      if (paymentMethod === 'card') {
        setIsProcessing(false);
        handleCardPayment();
        return;
      }

      // ─── Online Payment Flow (Razorpay / Wallet) ───
      const orderPayload = {
        orderItems,
        shippingAddress: {
          fullName: fullName,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country
        },
        paymentMethod: 'razorpay',
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
        promoCode
      };
      razorpayFlow = true;

      // 1) Create order record in our DB first
      let orderRes, createdOrder;
      try {
        orderRes = await api.post('/orders', orderPayload);
        createdOrder = orderRes.data;
      } catch (error) {
        console.error('Order creation error:', error);
        
        if (error.response?.status === 401) {
          toast.error('Your session has expired. Please login again.');
          localStorage.setItem('returnPath', '/checkout');
          navigate('/login');
          setIsProcessing(false);
          return;
        }
        
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || 'Invalid order data';
          toast.error(errorMessage);
          setIsProcessing(false);
          return;
        }
        
        toast.error('Failed to create order. Please try again.');
        setIsProcessing(false);
        return;
      }

      const shiprocketIfPossible = async () => {
        try {
          await api.post('/shipping/shiprocket/shipment', { orderId: createdOrder._id });
        } catch (err) {
          // Shipping integration should not block successful payment/order completion.
          console.warn('Shiprocket shipment creation failed:', err?.response?.data || err.message);
        }
      };

      // 2) Razorpay: open checkout and verify payment server-side
      const [{ data: keyData }, { data: razorpayOrderResp }] = await Promise.all([
        api.get('/payments/razorpay/key'),
        api.post('/payments/razorpay/order', { orderId: createdOrder._id, currency: 'INR' })
      ]);

      if (!keyData?.keyId) {
        toast.error('Razorpay is not configured on the server.');
        return;
      }

      await loadRazorpayScript();

      const rzpOrderId =
        razorpayOrderResp?.order?.id ||
        razorpayOrderResp?.order?.order_id ||
        razorpayOrderResp?.order?.orderId;
      const rzpAmount = razorpayOrderResp?.order?.amount;
      const rzpCurrency = razorpayOrderResp?.order?.currency || 'INR';

      if (!rzpOrderId || !Number.isFinite(Number(rzpAmount))) {
        throw new Error(
          `Razorpay order response missing fields: orderId=${rzpOrderId}, amount=${rzpAmount}`
        );
      }

      const rzpOptions = {
        key: keyData.keyId,
        order_id: rzpOrderId,
        amount: rzpAmount,
        currency: rzpCurrency,
        name: 'Black Locust',
        description: `Order ${createdOrder.orderNumber}`,
        prefill: {
          name: fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: { color: '#000000' },
        config:
          paymentMethod === 'card'
            ? {
                display: {
                  blocks: {
                    cards_only: {
                      name: 'Pay via Card',
                      instruments: [{ method: 'card' }]
                    }
                  }
                },
                sequence: ['block.cards_only'],
                preferences: { show_default_blocks: false }
              }
            : paymentMethod === 'upi'
            ? {
                display: {
                  blocks: {
                    upi_only: {
                      name: 'Pay via UPI',
                      instruments: [{ method: 'upi' }]
                    }
                  }
                },
                sequence: ['block.upi_only'],
                preferences: { show_default_blocks: false }
              }
            : paymentMethod === 'wallet'
            ? {
                display: {
                  blocks: {
                    wallets_only: {
                      name: 'Pay via Wallet',
                      instruments: [{ method: 'wallet' }]
                    }
                  }
                },
                sequence: ['block.wallets_only'],
                preferences: { show_default_blocks: false }
              }
            : undefined,
        handler: async function (response) {
          try {
            await api.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: createdOrder._id
            });

            await shiprocketIfPossible();
            clearCart();
            navigate('/order-success', { state: { orderId: createdOrder._id } });
            toast.success('Order placed successfully!');
          } catch (err) {
            console.error('Razorpay verify failed:', err?.response?.data || err.message);
            toast.error('Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            // User closed the Razorpay modal; allow re-trying checkout.
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(rzpOptions);

      rzp.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response);
        toast.error('Payment failed. Please try again.');
        setIsProcessing(false);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to place order. Please try again.'
      );
      setIsProcessing(false);
    } finally {
      if (!razorpayFlow) setIsProcessing(false);
    }
  };

  const handleApplyPromoCode = () => {
    if (promoCode.toLowerCase() === 'save10') {
      setDiscount(calculateSubtotal() * 0.1);
      toast.success('Promo code applied! 10% discount');
    } else {
      toast.error('Invalid promo code');
    }
  };

  if (!cart || cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Loading State */}
      {isLoading && (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <>
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">
          {cart?.length || 0} {cart?.length === 1 ? 'item' : 'items'} in your order
        </p>
      </div>

      {/* Checkout Steps */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 1 ? 'text-black' : 'text-gray-600'
            }`}>Address</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${
            currentStep >= 2 ? 'bg-black' : 'bg-gray-200'
          }`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 2 ? 'text-black' : 'text-gray-600'
            }`}>Payment</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${
            currentStep >= 3 ? 'bg-black' : 'bg-gray-200'
          }`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= 3 ? 'text-black' : 'text-gray-600'
            }`}>Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      required
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      rows={3}
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Maharashtra"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({...shippingAddress, pincode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="400001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="India"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                  >
                    CONTINUE TO PAYMENT
                  </button>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <label className={`flex items-center p-4 border rounded-md cursor-pointer hover:border-black ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay remaining amount when you receive your order</div>
                      </div>
                      <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-1 rounded-full whitespace-nowrap ml-2">₹100 Fee</span>
                    </label>
                    {paymentMethod === 'cod' && (
                      <div className="ml-7 space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <div className="flex items-start space-x-2">
                            <span className="text-amber-600 text-lg leading-none">⚠</span>
                            <div>
                              <p className="text-sm font-medium text-amber-800">₹100 COD Confirmation Fee Required</p>
                              <p className="text-xs text-amber-700 mt-1">
                                A non-refundable ₹100 confirmation fee will be charged via UPI to confirm your COD order. 
                                The remaining amount (₹{calculateTotal() > 0 ? calculateTotal() : 0}) will be collected at delivery.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* UPI Verification for COD */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md space-y-4">
                          <div className="flex items-start space-x-2">
                            <span className="text-blue-600 text-lg leading-none">ℹ</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-800">Verify Your UPI ID for ₹100 Payment</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Enter and verify your UPI ID to pay ₹100 confirmation fee.
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Enter your UPI ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                              placeholder="yourname@ybl or 9876543210@paytm"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                              disabled={upiVerified}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Examples: yourname@ybl, 9876543210@paytm, user@okaxis
                            </p>
                          </div>
                          
                          {!upiVerified ? (
                            <button
                              type="button"
                              onClick={handleVerifyUPI}
                              disabled={!upiId || isVerifyingUPI}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isVerifyingUPI ? 'Verifying...' : 'Verify UPI ID'}
                            </button>
                          ) : (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center space-x-2">
                                <span className="text-green-600 text-lg">✓</span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-green-800">UPI ID Verified!</p>
                                  <p className="text-xs text-green-700">{upiId}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUpiVerified(false);
                                    setUpiId('');
                                  }}
                                  className="text-xs text-green-700 hover:text-green-900 underline"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:border-black">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Credit/Debit Card</div>
                        <div className="text-sm text-gray-600">Visa, Mastercard, RuPay, Amex with OTP verification</div>
                      </div>
                    </label>

                    <label className={`flex items-center p-4 border rounded-md cursor-pointer hover:border-black ${paymentMethod === 'upi' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">UPI Payment</div>
                        <div className="text-sm text-gray-600">PhonePe, Paytm, Google Pay, BHIM & more</div>
                      </div>
                    </label>
                    
                    {/* UPI Verification Section - Shows when UPI is selected */}
                    {paymentMethod === 'upi' && (
                      <div className="ml-7 p-4 bg-blue-50 border border-blue-200 rounded-md space-y-4">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600 text-lg leading-none">ℹ</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">Verify Your UPI ID</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Enter and verify your UPI ID before placing order. Payment request will be sent to your UPI app.
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter your UPI ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                            placeholder="yourname@ybl or 9876543210@paytm"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            disabled={upiVerified}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Examples: yourname@ybl, 9876543210@paytm, user@okaxis
                          </p>
                        </div>
                        
                        {!upiVerified ? (
                          <button
                            type="button"
                            onClick={handleVerifyUPI}
                            disabled={!upiId || isVerifyingUPI}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVerifyingUPI ? 'Verifying...' : 'Verify UPI ID'}
                          </button>
                        ) : (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600 text-lg">✓</span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">UPI ID Verified!</p>
                                <p className="text-xs text-green-700">{upiId}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setUpiVerified(false);
                                  setUpiId('');
                                }}
                                className="text-xs text-green-700 hover:text-green-900 underline"
                              >
                                Change
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:border-black">
                      <input
                        type="radio"
                        name="payment"
                        value="wallet"
                        checked={paymentMethod === 'wallet'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Digital Wallet</div>
                        <div className="text-sm text-gray-600">Paytm Wallet, Amazon Pay</div>
                      </div>
                    </label>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                      BACK
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing || ((paymentMethod === 'cod' || paymentMethod === 'upi') && !upiVerified)}
                      className="flex-1 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'PROCESSING...' : 
                       (paymentMethod === 'cod' || paymentMethod === 'upi') && !upiVerified ? 'VERIFY UPI TO CONTINUE' :
                       paymentMethod === 'cod' ? 'PAY ₹100 & PLACE COD ORDER' : 
                       'PLACE ORDER'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.uniqueId || item._id || item.product} className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-600">
                        {(item.size || item.selectedSize) && `Size: ${item.size || item.selectedSize}`}
                        {(item.color || item.selectedColor) &&
                          ` • Color: ${item.color || item.selectedColor}`}
                      </p>
                      <p className="text-sm text-gray-900">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discount > 0 && (
                  <p className="text-sm text-green-600 mt-2">Promo code applied!</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {calculateSubtotal() > 999 ? 'FREE' : '₹50'}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{discount}</span>
                  </div>
                )}
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">COD Confirmation Fee</span>
                    <span className="font-medium text-amber-600">₹100</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{calculateTotal()}</span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs text-amber-700">
                        <span>Pay now (Confirmation Fee)</span>
                        <span className="font-semibold">₹100</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Pay on Delivery</span>
                        <span className="font-semibold">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="text-xs text-gray-600">
                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8-4m8-4l8 4m0-10l-8 4m8 4l8 4m0-10v10" />
                    </svg>
                    Free Shipping
                  </div>
                  <div className="text-xs text-gray-600">
                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m-4-4v4m0 0V8a4 4 0 014-4h4a4 4 0 014 4v0" />
                    </svg>
                    15 Days Return
                  </div>
                  <div className="text-xs text-gray-600">
                    <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure Payment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UPI Payment Modal */}
      {showUPIPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <UPIPayment
              amount={calculateTotal()}
              merchantVPA="blacklocust@ybl"
              transactionId={`BL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
              verifiedUpiId={upiId}
              onPaymentComplete={handleUPIPaymentComplete}
              onCancel={handleUPIPaymentCancel}
            />
          </div>
        </div>
      )}

      {/* Card Payment Modal */}
      {showCardPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardPayment
              amount={calculateTotal()}
              onPaymentComplete={handleCardPaymentComplete}
              onCancel={handleCardPaymentCancel}
            />
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default CheckoutPage;
