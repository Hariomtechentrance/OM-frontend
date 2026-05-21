import React, { useState, useEffect } from 'react';
import './SizeChartModal.css';

// ── Size data ─────────────────────────────────────────────────────────────────

const TOPS_IN = {
  label: 'Tops (Shirts / T-Shirts / Polo / Jackets)',
  columns: ['CHEST', 'LENGTH', 'SHOULDER', 'SLEEVE'],
  rows: [
    { size: 'XS', values: [36, 26, 15.5, 26] },
    { size: 'S',  values: [38, 27, 16,   27] },
    { size: 'M',  values: [40, 28, 16.5, 28] },
    { size: 'L',  values: [42, 29, 17,   29] },
    { size: 'XL', values: [44, 30, 17.5, 30] },
    { size: 'XXL',values: [46, 31, 18,   31] },
  ],
};

const BOTTOMS_IN = {
  label: 'Bottoms (Jeans / Pants / Cargo / Trousers)',
  columns: ['WAIST', 'HIP', 'INSEAM', 'LENGTH'],
  rows: [
    { size: '28', values: [28, 34, 30, 40] },
    { size: '30', values: [30, 36, 30, 41] },
    { size: '32', values: [32, 38, 31, 41.5] },
    { size: '34', values: [34, 40, 31, 42] },
    { size: '36', values: [36, 42, 32, 42.5] },
    { size: '38', values: [38, 44, 32, 43] },
  ],
};

const KIDS_IN = {
  label: 'Kids (T-Shirts / Shirts / Tops)',
  columns: ['CHEST', 'LENGTH', 'SHOULDER', 'SLEEVE'],
  rows: [
    { size: '2-4Y',  values: [22, 15, 10,   13] },
    { size: '5-7Y',  values: [25, 17, 11.5, 15] },
    { size: '8-10Y', values: [28, 19, 12.5, 17] },
    { size: '11-13Y',values: [31, 21, 13.5, 19] },
  ],
};

const toInch = (v) => v;
const toCm = (v) => parseFloat((v * 2.54).toFixed(1));

function convertChart(chart, unit) {
  if (unit === 'IN') return chart;
  return {
    ...chart,
    rows: chart.rows.map(r => ({ ...r, values: r.values.map(toCm) })),
  };
}

// ── Detect chart type from product data ──────────────────────────────────────

function detectChartType(product) {
  const check = (...fields) =>
    fields.some(f => {
      const v = String(product?.[f] || '').toLowerCase();
      return v.length > 0;
    });

  const allText = [
    product?.name, product?.subcategory, product?.h1Heading,
    product?.description, ...(product?.tags || []),
    product?.category?.name, product?.collection?.name,
  ].join(' ').toLowerCase();

  const isKids = /\bkid|child|infant|toddler|boy|girl|2-4y|5-7y|8-10y/.test(allText);
  if (isKids) return 'kids';

  const isBottom = /\bjean|denim|pant|trouser|cargo|chino|linen pant|jogger|slack/.test(allText);
  if (isBottom) return 'bottoms';

  return 'tops';
}

// ── HOW TO MEASURE content ───────────────────────────────────────────────────

const HOW_TO_TOPS = [
  { label: 'CHEST', desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.' },
  { label: 'LENGTH', desc: 'Measure from the highest point of your shoulder straight down to the hem.' },
  { label: 'SHOULDER', desc: 'Measure from the edge of one shoulder to the edge of the other across the back.' },
  { label: 'SLEEVE', desc: 'Measure from the shoulder seam to the end of the sleeve.' },
];

const HOW_TO_BOTTOMS = [
  { label: 'WAIST', desc: 'Measure around your natural waist, just above the belly button.' },
  { label: 'HIP', desc: 'Measure around the fullest part of your hips, about 8 inches below the waist.' },
  { label: 'INSEAM', desc: 'Measure from the crotch seam down to the bottom of the leg.' },
  { label: 'LENGTH', desc: 'Measure from the waistband top to the bottom of the leg.' },
];

const HOW_TO_KIDS = HOW_TO_TOPS;

// ── Component ────────────────────────────────────────────────────────────────

const SizeChartModal = ({ isOpen, onClose, product }) => {
  const [unit, setUnit] = useState('IN');
  const [tab, setTab] = useState('chart'); // 'chart' | 'measure'

  useEffect(() => {
    if (!isOpen) return;
    setUnit('IN');
    setTab('chart');
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const chartType = detectChartType(product);
  const baseChart = chartType === 'kids' ? KIDS_IN : chartType === 'bottoms' ? BOTTOMS_IN : TOPS_IN;
  const howTo = chartType === 'kids' ? HOW_TO_KIDS : chartType === 'bottoms' ? HOW_TO_BOTTOMS : HOW_TO_TOPS;
  const chart = convertChart(baseChart, unit);

  return (
    <div className="sc-overlay" onClick={onClose}>
      <div className="sc-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sc-header">
          <div className="sc-tabs">
            <button
              className={`sc-tab ${tab === 'chart' ? 'active' : ''}`}
              onClick={() => setTab('chart')}
            >
              SIZE CHART
            </button>
            <button
              className={`sc-tab ${tab === 'measure' ? 'active' : ''}`}
              onClick={() => setTab('measure')}
            >
              HOW TO MEASURE
            </button>
          </div>
          <button className="sc-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="sc-body">
          {tab === 'chart' && (
            <>
              {/* Unit toggle */}
              <div className="sc-unit-toggle">
                <button
                  className={`sc-unit-btn ${unit === 'CM' ? 'active' : ''}`}
                  onClick={() => setUnit('CM')}
                >CM</button>
                <button
                  className={`sc-unit-btn ${unit === 'IN' ? 'active' : ''}`}
                  onClick={() => setUnit('IN')}
                >IN</button>
              </div>

              {/* Table */}
              <div className="sc-table-wrap">
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th></th>
                      {chart.columns.map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {chart.rows.map(row => (
                      <tr key={row.size}>
                        <td className="sc-size-label">{row.size}</td>
                        {row.values.map((v, i) => <td key={i}>{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="sc-note">
                Measurements are in {unit === 'IN' ? 'Inches' : 'Centimeters'}
              </p>
            </>
          )}

          {tab === 'measure' && (
            <div className="sc-measure">
              <p className="sc-measure-intro">
                For the best fit, measure yourself and compare to the size chart.
                Use a soft measuring tape and keep it snug but not tight.
              </p>
              <div className="sc-measure-grid">
                {howTo.map(({ label, desc }) => (
                  <div key={label} className="sc-measure-item">
                    <div className="sc-measure-icon">
                      {label === 'CHEST' || label === 'WAIST' ? '📏' :
                       label === 'LENGTH' ? '📐' :
                       label === 'SHOULDER' ? '↔' :
                       label === 'SLEEVE' ? '💪' :
                       label === 'HIP' ? '〰' :
                       label === 'INSEAM' ? '↕' : '📏'}
                    </div>
                    <div>
                      <p className="sc-measure-label">{label}</p>
                      <p className="sc-measure-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sc-measure-tip">
                <strong>Pro tip:</strong> If you are between sizes, size up for a more comfortable fit.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
