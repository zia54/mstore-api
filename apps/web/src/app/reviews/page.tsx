export const dynamic = 'force-dynamic';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function ProductReviewsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('Ali Raza');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/catalog/products`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setSelectedProduct(data[0].id);
        }
      });
  }, []);

  const loadReviews = async (prodId: string) => {
    if (!prodId) return;
    const res = await fetch(`${API_URL}/governance/reviews/${prodId}`);
    if (res.ok) setReviews(await res.json());
  };

  useEffect(() => {
    loadReviews(selectedProduct);
  }, [selectedProduct]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/governance/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProduct, customerName, rating, comment }),
    });
    setComment('');
    await loadReviews(selectedProduct);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400">Customer Trust & Feedback</span>
          <h1 className="text-xl font-bold text-white">Verified Product Reviews</h1>
        </div>
        <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Back to Store
        </Link>
      </header>

      <main className="mx-auto max-w-4xl p-6 space-y-6">
        <form onSubmit={submitReview} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Write a Product Review</h2>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Your Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value={5}>????? (5 - Excellent)</option>
              <option value={4}>????? (4 - Very Good)</option>
              <option value={3}>????? (3 - Average)</option>
              <option value={2}>????? (2 - Fair)</option>
              <option value={1}>????? (1 - Poor)</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Share your experience with product quality and delivery..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <button type="submit" className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950">
            Post Verified Review
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">Customer Reviews ({reviews.length})</h3>
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <strong className="text-white">{r.customerName}</strong>
                <span className="text-amber-400">{'?'.repeat(r.rating)}{'?'.repeat(5 - r.rating)}</span>
              </div>
              <p className="text-sm text-slate-300">{r.comment}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
