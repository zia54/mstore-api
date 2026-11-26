export const dynamic = 'force-dynamic';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function AccountingLedgerPage() {
  const [data, setData] = useState<{ accounts: any[]; transactions: any[] }>({
    accounts: [],
    transactions: [],
  });

  const loadLedger = async () => {
    const res = await fetch(`${API_URL}/fulfillment/admin/ledger`);
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400">Double-Entry Financial Core</span>
          <h1 className="text-xl font-bold text-white">M Store Accounting Ledger</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="rounded-lg border border-slate-700 px-4 py-2 text-sm">
            Admin Orders
          </Link>
          <Link href="/seller/orders" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Seller Fulfillment
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.accounts.map((acc) => {
            const totalDebit = acc.entries.reduce((s: number, e: any) => s + e.debitMinor, 0);
            const totalCredit = acc.entries.reduce((s: number, e: any) => s + e.creditMinor, 0);
            const balanceMinor = acc.type === 'ASSET' ? totalDebit - totalCredit : totalCredit - totalDebit;
            return (
              <div key={acc.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <span className="text-xs font-mono text-slate-400">{acc.code} ({acc.type})</span>
                <h2 className="mt-1 font-semibold text-white">{acc.name}</h2>
                <p className="mt-3 text-2xl font-bold text-emerald-400">
                  PKR {(balanceMinor / 100).toLocaleString()}
                </p>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Journal Entries (Debit = Credit Verified)</h2>
            <button onClick={loadLedger} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs">
              Refresh
            </button>
          </div>

          {data.transactions.length === 0 ? (
            <p className="text-sm text-slate-400">
              No journal entries yet. Mark an order as Delivered in Seller Orders to trigger automatic double-entry settlement!
            </p>
          ) : (
            data.transactions.map((tx) => (
              <div key={tx.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="font-semibold text-amber-300">{tx.description}</span>
                  <span>{new Date(tx.postedAt).toLocaleString()}</span>
                </div>
                <table className="w-full text-left text-xs mt-2">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1">Account</th>
                      <th className="py-1 text-right">Debit (PKR)</th>
                      <th className="py-1 text-right">Credit (PKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tx.entries.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-slate-900">
                        <td className="py-1.5 text-slate-200">{entry.account?.name}</td>
                        <td className="py-1.5 text-right font-mono text-amber-400">
                          {entry.debitMinor > 0 ? (entry.debitMinor / 100).toLocaleString() : '-'}
                        </td>
                        <td className="py-1.5 text-right font-mono text-emerald-400">
                          {entry.creditMinor > 0 ? (entry.creditMinor / 100).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
