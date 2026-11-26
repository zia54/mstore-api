'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default function MStoreHomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [refCode, setRefCode] = useState<string | null>(null);

  // Auth form
  const [isRegister, setIsRegister] = useState(false);
  const [authForm, setAuthForm] = useState({
    email: 'customer@mstore.pk',
    password: 'MStore@2026',
    fullName: '',
  });
  const [authMsg, setAuthMsg] = useState('');

  // Checkout form
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [address, setAddress] = useState('House 12, Satellite Town, Jhang, Punjab');
  const [phone, setPhone] = useState('0300-1234567');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    // Capture affiliate referral code if present in URL (?ref=ZIA2026)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('mstore_ref', ref.toUpperCase());
        setRefCode(ref.toUpperCase());
      } else {
        setRefCode(localStorage.getItem('mstore_ref'));
      }

      const savedUser = localStorage.getItem('mstore_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }

    fetch(`${API_URL}/catalog/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const formatPrice = (priceMinorPkr: number) => {
    if (currency === 'PKR') {
      return `PKR ${(priceMinorPkr / 100).toLocaleString()}`;
    }
    const usd = priceMinorPkr / 100 / 278;
    return `$${usd.toFixed(2)} USD`;
  };

  const addToCart = (product: any) => {
    const variant = product.variants?.[0];
    const offer = variant?.offers?.[0];
    if (!offer) return;

    setCart((prev) => {
      const existing = prev.find((i) => i.offerId === offer.id);
      if (existing) {
        return prev.map((i) =>
          i.offerId === offer.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          offerId: offer.id,
          title: product.title,
          priceMinor: offer.priceMinor,
          sellerName: offer.seller?.storeName || 'M Store Official',
          quantity: 1,
        },
      ];
    });
    setShowCart(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMsg('');
    const endpoint = isRegister ? 'register' : 'login';
    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      setUser(data.user);
      localStorage.setItem('mstore_user', JSON.stringify(data.user));
      localStorage.setItem('mstore_token', data.accessToken);
      setShowAuth(false);
    } catch (err: any) {
      setAuthMsg(err.message);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowCart(false);
      setShowAuth(true);
      setAuthMsg('Please sign in first to complete your order.');
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.id,
          currency: 'PKR',
          paymentMethod,
          affiliateCode: refCode || undefined,
          shippingAddress: { address, phone, country: 'Pakistan' },
          idempotencyKey: 'ORD-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
          items: cart.map((c) => ({ offerId: c.offerId, quantity: c.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');
      setOrderSuccess(data);
      setCart([]);
    } catch (err: any) {
      alert('Order Error: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartSubtotalMinor = cart.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Enterprise Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 text-xs text-slate-400 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span>Delivering Across Pakistan & Worldwide</span>
          {refCode && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-300 font-semibold">
              Partner Code Applied: {refCode}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 font-medium">
          <Link href="/account" className="text-white font-semibold hover:text-amber-400">My Orders</Link>
          <Link href="/reviews" className="hover:text-amber-400">Reviews</Link>
          <Link href="/track" className="hover:text-amber-400">Track Order</Link>
          <Link href="/pay" className="hover:text-emerald-400">EasyPaisa / Raast Pay</Link>
          <Link href="/affiliate" className="hover:text-amber-400">Affiliate Program</Link>
          <Link href="/seller" className="text-amber-400 hover:underline">Seller Portal</Link>
          <Link href="/seller/orders" className="hover:text-amber-400">Dispatch Orders</Link>
          <Link href="/admin" className="text-emerald-400 hover:underline">Admin</Link>
          <Link href="/admin/kyc" className="text-emerald-400 hover:underline">Seller KYC</Link>
          <Link href="/admin/ledger" className="text-emerald-400 hover:underline">Accounting Ledger</Link>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-6 py-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg">
              M
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">M STORE</span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400">
                Global Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search electronics, flagship gadgets, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Currency, Account & Cart Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrency(currency === 'PKR' ? 'USD' : 'PKR')}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800"
            >
              {currency === 'PKR' ? 'PKR (Rs)' : 'USD ($)'}
            </button>

            {user ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs">
                <span className="text-emerald-400 font-semibold">{user.fullName}</span>
                <button
                  onClick={() => {
                    setUser(null);
                    localStorage.removeItem('mstore_user');
                  }}
                  className="text-slate-400 hover:text-red-400 ml-1"
                >
                  (Logout)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setShowCart(true)}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-8 md:p-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
              Verified Multi-Vendor Ecosystem Ã¢â‚¬Â¢ Escrow Protected
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Shop Direct From Verified Flagship Brands Across Pakistan
            </h1>
            <p className="text-sm text-slate-300">
              Pay via Cash on Delivery, EasyPaisa, JazzCash, or Raast Instant Transfer with real-time order tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/seller"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-slate-200"
            >
              Sell on M Store
            </Link>
            <Link
              href="/track"
              className="rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Track Shipment
            </Link>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Featured Marketplace Catalog ({filteredProducts.length})
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            No products matched your search. Visit the{' '}
            <Link href="/seller" className="text-amber-400 underline">
              Seller Portal
            </Link>{' '}
            to list new products!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const offer = product.variants?.[0]?.offers?.[0];
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition"
                >
                  <div>
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-52 w-full object-cover bg-slate-950"
                    />
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{product.brand || 'Flagship'}</span>
                        <span className="text-emerald-400">
                          {offer?.availableQty > 0 ? `${offer.availableQty} in stock` : 'Out of Stock'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white leading-snug">{product.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{product.description}</p>
                      <p className="text-xs text-amber-300/90 pt-1">
                        Sold by: {offer?.seller?.storeName || 'M Store Official'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-amber-400">
                      {offer ? formatPrice(offer.priceMinor) : 'Unavailable'}
                    </span>
                    <button
                      disabled={!offer || offer.availableQty < 1}
                      onClick={() => addToCart(product)}
                      className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Sign In / Register Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {isRegister ? 'Create M Store Account' : 'Sign In to M Store'}
              </h3>
              <button onClick={() => setShowAuth(false)} className="text-slate-400 hover:text-white">
                ?
              </button>
            </div>
            {authMsg && <p className="text-xs text-amber-400">{authMsg}</p>}
            <form onSubmit={handleAuth} className="space-y-3">
              {isRegister && (
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                />
              )}
              <input
                required
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
              <input
                required
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 py-2.5 font-bold text-slate-950"
              >
                {isRegister ? 'Register Account' : 'Sign In'}
              </button>
            </form>
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-center text-xs text-slate-400 hover:text-amber-400"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New to M Store? Create Account'}
            </button>
          </div>
        </div>
      )}

      {/* Cart & Checkout Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/75 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Your Shopping Cart</h3>
                <button onClick={() => setShowCart(false)} className="text-slate-400 hover:text-white">
                  ?
                </button>
              </div>

              {orderSuccess && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 space-y-2 text-xs">
                  <p className="font-bold text-emerald-300 text-sm">Order Confirmed!</p>
                  <p>
                    Order Number:{' '}
                    <span className="font-mono font-bold text-amber-300">
                      {orderSuccess.orderNumber}
                    </span>
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href="/track"
                      className="rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-slate-950"
                    >
                      Track Order
                    </Link>
                    {paymentMethod !== 'COD' && (
                      <Link
                        href="/pay"
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 font-bold text-slate-950"
                      >
                        Submit Payment TID
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {cart.length === 0 ? (
                <p className="text-sm text-slate-400">Your cart is empty.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.offerId}
                      className="flex justify-between items-center rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity} Ã¢â‚¬Â¢ {formatPrice(item.priceMinor * item.quantity)}
                        </p>
                      </div>
                      <button
                        onClick={() => setCart(cart.filter((c) => c.offerId !== item.offerId))}
                        className="text-xs text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleCheckout} className="space-y-3 border-t border-slate-800 pt-4 mt-4">
                <div className="flex justify-between text-sm font-bold">
                  <span>Subtotal:</span>
                  <span className="text-amber-400">{formatPrice(cartSubtotalMinor)}</span>
                </div>
                <input
                  required
                  type="text"
                  placeholder="Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <input
                  required
                  type="text"
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="EASYPAISA">EasyPaisa Transfer</option>
                  <option value="JAZZCASH">JazzCash Transfer</option>
                  <option value="RAAST">Raast Instant Bank Transfer</option>
                </select>
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-slate-950 hover:bg-emerald-400"
                >
                  {placingOrder ? 'Processing Order...' : 'Confirm & Place Order'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
