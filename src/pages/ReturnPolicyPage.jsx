import React from 'react';
import './ReturnPolicyPage.css';

const ReturnPolicyPage = () => {
  return (
    <div className="return-policy-page">
      <div className="container">
        <div className="page-header">
          <h1>Return Policy</h1>
          <p>Hassle-free returns within 7 days; specific conditions apply based on products and promotions.</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Return Guidelines</h2>
            <div className="policy-points">
              <div className="policy-point">
                <h3>1. Hassle-free returns within 7 days</h3>
                <p>Specific conditions apply based on products and promotions.</p>
              </div>
              
              <div className="policy-point">
                <h3>2. Refund Processing</h3>
                <p>Prepaid order refunds are processed to the original payment method; COD orders receive a refund in the SNITCH wallet.</p>
              </div>
              
              <div className="policy-point">
                <h3>3. Defective/Incorrect Items</h3>
                <p>Issues with defective, incorrect, or damaged products must be reported within 24 hours of delivery.</p>
              </div>
              
              <div className="policy-point">
                <h3>4. Special Sales Items</h3>
                <p>Items purchased during special sales with free product offers, like BOGO, are ineligible for returns.</p>
              </div>
              
              <div className="policy-point">
                <h3>5. Return Shipping Fees</h3>
                <p>A reverse shipment fee upto Rs 100 can be charged for the returns, which will be deducted from the refund.</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>How to Initiate a Return</h2>
            <ol>
              <li>Contact our customer service team within 7 days of delivery</li>
              <li>Provide your order number and reason for return</li>
              <li>Our team will review your request and provide return instructions</li>
              <li>Package the item securely with all original tags and packaging</li>
              <li>Ship the item back to us using the provided return label</li>
              <li>Once received, we'll process your refund within 5-7 working days</li>
            </ol>
          </section>

          <section className="policy-section">
            <h2>Return Conditions</h2>
            <div className="conditions-list">
              <div className="condition-item">
                <h3>Items must be:</h3>
                <ul>
                  <li>Unused and unworn</li>
                  <li>In original condition with all tags attached</li>
                  <li>In original packaging</li>
                  <li>Accompanied by original receipt or proof of purchase</li>
                </ul>
              </div>
              
              <div className="condition-item">
                <h3>Items not eligible for return:</h3>
                <ul>
                  <li>Items marked as final sale</li>
                  <li>Items purchased during special sales with free offers</li>
                  <li>Items damaged due to customer misuse</li>
                  <li>Items returned after 7 days of delivery</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Refund Process</h2>
            <div className="refund-info">
              <div className="refund-method">
                <h3>Prepaid Orders</h3>
                <p>Refunds are processed to the original payment method within 5-7 working days after we receive and inspect the returned item.</p>
              </div>
              
              <div className="refund-method">
                <h3>Cash on Delivery (COD) Orders</h3>
                <p>Refunds are credited to your SNITCH wallet and can be used for future purchases.</p>
              </div>
              
              <div className="refund-deduction">
                <h3>Return Shipping Fees</h3>
                <p>A reverse shipment fee of up to Rs 100 may be charged for returns, which will be deducted from your refund amount.</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Exchange Policy</h2>
            <p>If you'd like to exchange an item for a different size or color, please follow the same return process and place a new order for the desired item. Exchanges are subject to availability.</p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>For any questions about our return policy or to initiate a return, please contact us:</p>
            <div className="contact-details">
              <div className="contact-item">
                <h3>Email</h3>
                <p>returns@blacklocust.com</p>
              </div>
              <div className="contact-item">
                <h3>Phone</h3>
                <p>1-800-BLACK-LOCUST</p>
              </div>
              <div className="contact-item">
                <h3>WhatsApp</h3>
                <p>+91-XXXXX-XXXXX</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
