'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function SellerPortalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    brand: 'Aurelia Audio',
    sku: 'AUR-' + Math.floor(1000 + Math.random() * 9000),
    pricePkr: '',
    stockQty: '25',
    imageUrl: 'https://placehold.co/600x400/0f172a/f59e0b?text=M+Store+Product',
    description: 'High-grade enterprise marketplace product with official warranty.',
  });

  const loadCatalog = async () => {
    try {
      const res = await fetch(`${API_URL}/catalog/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const existingCategory = products[0]?.categoryId;
      const existingSeller = products[0]?.variants?.[0]?.offers?.[0]?.sellerId;

      if (!existingCategory || !existingSeller) {
        setMessage('Error: Please ensure database seed is active first.');
        setLoading(false);
        return;
      }

      const slug =
        form.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
        '-' +
        Math.floor(100 + Math.random() * 900);

      const res = await fetch(`${API_URL}/catalog/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: existingCategory,
          sellerId: existingSeller,
          title: form.title,
          slug,
          brand: form.brand,
          description: form.description,
          imageUrl: form.imageUrl,
          sku: form.sku,
          pricePkr: Number(form.pricePkr),
          stockQty: Number(form.stockQty),
        }),
      });

      if (!res.ok) throw new Error('Failed to publish product');

      setMessage('Success! Product published live to M Store catalog.');
      setForm({
        ...form,
        title: '',
        sku: 'AUR-' + Math.floor(1000 + Math.random() * 9000),
        pricePkr: '',
      });
      await loadCatalog();
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            M Store Vendor Central
          </span>
          <h1 className="text-2xl font-bold text-white">Seller Portal</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Admin Portal
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
          >
            Back to Storefront
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">List New Product</h2>
          {message && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
              {message}
            </div>
          )}
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Product Title</label>
              <input
                required
                type="text"
                placeholder="e.g., M-Store Smart Watch Ultra"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Brand</label>
                <input
                  required
                  type="text"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">SKU Code</label>
                <input
                  required
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Price (PKR)</label>
                <input
                  required
                  type="number"
                  min="100"
                  placeholder="15000"
                  value={form.pricePkr}
                  onChange={(e) => setForm({ ...form, pricePkr: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Available Stock</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.stockQty}
                  onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Image URL</label>
              <input
                required
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Product to M Store'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Active Store Inventory ({products.length})
          </h2>
          <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
            {products.map((p) => {
              const offer = p.variants?.[0]?.offers?.[0];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div>
                    <h3 className="font-semibold text-white">{p.title}</h3>
                    <p className="text-xs text-slate-400">
                      SKU: {p.variants?.[0]?.sku} • Stock: {offer?.availableQty ?? 0} units
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400">
                      PKR {((offer?.priceMinor ?? 0) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
