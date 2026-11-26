'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function DigitalPaymentPage() {
  const [form, setForm] = useState({
    orderNumber: '',
    method: 'EASYPAISA',
    transactionId: '',
    senderAccount: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_URL}/payments/submit-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification submission failed');
      setResult(`Payment proof submitted for ${data.orderNumber}! Status: ${data.status}`);
    } catch (err: any) {
      setResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400">Pakistan Digital Checkout</span>
          <h1 className="text-xl font-bold text-white">EasyPaisa / JazzCash / Raast Payment</h1>
        </div>
        <Link href="/" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Back to Store
        </Link>
      </header>

      <main className="mx-auto max-w-2xl p-6 space-y-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2 text-sm">
          <h2 className="font-bold text-emerald-300">Official M Store Merchant Accounts</h2>
          <p>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ <strong>EasyPaisa / JazzCash Merchant:</strong> 0300-8492019 (M Store Pvt Ltd)</p>
          <p>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ <strong>Raast ID / IBAN:</strong> PK36MEZN0001920104829102 (Meezan Bank)</p>
          <p className="text-xs text-slate-400 pt-1">Transfer your order total and enter the Transaction ID (TID) below.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          {result && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
              {result}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Order Number</label>
            <input
              required
              type="text"
              placeholder="MS-2026-XXXXXXXX"
              value={form.orderNumber}
              onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Payment Channel</label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="EASYPAISA">EasyPaisa Mobile Account</option>
              <option value="JAZZCASH">JazzCash Wallet</option>
              <option value="RAAST">Raast Instant Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Transaction ID (TID)</label>
            <input
              required
              type="text"
              placeholder="e.g. 29481048291"
              value={form.transactionId}
              onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Your Sender Mobile / Account Number</label>
            <input
              required
              type="text"
              placeholder="03XX-XXXXXXX"
              value={form.senderAccount}
              onChange={(e) => setForm({ ...form, senderAccount: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-slate-950 hover:bg-emerald-400"
          >
            {loading ? 'Submitting...' : 'Submit Payment Verification'}
          </button>
        </form>
      </main>
    </div>
  );
}
