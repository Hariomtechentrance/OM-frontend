import React from 'react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-policy-page">
      <div className="container">
        <div className="page-header">
          <h1>Privacy Policy – Black Locust</h1>
          <p>At Black Locust, we are committed to protecting your privacy and safeguarding your personal information.</p>
          <p>We follow all applicable data protection laws and industry best practices to ensure your information is handled in a secure, responsible, and transparent manner.</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Information We Collect & Use</h2>
            <p>We collect limited personal data to improve your overall shopping experience, including:</p>
            <ul>
              <li>Website functionality and technical administration</li>
              <li>Enhancing user experience and personalization</li>
              <li>Customer support and service</li>
              <li>Updates, offers, and brand communication</li>
            </ul>
            <p>If we plan to use your information for any additional purpose, we will always seek your consent beforehand.</p>
          </section>

          <section className="policy-section">
            <h2>Data Protection & Privacy Commitment</h2>
            <ul>
              <li>We do not sell, rent, or share your personal information (such as name, email, phone number, or address) with third parties for marketing purposes.</li>
              <li>Your data is used only by Black Locust to provide a better shopping experience and relevant updates.</li>
              <li>We do not use cookies to store sensitive personal data or link your information with third parties for profiling.</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Legal Disclosure</h2>
            <p>We may disclose your information only if required by law or to:</p>
            <ul>
              <li>Comply with legal obligations</li>
              <li>Enforce our terms and conditions</li>
              <li>Prevent fraud and reduce security risks</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>Data Security</h2>
            <p>While we take strong measures to protect your information, please note that no method of data transmission over the internet is completely secure. By using our website, you acknowledge and accept this risk.</p>
          </section>

          <section className="policy-section">
            <h2>Contact Us</h2>
            <p>If you have any questions about this privacy policy or our data practices, please contact us:</p>
            <div className="contact-details">
              <div className="contact-item">
                <h3>Email</h3>
                <p>privacy@blacklocust.com</p>
              </div>
              <div className="contact-item">
                <h3>Phone</h3>
                <p>1-800-BLACK-LOCUST</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
