import React from 'react';

const defaultSections = [
  {
    heading: 'Overview',
    body:
      'This page provides important information for Black Locust customers. You can update this content later from your CMS or by editing this file.'
  },
  {
    heading: 'Details',
    body:
      'For now, this section includes placeholder content so every footer link opens a complete page with proper layout and readable text.'
  },
  {
    heading: 'Support',
    body:
      'If you need help, contact our support team at support@blacklocust.com or use the Contact Us page.'
  }
];

function InfoPage({ title, subtitle, sections = defaultSections }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
          {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
        </header>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <section key={`${section.heading}-${idx}`} className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.heading}</h2>
              <p className="text-gray-700 leading-7">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default InfoPage;
