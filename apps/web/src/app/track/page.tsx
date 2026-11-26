export const dynamic = 'force-dynamic';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/fulfillment/track/${encodeURIComponent(orderNumber.trim())}`);
      if (!res.ok) throw new Error('Order not found. Please check your Order Number (e.g., MS-2026-...)');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400">M Store Logistics</span>
          <h1 className="text-xl font-bold text-white">Live Order Tracking</h1>
        </div>
        <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Back to Store
        </Link>
      </header>

      <main className="mx-auto max-w-3xl p-6 space-y-6">
        <form onSubmit={handleTrack} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex gap-3">
          <input
            type="text"
            required
            placeholder="Enter Order Number (e.g. MS-2026-XXXXXXXX)"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 hover:bg-amber-400"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {order && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
            <div className="flex flex-wrap justify-between border-b border-slate-800 pb-4">
              <div>
                <p className="text-xs text-slate-400">Order Reference</p>
                <h2 className="text-2xl font-mono font-bold text-amber-400">{order.orderNumber}</h2>
                <p className="text-sm text-slate-300 mt-1">Customer: {order.customer?.fullName}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  {order.status}
                </span>
                <p className="mt-2 font-bold text-lg text-white">
                  PKR {(order.grandTotalMinor / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Shipment Packages</h3>
              {order.subOrders?.map((sub: any) => (
                <div key={sub.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm font-bold text-white">{sub.subOrderNumber}</span>
                    <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300">
                      Status: {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Sold by: <strong className="text-slate-200">{sub.seller?.storeName}</strong> â€¢ Courier Tracking:{' '}
                    <span className="font-mono text-emerald-400">
                      {sub.trackingNumber || 'Awaiting Courier Dispatch'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
