import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const CSV_HEADERS = [
  'name', 'skuCode', 'h1Heading', 'price', 'categoryName', 'collectionName',
  'brand', 'description', 'specifications', 'availability',
  'sizes', 'colors', 'imageUrls',
  'isFeatured', 'isNewArrival', 'isTrending',
  'discountMode', 'discountPercent',
  'tags', 'material', 'careInstructions', 'productLink',
  'fit', 'marketingDescription', 'fabric', 'sleeves', 'collar', 'pocket', 'occasion'
];

const SAMPLE_ROW = [
  'Classic White Shirt', 'BL-WS-001', 'Premium White Formal Shirt for Men', '1299',
  'Men', 'Formal Collection',
  'Black Locust',
  'Premium white formal shirt crafted for office and formal occasions.',
  'Cotton 100% - Machine Wash Cold - Do not bleach',
  'in_stock',
  'S:10,M:15,L:20,XL:10',
  'White,Light Blue',
  'https://example.com/image1.jpg',
  'false', 'true', 'false',
  'inherit', '0',
  'formal,shirt,office,white',
  'Cotton',
  'Machine wash cold gentle cycle',
  '',
  'Regular Fit',
  'The perfect shirt for your office days',
  'Cotton Blend',
  'Full Sleeves',
  'Point Collar',
  'No Pocket',
  'Formal Office'
];

const COLUMN_REFERENCE = [
  { col: 'name', req: true, desc: 'Product name' },
  { col: 'skuCode', req: true, desc: 'Unique SKU code (e.g. BL-001)' },
  { col: 'h1Heading', req: true, desc: 'Page H1 heading' },
  { col: 'price', req: true, desc: 'Price in INR (number)' },
  { col: 'categoryName', req: true, desc: 'Category name — must match an existing category' },
  { col: 'collectionName', req: false, desc: 'Collection name (optional; falls back to category)' },
  { col: 'description', req: true, desc: 'Full product description' },
  { col: 'specifications', req: true, desc: 'Specifications text' },
  { col: 'sizes', req: true, desc: 'Format: S:10,M:20,L:15,XL:5' },
  { col: 'colors', req: false, desc: 'Comma-separated: Black,White,Navy' },
  { col: 'imageUrls', req: false, desc: 'Comma-separated image URLs' },
  { col: 'brand', req: false, desc: 'Default: Black Locust' },
  { col: 'availability', req: false, desc: 'in_stock / out_of_stock / limited' },
  { col: 'isFeatured', req: false, desc: 'true or false' },
  { col: 'isNewArrival', req: false, desc: 'true or false' },
  { col: 'isTrending', req: false, desc: 'true or false' },
  { col: 'discountMode', req: false, desc: 'inherit or custom' },
  { col: 'discountPercent', req: false, desc: '0–100 (only used when discountMode=custom)' },
  { col: 'tags', req: false, desc: 'Comma-separated tags' },
  { col: 'material', req: false, desc: 'Fabric material' },
  { col: 'careInstructions', req: false, desc: 'Washing / care instructions' },
  { col: 'productLink', req: false, desc: 'External product link (optional)' },
  { col: 'fit', req: false, desc: 'Regular Fit / Slim Fit / Tailored Fit / Relaxed Fit' },
  { col: 'marketingDescription', req: false, desc: 'Short marketing copy' },
  { col: 'fabric', req: false, desc: 'Fabric detail (e.g. Cotton Blend)' },
  { col: 'sleeves', req: false, desc: 'Full Sleeves / Half Sleeves / Sleeveless' },
  { col: 'collar', req: false, desc: 'Collar type (e.g. Point Collar)' },
  { col: 'pocket', req: false, desc: 'Pocket detail' },
  { col: 'occasion', req: false, desc: 'Occasion type (e.g. Formal, Casual)' },
];

const PREVIEW_COLS = ['name', 'skuCode', 'price', 'categoryName', 'sizes', 'availability'];

function parseCSVPreview(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1, 6).map(line => {
    const vals = line.split(',');
    const row = {};
    headers.forEach((h, i) => { row[h] = (vals[i] || '').trim().replace(/^"|"$/g, ''); });
    return row;
  }).filter(row => Object.values(row).some(v => v));
  return { headers, rows };
}

const BulkProductUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState({ headers: [], rows: [] });
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const downloadTemplate = () => {
    const escape = (v) => (String(v).includes(',') ? `"${v}"` : v);
    const csvContent = [
      CSV_HEADERS.join(','),
      SAMPLE_ROW.map(escape).join(',')
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const processFile = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.csv')) { toast.error('Please upload a .csv file'); return; }
    setFile(f);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(parseCSVPreview(ev.target.result));
    reader.readAsText(f);
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a CSV file first'); return; }
    setUploading(true);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);
      const res = await api.post('/products/admin/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const r = res.data.results;
      setResults(r);
      if (r.created > 0) toast.success(`${r.created} product${r.created !== 1 ? 's' : ''} created successfully!`);
      if (r.failed > 0) toast.warning(`${r.failed} row${r.failed !== 1 ? 's' : ''} failed — see errors below`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview({ headers: [], rows: [] });
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0 }}>Bulk Product Upload</h2>
        <p style={{ color: '#666', fontSize: '14px', marginTop: '6px' }}>
          Upload a CSV file to add multiple products at once. Follow the steps below.
        </p>
      </div>

      {/* Step 1: Download template */}
      <div style={cardStyle}>
        <div style={stepBadge}>Step 1</div>
        <h3 style={stepTitle}>Download the CSV Template</h3>
        <p style={stepDesc}>
          Fill in the template with your product details. A sample row is included to guide you.
          The <strong>categoryName</strong> must exactly match an existing category in your admin panel.
          For sizes use the format <code style={codeStyle}>S:10,M:20,L:15</code>.
        </p>
        <button onClick={downloadTemplate} style={primaryBtn}>
          ↓ Download CSV Template
        </button>
      </div>

      {/* Step 2: Upload */}
      <div style={cardStyle}>
        <div style={stepBadge}>Step 2</div>
        <h3 style={stepTitle}>Upload Your Filled CSV</h3>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#000' : file ? '#16a34a' : '#ccc'}`,
            borderRadius: '10px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: file ? '#f0fff4' : dragOver ? '#f5f5f5' : '#fafafa',
            transition: 'all 0.2s',
            marginBottom: '16px',
            position: 'relative'
          }}
        >
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
          {file ? (
            <>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
              <p style={{ fontWeight: '600', margin: 0 }}>{file.name}</p>
              <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>
                {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp;
                <button onClick={clearFile} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '13px', padding: 0 }}>
                  Remove
                </button>
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
              <p style={{ fontWeight: '600', margin: 0 }}>Click to select or drag &amp; drop your CSV</p>
              <p style={{ color: '#999', fontSize: '13px', marginTop: '4px' }}>Only .csv files accepted</p>
            </>
          )}
        </div>

        {/* Preview table */}
        {preview.rows.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '8px' }}>
              Preview — first {preview.rows.length} data row{preview.rows.length !== 1 ? 's' : ''}:
            </p>
            <div style={{ overflowX: 'auto', border: '1px solid #e5e5e5', borderRadius: '6px' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0' }}>
                    {PREVIEW_COLS.map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap', borderBottom: '1px solid #ddd' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      {PREVIEW_COLS.map(h => (
                        <td key={h} style={{ padding: '8px 12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row[h] || <span style={{ color: '#bbb' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{ ...primaryBtn, opacity: !file || uploading ? 0.6 : 1, cursor: !file || uploading ? 'not-allowed' : 'pointer', fontSize: '15px', padding: '12px 36px' }}
        >
          {uploading ? '⏳ Uploading...' : '↑ Upload Products'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={cardStyle}>
          <h3 style={stepTitle}>Upload Results</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[
              { label: 'Total Rows', value: results.total, color: '#374151', bg: '#f3f4f6' },
              { label: 'Created', value: results.created, color: '#16a34a', bg: '#f0fff4' },
              { label: 'Failed', value: results.failed, color: results.failed > 0 ? '#dc2626' : '#374151', bg: results.failed > 0 ? '#fff5f5' : '#f3f4f6' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ flex: '1 1 100px', background: bg, borderRadius: '8px', padding: '16px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '32px', fontWeight: '700', color, margin: 0 }}>{value}</p>
                <p style={{ color: '#666', fontSize: '13px', margin: '4px 0 0' }}>{label}</p>
              </div>
            ))}
          </div>

          {results.errors && results.errors.length > 0 && (
            <>
              <p style={{ fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>Failed rows:</p>
              <div style={{ maxHeight: '240px', overflowY: 'auto', background: '#fff8f8', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px' }}>
                {results.errors.map((err, i) => (
                  <div key={i} style={{ fontSize: '13px', paddingBottom: '8px', marginBottom: '8px', borderBottom: i < results.errors.length - 1 ? '1px solid #fecaca' : 'none' }}>
                    <strong>Row {err.row} — {err.name}:</strong>&nbsp;{err.error}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Column reference */}
      <div style={cardStyle}>
        <h3 style={stepTitle}>CSV Column Reference</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '8px' }}>
          {COLUMN_REFERENCE.map(({ col, req, desc }) => (
            <div key={col} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px' }}>
              <code style={codeStyle}>{col}</code>
              {req && <span style={{ color: '#dc2626', fontWeight: '700', flexShrink: 0 }}>*</span>}
              <span style={{ color: '#555' }}>{desc}</span>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '14px', fontSize: '12px', color: '#888' }}>* Required columns</p>
      </div>
    </div>
  );
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: '10px',
  padding: '24px',
  marginBottom: '20px',
};

const stepBadge = {
  display: 'inline-block',
  background: '#000',
  color: '#fff',
  fontSize: '11px',
  fontWeight: '700',
  padding: '3px 10px',
  borderRadius: '20px',
  marginBottom: '10px',
  letterSpacing: '0.05em',
};

const stepTitle = { fontSize: '16px', fontWeight: '700', margin: '0 0 8px' };
const stepDesc = { color: '#555', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' };

const primaryBtn = {
  background: '#000',
  color: '#fff',
  border: 'none',
  padding: '10px 24px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
};

const codeStyle = {
  background: '#e8e8e8',
  padding: '2px 6px',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '12px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

export default BulkProductUpload;
