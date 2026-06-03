import Link from 'next/link';

/* ============================================
   LocaleRent — Landing Page
   Boutique hotel meets modern SaaS.
   Deep Teal primary, Warm Coral secondary,
   Gold accent, flat design, no gradients.
   ============================================ */

export default function HomePage() {
  return (
    <main className="min-h-screen bg-light" role="main">

      {/* ═══════════════════════════════════════
          HERO
          ═══════════════════════════════════════ */}
      <section id="hero" className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Find your perfect stay,<br />anywhere in the world
          </h1>
          <p className="mt-5 text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
            Handpicked rental properties verified for quality, comfort, and value.
            Book with confidence — from cozy cabins to seaside villas.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              aria-label="Explore rentals"
              className="bg-white text-dark font-semibold px-8 py-3.5 rounded-lg hover:bg-light transition-colors w-full sm:w-auto text-center border border-border"
            >
              Explore Rentals
            </Link>
            <Link
              href="/auth/signup"
              aria-label="Sign up for LocaleRent"
              className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto text-center"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TRUST BAR
          ═══════════════════════════════════════ */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-mid">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-success rounded-full" />
            <span>Verified Properties Only</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-accent rounded-full" />
            <span>Best Price Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full" />
            <span>24/7 Guest Support</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-primary rounded-full" />
            <span>Free Cancellation</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          VALUE PROPOSITION
          ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 bg-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-dark">Why guests choose LocaleRent</h2>
            <p className="text-mid mt-3 max-w-xl mx-auto">Every property is hand-verified. Every booking is protected.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary text-2xl mb-5">✓</div>
              <h3 className="font-semibold text-dark text-lg mb-2">Verified Listings</h3>
              <p className="text-mid text-sm leading-relaxed">Every property is inspected for quality, accuracy, and hospitality standards before it goes live.</p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center text-accent text-2xl mb-5">★</div>
              <h3 className="font-semibold text-dark text-lg mb-2">Best Price Guaranteed</h3>
              <p className="text-mid text-sm leading-relaxed">Find a lower price elsewhere and we will match it. No hidden fees, ever.</p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border">
              <div className="w-12 h-12 bg-secondary-light rounded-lg flex items-center justify-center text-secondary text-2xl mb-5">♥</div>
              <h3 className="font-semibold text-dark text-lg mb-2">Peace of Mind</h3>
              <p className="text-mid text-sm leading-relaxed">Free cancellation up to 48 hours before check-in. Full support throughout your stay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED PROPERTIES
          ═══════════════════════════════════════ */}
      <section id="featured" className="py-20 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-dark">Featured Stays</h2>
              <p className="text-mid mt-2">Curated properties from top-rated hosts worldwide.</p>
            </div>
            <Link href="/search" className="text-primary font-medium text-sm hover:underline hidden sm:block">
              View all rentals →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 — Featured */}
            <article className="bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-primary-light flex items-center justify-center">
                <span aria-hidden="true" className="text-6xl opacity-10">🏠</span>
                <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-md">
                  FEATURED
                </span>
                <span className="absolute top-3 right-3 bg-white text-dark text-xs font-semibold px-2.5 py-1 rounded-md border border-border">
                  ★ 4.92
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-dark text-lg">Seaside Villa in Santorini</h3>
                <p className="text-mid text-sm mt-1">Fira, Greece · 3 bed · 2 bath</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">$285</span>
                    <span className="text-mid text-sm"> / night</span>
                  </div>
                  <Link
                    href="/property/seaside-villa-santorini"
                    className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>

            {/* Card 2 — Standard */}
            <article className="bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-light flex items-center justify-center">
                <span aria-hidden="true" className="text-6xl opacity-10">🏡</span>
                <span className="absolute top-3 right-3 bg-white text-dark text-xs font-semibold px-2.5 py-1 rounded-md border border-border">
                  ★ 4.78
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-dark text-lg">Mountain Cabin Retreat</h3>
                <p className="text-mid text-sm mt-1">Aspen, Colorado · 2 bed · 1 bath</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">$175</span>
                    <span className="text-mid text-sm"> / night</span>
                  </div>
                  <Link
                    href="/property/mountain-cabin-aspen"
                    className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>

            {/* Card 3 — Sale */}
            <article className="bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-light flex items-center justify-center">
                <span aria-hidden="true" className="text-6xl opacity-10">🏙️</span>
                <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-1 rounded-md">
                  20% OFF
                </span>
                <span className="absolute top-3 right-3 bg-white text-dark text-xs font-semibold px-2.5 py-1 rounded-md border border-border">
                  ★ 4.85
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-dark text-lg">Downtown Loft Studio</h3>
                <p className="text-mid text-sm mt-1">Lisbon, Portugal · 1 bed · 1 bath</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-mid text-sm line-through mr-1">$120</span>
                    <span className="text-2xl font-bold text-primary">$96</span>
                    <span className="text-mid text-sm"> / night</span>
                  </div>
                  <Link
                    href="/property/downtown-loft-lisbon"
                    className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/search"
              className="inline-flex items-center bg-white text-dark font-medium px-6 py-3 rounded-lg border border-border hover:bg-light transition-colors"
            >
              Browse All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOR HOSTS
          ═══════════════════════════════════════ */}
      <section id="hosts" className="py-20 bg-primary-light">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-bold text-dark">Earn from your property</h2>
              <p className="text-mid mt-4 leading-relaxed">
                List your rental on LocaleRent and reach thousands of travelers looking for their next perfect stay. Free to list, no upfront costs.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <p className="font-medium text-dark">Free to get started</p>
                    <p className="text-mid text-sm mt-0.5">No listing fees. You only pay when you get a booking.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <p className="font-medium text-dark">Verified guests only</p>
                    <p className="text-mid text-sm mt-0.5">Every guest is identity-verified before they can book.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-success text-success-foreground rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <p className="font-medium text-dark">Secure payments</p>
                    <p className="text-mid text-sm mt-0.5">Payouts deposited directly to your account within 48 hours.</p>
                  </div>
                </li>
              </ul>
              <div className="mt-10">
                <Link
                  href="/auth/signup"
                  className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-dark transition-colors inline-block"
                >
                  Start Hosting
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-8 md:p-10">
              <div className="text-center">
                <p className="text-sm text-mid uppercase tracking-wider font-medium">Potential monthly income</p>
                <p className="text-5xl font-bold text-primary mt-3">$2,400</p>
                <p className="text-mid text-sm mt-2">Based on 20 nights/month at avg. $120/night</p>
                <div className="mt-8 pt-6 border-t border-border space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-mid">Average nightly rate</span>
                    <span className="text-dark font-medium">$120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid">Platform fee</span>
                    <span className="text-dark font-medium">3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mid">Avg. occupancy</span>
                    <span className="text-dark font-medium">67%</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="text-dark font-semibold">Est. monthly payout</span>
                    <span className="text-primary font-bold">$2,328</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section id="reviews" className="py-20 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-dark">Guest Reviews</h2>
            <p className="text-mid mt-3">What travelers say about their LocaleRent experience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                location: 'London, UK',
                text: 'The seaside villa was exactly as pictured — spotless, beautifully decorated, and the host was incredibly responsive.',
                rating: 5,
              },
              {
                name: 'James K.',
                location: 'Toronto, CA',
                text: 'Booking was seamless, pricing was transparent, and the mountain cabin was perfect for our family getaway. Will book again.',
                rating: 5,
              },
              {
                name: 'Elena R.',
                location: 'Madrid, ES',
                text: 'I rented my first property through LocaleRent as a host. Within two weeks I had my first booking. The process is incredibly simple.',
                rating: 5,
              },
            ].map((review) => (
              <div key={review.name} className="bg-light rounded-xl p-6 border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-accent text-lg">★</span>
                  ))}
                </div>
                <p className="text-dark leading-relaxed text-sm">"{review.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary font-bold text-sm" aria-hidden="true">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-dark font-medium text-sm">{review.name}</p>
                    <p className="text-mid text-xs">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ
          ═══════════════════════════════════════ */}
      <section id="faq" className="py-20 bg-light border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-dark">Frequently Asked Questions</h2>
            <p className="text-mid mt-3">Everything you need to know about booking with LocaleRent.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'How do you verify properties?',
                a: 'Every listing undergoes a quality review process including photo verification, amenity checks, and host identity confirmation before going live.',
              },
              {
                q: 'What is your cancellation policy?',
                a: 'Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable. Full details are shown on each listing page.',
              },
              {
                q: 'How does payment work?',
                a: 'Payment is collected securely at booking. Hosts receive payout within 48 hours of guest check-in. We support all major credit cards and PayPal.',
              },
              {
                q: 'Is there a fee for listing my property?',
                a: 'Listing is completely free. We charge a small 3% service fee per booking, deducted automatically from host payouts.',
              },
              {
                q: 'What if something goes wrong during my stay?',
                a: 'Our 24/7 support team is available by phone, email, and chat. For urgent issues during your stay, use the emergency line in your booking confirmation.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-lg border border-border group"
              >
                <summary className="px-6 py-4 cursor-pointer font-medium text-dark text-sm list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-mid group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-6 pb-4 text-mid text-sm leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════ */}
      <section id="cta" className="bg-dark text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to find your next stay?</h2>
          <p className="mt-4 text-lg opacity-60 max-w-xl mx-auto">
            Join thousands of travelers who book with confidence on LocaleRent.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/search"
              className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto text-center"
            >
              Explore Rentals
            </Link>
            <Link
              href="/auth/signup"
              className="bg-secondary text-secondary-foreground font-semibold px-8 py-3.5 rounded-lg hover:bg-secondary-dark transition-colors w-full sm:w-auto text-center"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
