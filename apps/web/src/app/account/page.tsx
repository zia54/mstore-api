'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function CustomerAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mstore_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      fetch(`${API_URL}/orders/customer/${parsed.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-bold text-white">Sign In Required</h1>
        <p className="text-sm text-slate-400">Please sign in on the Storefront first to view your Customer Dashboard.</p>
        <Link href="/" className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950">
          Go to Storefront & Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400">Buyer Portal</span>
          <h1 className="text-xl font-bold text-white">My Orders & Account Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/track" className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Track Shipment
          </Link>
          <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Back to Store
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-6">
        {user && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs text-slate-400">Logged In Account</p>
              <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
              <p className="text-sm text-slate-400">{user.email} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Role: {user.role}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Orders Placed</p>
              <p className="text-3xl font-extrabold text-amber-400">{orders.length}</p>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white">Order History</h3>
          {loading ? (
            <p className="text-slate-400">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              You have not placed any orders yet. Visit the Storefront to start shopping!
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
                <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <span className="font-mono font-bold text-amber-400 text-lg">{order.orderNumber}</span>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Payment: {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                      {order.status}
                    </span>
                    <p className="mt-1 font-bold text-white">
                      PKR {(order.grandTotalMinor / 100).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.subOrders?.map((sub: any) => (
                  <div key={sub.id} className="rounded-xl bg-slate-950 p-4 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-300 font-semibold">
                        Package: {sub.subOrderNumber} (Seller: {sub.seller?.storeName})
                      </span>
                      <span className="text-amber-300 font-bold">Status: {sub.status}</span>
                    </div>
                    <p className="text-slate-400">
                      Courier Tracking: <span className="font-mono text-emerald-400">{sub.trackingNumber || 'Preparing for Dispatch'}</span>
                    </p>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
