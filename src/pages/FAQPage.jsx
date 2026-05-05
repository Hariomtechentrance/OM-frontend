import React, { useState } from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse products, select your size, and click Add to Cart, then proceed to checkout."
    },
    {
      question: "How can I track my order?",
      answer: "You'll receive a tracking link via whatsapp after your order is shipped."
    },
    {
      question: "What are the delivery charges?",
      answer: "Delivery charges are calculated at checkout based on your location."
    },
    {
      question: "How long does delivery take?",
      answer: "Orders are usually delivered within 3–7 working days."
    },
    {
      question: "Do you offer free shipping?",
      answer: "Free shipping may be available on selected orders or offers."
    },
    {
      question: "What is your return policy?",
      answer: "We offer easy returns within 7 days of delivery."
    },
    {
      question: "How do I request a return?",
      answer: "Go to your orders section or contact our support team to initiate a return."
    },
    {
      question: "When will I get my refund?",
      answer: "Refunds are processed within 5–7 working days after approval."
    },
    {
      question: "What payment methods are available?",
      answer: "We accept UPI, debit/credit cards, net banking, and wallets."
    },
    {
      question: "Is Cash on Delivery available?",
      answer: "Yes, COD is available on eligible orders."
    },
    {
      question: "How do I choose the right size?",
      answer: "Refer to our size chart available on each product page."
    },
    {
      question: "Are your products true to size?",
      answer: "Yes, our products follow standard sizing for a comfortable fit."
    },
    {
      question: "How do I use a discount code?",
      answer: "Apply your code at checkout before making payment."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Black Locust products and services</p>
        </div>

        <div className="faq-categories">
          <div className="category-section">
            <h2>Orders & Shipping</h2>
            <div className="faq-list">
              {faqs.slice(0, 4).map((faq, index) => (
                <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFAQ(index)}>
                    <h3>{faq.question}</h3>
                    <span className="faq-toggle">{activeIndex === index ? '−' : '+'}</span>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="category-section">
            <h2>Products & Care</h2>
            <div className="faq-list">
              {faqs.slice(4, 7).map((faq, index) => (
                <div key={index + 4} className={`faq-item ${activeIndex === index + 4 ? 'active' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFAQ(index + 4)}>
                    <h3>{faq.question}</h3>
                    <span className="faq-toggle">{activeIndex === index + 4 ? '−' : '+'}</span>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="category-section">
            <h2>Services & Support</h2>
            <div className="faq-list">
              {faqs.slice(7).map((faq, index) => (
                <div key={index + 7} className={`faq-item ${activeIndex === index + 7 ? 'active' : ''}`}>
                  <div className="faq-question" onClick={() => toggleFAQ(index + 7)}>
                    <h3>{faq.question}</h3>
                    <span className="faq-toggle">{activeIndex === index + 7 ? '−' : '+'}</span>
                  </div>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="faq-contact">
          <div className="contact-card">
            <h2>Still have questions?</h2>
            <p>Our customer service team is here to help you with any additional questions you may have.</p>
            <div className="contact-options">
              <div className="contact-option">
                <h3>Email</h3>
                <p>support@blacklocust.com</p>
              </div>
              <div className="contact-option">
                <h3>Phone</h3>
                <p>1-800-BLACK-LOCUST</p>
              </div>
              <div className="contact-option">
                <h3>Live Chat</h3>
                <p>Available 24/7 on our website</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
