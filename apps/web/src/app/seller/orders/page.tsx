'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function SellerOrdersPage() {
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadSubOrders = async () => {
    const res = await fetch(`${API_URL}/fulfillment/seller/sub-orders`);
    if (res.ok) setSubOrders(await res.json());
  };

  useEffect(() => {
    loadSubOrders();
  }, []);

  const updateStatus = async (subOrderId: string, status: string) => {
    setUpdatingId(subOrderId);
    try {
      await fetch(`${API_URL}/fulfillment/sub-orders/${subOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: trackingInputs[subOrderId] || undefined,
        }),
      });
      await loadSubOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400">Vendor Fulfillment</span>
          <h1 className="text-xl font-bold text-white">Seller Orders & Dispatch</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/seller" className="rounded-lg border border-slate-700 px-4 py-2 text-sm">
            Product Catalog
          </Link>
          <Link href="/admin/ledger" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Accounting Ledger
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-4">
        {subOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            No customer orders received yet. Place an order on the Storefront first!
          </div>
        ) : (
          subOrders.map((sub) => (
            <div key={sub.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <div className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="font-mono font-bold text-amber-400">{sub.subOrderNumber}</span>
                  <p className="text-xs text-slate-400">
                    Customer: {sub.order?.customer?.fullName} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Net Payout: PKR {(sub.sellerNetMinor / 100).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 h-fit">
                  {sub.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Courier Tracking # (e.g. TCS-884920)"
                  value={trackingInputs[sub.id] ?? sub.trackingNumber ?? ''}
                  onChange={(e) => setTrackingInputs({ ...trackingInputs, [sub.id]: e.target.value })}
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                <button
                  disabled={updatingId === sub.id}
                  onClick={() => updateStatus(sub.id, 'PACKED')}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold hover:bg-slate-700"
                >
                  Mark Packed
                </button>
                <button
                  disabled={updatingId === sub.id}
                  onClick={() => updateStatus(sub.id, 'SHIPPED')}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Dispatch / Ship
                </button>
                <button
                  disabled={updatingId === sub.id}
                  onClick={() => updateStatus(sub.id, 'DELIVERED')}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  Mark Delivered (Settle Ledger)
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
