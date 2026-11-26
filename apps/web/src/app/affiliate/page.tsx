export const dynamic = 'force-dynamic';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function AffiliatePortalPage() {
  const [email, setEmail] = useState('customer@mstore.pk');
  const [code, setCode] = useState('ZIA2026');
  const [stats, setStats] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/affiliate/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, referralCode: code }),
    });
    const data = await res.json();
    if (data.error) {
      setMsg(data.error);
    } else {
      setMsg(`Partner Link Active: http://localhost:3000/?ref=${data.profile.referralCode}`);
      const statsRes = await fetch(`${API_URL}/affiliate/stats/${data.profile.referralCode}`);
      if (statsRes.ok) setStats(await statsRes.json());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400">M Store Creator & Partner Network</span>
          <h1 className="text-xl font-bold text-white">Affiliate Partner Portal (3% Commission)</h1>
        </div>
        <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Storefront
        </Link>
      </header>

      <main className="mx-auto max-w-4xl p-6 space-y-6">
        <form onSubmit={handleActivate} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Generate Your Referral Link</h2>
          {msg && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {msg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Registered Account Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Custom Referral Code</label>
              <input
                required
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
          </div>
          <button type="submit" className="rounded-xl bg-amber-500 px-6 py-2.5 font-bold text-slate-950">
            Activate Affiliate Code
          </button>
        </form>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400">Referred Orders</p>
              <p className="mt-1 text-2xl font-bold text-white">{stats.totalOrders}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400">Referred Sales Volume</p>
              <p className="mt-1 text-2xl font-bold text-amber-400">
                PKR {(stats.totalSalesMinor / 100).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs text-slate-400">Your Commission (3%)</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                PKR {(stats.earnedCommissionMinor / 100).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
