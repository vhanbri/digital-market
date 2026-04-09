import Link from 'next/link';
import {
  ArrowRight,
  Wheat,
  ShoppingBag,
  Truck,
  Shield,
  Store,
  DollarSign,
  Package,
  Users,
  MapPin,
  CheckCircle,
  Leaf,
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const HomePage = () => {
  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-green-50/30" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
          <Badge variant="green" dot>
            Locally sourced from Cebu&apos;s finest farms
          </Badge>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Cebu&apos;s Freshest Harvest,
            <br />
            <span className="text-brand-800">Delivered to You</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            AniKo sources the freshest produce from Cebu&apos;s local farmers and
            delivers it to restaurants, grocery stores, and consumers across the
            city. Quality-assured, competitively priced, and always fresh.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/marketplace">
              <Button size="lg">
                Browse Marketplace
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg">
                Become a Supplier
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-3 lg:px-8">
          {[
            {
              icon: Leaf,
              color: 'bg-green-100 text-green-700',
              title: 'Locally Sourced',
              desc: 'Every product on our platform comes from verified Cebuano farmers and growers.',
            },
            {
              icon: Shield,
              color: 'bg-amber-100 text-amber-700',
              title: 'Quality Assured',
              desc: 'Our team curates and verifies every listing to ensure you get the best produce.',
            },
            {
              icon: Truck,
              color: 'bg-blue-100 text-blue-700',
              title: 'Fresh & Reliable',
              desc: 'From farm to your business — produce is handled with care and delivered promptly.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-8 text-center transition-shadow hover:shadow-md"
            >
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${item.color}`}>
                <item.icon size={24} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Farmers (Suppliers — informational) */}
      <section id="farmers" className="scroll-mt-20 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="green" dot>For Cebu Farmers</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Partner with AniKo as a supplier
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                We source fresh produce from Cebu&apos;s local farms and sell it through our
                platform. As an AniKo supplier partner, you get a reliable sales
                channel, fair pricing, and access to a growing network of Cebu city buyers
                — without the hassle of managing online sales yourself.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: DollarSign, text: 'Fair and transparent pricing for every supply order' },
                  { icon: Users, text: 'Reach thousands of Cebu city buyers through our platform' },
                  { icon: Shield, text: 'Reliable, recurring orders — no more searching for buyers' },
                  { icon: Wheat, text: 'Focus on farming — we handle sales, curation, and delivery' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                      <item.icon size={16} className="text-green-700" />
                    </div>
                    <span className="text-sm leading-relaxed text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-brand-100 bg-brand-50 px-6 py-5">
                <p className="text-sm font-semibold text-brand-900">
                  Interested in becoming a supplier?
                </p>
                <p className="mt-1 text-sm text-brand-700">
                  Contact our partnerships team at{' '}
                  <a href="mailto:partners@aniko.ph" className="font-medium underline">
                    partners@aniko.ph
                  </a>{' '}
                  or call us at <span className="font-medium">(555) 123-4567</span>.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8">
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h4 className="mb-3 font-semibold text-gray-900">Why partner with us?</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: '200+', label: 'Cebu Partner Farms' },
                      { value: '5K+', label: 'Active Buyers' },
                      { value: '15+', label: 'Cebu Areas Served' },
                      { value: '98%', label: 'Partner Retention' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-gray-50 px-3 py-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{s.value}</p>
                        <p className="text-[10px] text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900">How it works for suppliers</h4>
                  {[
                    '1. Contact our team to become a verified partner',
                    '2. We list your produce on the AniKo marketplace',
                    '3. Buyers order through us — you fulfill the supply',
                    '4. Get paid reliably for every order fulfilled',
                  ].map((step) => (
                    <div key={step} className="flex items-center gap-2 border-b border-gray-50 py-2 last:border-0">
                      <CheckCircle size={14} className="shrink-0 text-green-500" />
                      <span className="text-xs text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section id="buyers" className="scroll-mt-20 border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-gray-100 bg-white p-8">
                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">AniKo Marketplace</h4>
                      <span className="text-xs text-gray-500">120+ products</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Organic Tomatoes', price: '₱250/kg', farm: 'Green Valley Farm' },
                        { name: 'Fresh Lettuce', price: '₱150/kg', farm: 'Sunrise Organics' },
                        { name: 'Sweet Corn', price: '₱40/ear', farm: 'Golden Fields' },
                        { name: 'Strawberries', price: '₱320/kg', farm: 'Berry Hills Farm' },
                      ].map((c) => (
                        <div key={c.name} className="rounded-lg border border-gray-100 bg-white p-3">
                          <div className="mb-2 flex h-12 items-center justify-center rounded-lg bg-brand-50 text-xl">
                            🌾
                          </div>
                          <p className="text-xs font-medium text-gray-900">{c.name}</p>
                          <p className="text-[10px] text-gray-400">Sourced from {c.farm}</p>
                          <p className="mt-1 text-xs font-bold text-brand-800">{c.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Order Tracking</p>
                      <p className="text-xs text-gray-500">Real-time status updates</p>
                    </div>
                    <div className="flex gap-1">
                      {['Placed', 'Accepted', 'Delivered'].map((s, i) => (
                        <span
                          key={s}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            i < 2 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="yellow" dot>For Buyers</Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Quality produce, sourced locally
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-gray-600">
                Browse our curated marketplace of fresh produce sourced from verified
                local farmers. Add items to your cart, place orders, and track
                delivery — all managed by AniKo.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: ShoppingBag, text: 'Browse a curated selection of locally sourced produce' },
                  { icon: Package, text: 'Simple cart and checkout — order in seconds' },
                  { icon: MapPin, text: 'All produce sourced from verified Cebu farms' },
                  { icon: Shield, text: 'Quality-assured with full order tracking and status updates' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                      <item.icon size={16} className="text-amber-700" />
                    </div>
                    <span className="text-sm leading-relaxed text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/marketplace">
                  <Button>
                    Browse Marketplace
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Badge variant="gray">How It Works</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Three simple steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Whether you&apos;re a farmer supplying produce or a buyer stocking up,
            getting started takes minutes.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                icon: Users,
                title: 'Create an Account',
                desc: 'Sign up as a supplier to list your produce, or as a buyer to start ordering fresh goods.',
              },
              {
                step: '2',
                icon: Store,
                title: 'List or Browse',
                desc: 'Farmers list available produce. Buyers browse our curated marketplace and add items to cart.',
              },
              {
                step: '3',
                icon: CheckCircle,
                title: 'Order & Fulfill',
                desc: 'Buyers place orders through AniKo. We handle fulfillment. Track everything in your dashboard.',
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-xl border border-gray-100 p-8 transition-shadow hover:shadow-md">
                <span className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
                  {item.step}
                </span>
                <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                  <item.icon size={22} className="text-brand-700" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-gray-100 bg-brand-800">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
            {[
            { value: '200+', label: 'Cebu Partner Farms' },
            { value: '5K+', label: 'Active Buyers' },
            { value: '15+', label: 'Areas Served' },
            { value: '10K+', label: 'Orders Fulfilled' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-brand-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <Badge variant="gray">About AniKo</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Bridging Cebu farms and city markets
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            AniKo is a Cebu-based company dedicated to connecting local
            agriculture with urban demand. We source fresh produce from verified
            partner farms across the province and make it available to restaurants,
            grocery stores, and consumers through our online marketplace.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Our mission is to support Cebu&apos;s farming communities by providing a
            reliable sales channel, while ensuring city buyers get the freshest,
            highest-quality produce at competitive prices. Every order through
            AniKo supports a real Cebuano farmer.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Join hundreds of Cebu partner farms and thousands of buyers already using
            AniKo to source and sell locally grown produce.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg">
                Create Free Account
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
