export const dynamic = 'force-dynamic';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function AdminKycPage() {
  const [sellers, setSellers] = useState<any[]>([]);

  const loadSellers = async () => {
    const res = await fetch(`${API_URL}/governance/sellers`);
    if (res.ok) setSellers(await res.json());
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleDecision = async (id: string, kycStatus: 'APPROVED' | 'REJECTED') => {
    await fetch(`${API_URL}/governance/sellers/${id}/kyc`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kycStatus }),
    });
    await loadSellers();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400">Compliance & Risk</span>
          <h1 className="text-xl font-bold text-white">Seller KYC & NTN Verification</h1>
        </div>
        <Link href="/admin" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Back to Admin
        </Link>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-4">
        {sellers.map((s) => (
          <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{s.storeName}</h2>
              <p className="text-xs text-slate-400">
                Legal Entity: {s.legalBusinessName} â€¢ NTN/Tax ID: <strong className="text-amber-300">{s.ntnOrTaxId || 'N/A'}</strong>
              </p>
              <p className="text-xs text-slate-400 mt-1">Owner: {s.user?.fullName} ({s.user?.email})</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-amber-300">
                {s.kycStatus}
              </span>
              <button
                onClick={() => handleDecision(s.id, 'APPROVED')}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(s.id, 'REJECTED')}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
