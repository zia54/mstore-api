'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function AdminPortalPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/admin/all`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const totalGmvMinor = orders.reduce((sum, o) => sum + (o.grandTotalMinor || 0), 0);
  const totalCommissionMinor = orders.reduce(
    (sum, o) =>
      sum +
      (o.subOrders?.reduce((sSum: number, sub: any) => sSum + (sub.commissionMinor || 0), 0) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            M Store Enterprise Governance
          </span>
          <h1 className="text-2xl font-bold text-white">Super Admin Portal</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/seller"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Seller Portal
          </Link>
          <Link
            href="/"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Storefront
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Total Platform Orders</p>
            <p className="mt-2 text-3xl font-bold text-white">{orders.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Gross Merchandise Value (GMV)</p>
            <p className="mt-2 text-3xl font-bold text-amber-400">
              PKR {(totalGmvMinor / 100).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Platform Commission Revenue (8%)</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              PKR {(totalCommissionMinor / 100).toLocaleString()}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Live Marketplace Orders & Sub-Orders</h2>
            <button
              onClick={loadOrders}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs hover:bg-slate-800"
            >
              Refresh Ledger
            </button>
          </div>

          {loading ? (
            <p className="text-slate-400">Loading order ledger...</p>
          ) : orders.length === 0 ? (
            <p className="text-slate-400">
              No orders placed yet. Go to the Storefront and place a test order!
            </p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="font-mono font-bold text-amber-400">
                        {order.orderNumber}
                      </span>
                      <span className="ml-3 text-sm text-slate-300">
                        Customer: {order.customer?.fullName} ({order.customer?.email})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {order.paymentMethod} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ {order.status}
                      </span>
                      <p className="mt-1 font-bold text-white">
                        Total: PKR {(order.grandTotalMinor / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.subOrders?.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="flex flex-wrap items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">
                            {sub.subOrderNumber}
                          </span>{' '}
                          ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ Seller: <span className="text-amber-300">{sub.seller?.storeName}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-slate-400">
                            Commission: PKR {(sub.commissionMinor / 100).toLocaleString()}
                          </span>
                          <span className="font-semibold text-emerald-400">
                            Seller Payout: PKR {(sub.sellerNetMinor / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
