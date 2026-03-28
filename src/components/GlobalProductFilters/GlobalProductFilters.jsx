import React, { useState, useEffect, useMemo } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../../api/axios';
import { defaultProductFilterState } from '../../utils/productFilters';
import './GlobalProductFilters.css';

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'];
const COLOR_OPTIONS = [
  'Black',
  'White',
  'Gray',
  'Navy',
  'Blue',
  'Red',
  'Green',
  'Brown',
  'Beige',
  'Pink',
  'Khaki',
  'Olive',
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured / Latest' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-low', label: 'Price: Low to high' },
  { value: 'price-high', label: 'Price: High to low' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name-asc', label: 'Name: A–Z' },
  { value: 'name-desc', label: 'Name: Z–A' },
];

/**
 * Shared filters for listing pages (New Arrivals, Shop Collections, All Products, menu collections).
 * Calls onApply with a plain filter object whenever user clicks Apply (parent merges preset and fetches).
 */
const GlobalProductFilters = ({
  onApply,
  hideCategory = false,
  hideCollection = false,
  initialFilters = null,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [form, setForm] = useState(() => ({ ...defaultProductFilterState, ...initialFilters }));

  useEffect(() => {
    if (initialFilters && typeof initialFilters === 'object') {
      setForm((prev) => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catRes, colRes] = await Promise.all([
          api.get('/categories?active=true').catch(() => ({ data: {} })),
          api.get('/collections?isActive=true').catch(() => ({ data: {} })),
        ]);
        if (cancelled) return;
        const catList = catRes.data?.data || catRes.data?.categories || [];
        setCategories(Array.isArray(catList) ? catList : []);
        const cols = colRes.data?.collections || [];
        setCollections(Array.isArray(cols) ? cols : []);
      } catch {
        if (!cancelled) {
          setCategories([]);
          setCollections([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      value: c.slug || c._id,
      label: c.name || c.slug || 'Category',
    }));
  }, [categories]);

  const collectionOptions = useMemo(() => {
    return collections.map((c) => ({
      value: c.slug || c._id,
      label: c.name || c.slug || 'Collection',
    }));
  }, [collections]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArray = (key, value) => {
    setForm((prev) => {
      const arr = prev[key] || [];
      const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const handleApply = () => {
    onApply?.({ ...form });
  };

  const handleReset = () => {
    const next = { ...defaultProductFilterState };
    if (hideCategory && initialFilters?.category) next.category = initialFilters.category;
    if (hideCollection && initialFilters?.collection) next.collection = initialFilters.collection;
    setForm(next);
    onApply?.(next);
  };

  return (
    <div className={`global-product-filters ${className}`.trim()}>
      <div className="global-product-filters__header">
        <span className="global-product-filters__title">
          <FaFilter aria-hidden /> Filters
        </span>
        <button
          type="button"
          className="global-product-filters__toggle"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              Hide <FaChevronUp />
            </>
          ) : (
            <>
              Show all <FaChevronDown />
            </>
          )}
        </button>
      </div>

      <div className="global-product-filters__row global-product-filters__row--primary">
        {!hideCategory && (
          <label className="gpf-field">
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              <option value="">All categories</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {!hideCollection && (
          <label className="gpf-field">
            <span>Collection</span>
            <select
              value={form.collection}
              onChange={(e) => setField('collection', e.target.value)}
            >
              <option value="">All collections</option>
              {collectionOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="gpf-field">
          <span>Brand</span>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => setField('brand', e.target.value)}
            placeholder="e.g. Black Locust"
          />
        </label>
        <label className="gpf-field gpf-field--narrow">
          <span>Min ₹</span>
          <input
            type="number"
            min={0}
            value={form.minPrice}
            onChange={(e) => setField('minPrice', e.target.value)}
            placeholder="0"
          />
        </label>
        <label className="gpf-field gpf-field--narrow">
          <span>Max ₹</span>
          <input
            type="number"
            min={0}
            value={form.maxPrice}
            onChange={(e) => setField('maxPrice', e.target.value)}
            placeholder="Any"
          />
        </label>
        <label className="gpf-field">
          <span>Sort</span>
          <select value={form.sortBy} onChange={(e) => setField('sortBy', e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="gpf-actions">
          <button type="button" className="gpf-btn gpf-btn--primary" onClick={handleApply}>
            Apply
          </button>
          <button type="button" className="gpf-btn gpf-btn--ghost" onClick={handleReset}>
            <FaTimes aria-hidden /> Reset
          </button>
        </div>
      </div>

      {expanded && (
        <div className="global-product-filters__expanded">
          <div className="gpf-chip-group">
            <span className="gpf-chip-label">Sizes</span>
            <div className="gpf-chips">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`gpf-chip ${form.sizes?.includes(s) ? 'is-active' : ''}`}
                  onClick={() => toggleArray('sizes', s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="gpf-chip-group">
            <span className="gpf-chip-label">Colors</span>
            <div className="gpf-chips">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`gpf-chip ${form.colors?.includes(c) ? 'is-active' : ''}`}
                  onClick={() => toggleArray('colors', c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalProductFilters;
