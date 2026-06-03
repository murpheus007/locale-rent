import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { type Locale } from '@/shared/i18n/routing';

type CopyBlock = {
  featured: Array<{
    title: string;
    location: string;
    description: string;
    badge: string;
    price: string;
    meta: string;
  }>;
  steps: Array<{
    title: string;
    description: string;
  }>;
  why: Array<{
    title: string;
    description: string;
  }>;
  host: Array<{
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

const copyByLocale: Record<Locale, CopyBlock> = {
  en: {
    featured: [
      {
        title: 'Marais Lightwell Apartment',
        location: 'Paris, France',
        description: 'A bright two-bedroom stay with a gallery feel, courtyard light, and cafes just outside.',
        badge: 'Guest favorite',
        price: '€190 / night',
        meta: '4.9 rating · 2 beds · 4 guests',
      },
      {
        title: 'Lake View Atelier',
        location: 'Zurich, Switzerland',
        description: 'Quiet, refined, and ideal for longer stays with workspace, views, and a calm interior.',
        badge: 'Featured host',
        price: '€245 / night',
        meta: '4.8 rating · Fast Wi-Fi · 3 guests',
      },
      {
        title: 'Old Town Terrace House',
        location: 'Ghent, Belgium',
        description: 'A character-filled terrace house with room for families and a walkable historic center.',
        badge: 'New on LocaleRent',
        price: '€160 / night',
        meta: '4.7 rating · 3 beds · 6 guests',
      },
    ],
    steps: [
      {
        title: 'Search with intent',
        description: 'Filter by city, trip style, budget, and the details that matter before you book.',
      },
      {
        title: 'Compare with confidence',
        description: 'See local context, host reputation, and clear pricing without noisy clutter.',
      },
      {
        title: 'Book or message the host',
        description: 'Move from discovery to action with a flow that supports both renters and hosts.',
      },
    ],
    why: [
      {
        title: 'Built for multiple languages',
        description: 'Route-based localization keeps the experience readable, shareable, and SEO-friendly.',
      },
      {
        title: 'Designed for trust',
        description: 'Editorial layouts, strong property previews, and clear host signals reduce friction.',
      },
      {
        title: 'Ready for growth',
        description: 'The feature-based structure makes it easy to add bookings, subscriptions, and CMS content.',
      },
    ],
    host: [
      {
        title: 'Show up professionally',
        description: 'Present listings with polished cards, concise copy, and a premium first impression.',
      },
      {
        title: 'Grow into paid tiers',
        description: 'Start free, then unlock more listings, analytics, and premium placement as you grow.',
      },
      {
        title: 'Stay in control',
        description: 'Host tools will eventually cover booking requests, messaging, QR codes, and availability.',
      },
    ],
    testimonials: [
      {
        quote: 'It feels less like a template and more like a place people would actually want to stay.',
        name: 'Sofia M.',
        role: 'Independent host, Lisbon',
      },
      {
        quote: 'The multilingual approach makes the product feel ready for real travel, not just a demo.',
        name: 'Julian K.',
        role: 'Renter, Berlin',
      },
      {
        quote: 'I can see this scaling cleanly because the structure is clear from the start.',
        name: 'Nadia R.',
        role: 'Property manager, Lyon',
      },
    ],
    faq: [
      {
        question: 'Can I book right away?',
        answer: 'That flow will come with the booking phase; the landing page starts by guiding visitors to discover the product.',
      },
      {
        question: 'Is the platform renter-first or host-first?',
        answer: 'The homepage balances both, but the hero and first sections are optimized for renters and discovery.',
      },
      {
        question: 'Will there be search and filters?',
        answer: 'Yes, those will be introduced in the properties and search phases after the homepage foundation is in place.',
      },
      {
        question: 'What about languages?',
        answer: 'LocaleRent is built around English, French, and German from the start, with locale-aware routes and copy.',
      },
    ],
  },
  fr: {
    featured: [
      {
        title: 'Appartement lumineux du Marais',
        location: 'Paris, France',
        description: 'Un deux-pièces baigné de lumière avec une ambiance galerie, une cour intérieure et des cafés tout près.',
        badge: 'Favori des voyageurs',
        price: '€190 / nuit',
        meta: 'Note 4.9 · 2 lits · 4 voyageurs',
      },
      {
        title: 'Atelier avec vue sur le lac',
        location: 'Zurich, Suisse',
        description: 'Calme, raffiné et idéal pour les longs séjours avec espace de travail, vue et intérieur apaisant.',
        badge: 'Hôte à l’honneur',
        price: '€245 / nuit',
        meta: 'Note 4.8 · Wi-Fi rapide · 3 voyageurs',
      },
      {
        title: 'Maison de terrasse dans la vieille ville',
        location: 'Gand, Belgique',
        description: 'Une maison de caractère avec de l’espace pour les familles et un centre historique accessible à pied.',
        badge: 'Nouveau sur LocaleRent',
        price: '€160 / nuit',
        meta: 'Note 4.7 · 3 lits · 6 voyageurs',
      },
    ],
    steps: [
      {
        title: 'Rechercher avec intention',
        description: 'Filtrez par ville, style de séjour, budget et détails importants avant de réserver.',
      },
      {
        title: 'Comparer en confiance',
        description: 'Consultez le contexte local, la réputation de l’hôte et des prix clairs sans surcharge.',
      },
      {
        title: 'Réserver ou contacter l’hôte',
        description: 'Passez de la découverte à l’action avec un parcours pensé pour voyageurs et hôtes.',
      },
    ],
    why: [
      {
        title: 'Pensé pour plusieurs langues',
        description: 'La localisation par route rend l’expérience lisible, partageable et optimisée pour le SEO.',
      },
      {
        title: 'Conçu pour inspirer confiance',
        description: 'Une mise en page éditoriale, des aperçus de qualité et des signaux clairs réduisent les frictions.',
      },
      {
        title: 'Prêt à grandir',
        description: 'L’architecture par fonctionnalités facilite l’ajout des réservations, abonnements et contenus CMS.',
      },
    ],
    host: [
      {
        title: 'Présenter vos annonces avec soin',
        description: 'Des cartes soignées, des textes concis et une première impression premium.',
      },
      {
        title: 'Évoluer vers des offres payantes',
        description: 'Commencez gratuitement, puis débloquez plus d’annonces, d’analyses et de visibilité.',
      },
      {
        title: 'Garder la main',
        description: 'Les outils hôte couvriront plus tard les demandes, les messages, les QR codes et les disponibilités.',
      },
    ],
    testimonials: [
      {
        quote: 'On a moins l’impression d’un modèle et plus d’un vrai lieu où l’on voudrait séjourner.',
        name: 'Sofia M.',
        role: 'Hôte indépendante, Lisbonne',
      },
      {
        quote: 'L’approche multilingue donne l’impression d’un produit prêt pour le voyage réel.',
        name: 'Julian K.',
        role: 'Voyageur, Berlin',
      },
      {
        quote: 'La structure est claire dès le départ, donc l’échelle future paraît naturelle.',
        name: 'Nadia R.',
        role: 'Gestionnaire immobilier, Lyon',
      },
    ],
    faq: [
      {
        question: 'Peut-on réserver tout de suite ?',
        answer: 'Ce parcours arrivera avec la phase de réservation ; la landing page sert d’abord à faire découvrir le produit.',
      },
      {
        question: 'La plateforme est-elle pensée pour les voyageurs ou les hôtes ?',
        answer: 'La page d’accueil équilibre les deux, mais l’hero et les premières sections sont orientés voyageurs.',
      },
      {
        question: 'Y aura-t-il une recherche et des filtres ?',
        answer: 'Oui, ils arriveront dans les phases propriétés et recherche après la base de la landing page.',
      },
      {
        question: 'Et les langues ?',
        answer: 'LocaleRent est construit dès le départ autour de l’anglais, du français et de l’allemand.',
      },
    ],
  },
  de: {
    featured: [
      {
        title: 'Marais-Lichtwohnung',
        location: 'Paris, Frankreich',
        description: 'Ein helles Zwei-Zimmer-Apartment mit Galerie-Feeling, Innenhoflicht und Cafés direkt vor der Tür.',
        badge: 'Beliebt bei Gästen',
        price: '€190 / Nacht',
        meta: '4,9 Bewertung · 2 Betten · 4 Gäste',
      },
      {
        title: 'Atelier mit Seeblick',
        location: 'Zürich, Schweiz',
        description: 'Ruhig, hochwertig und ideal für längere Aufenthalte mit Arbeitsplatz, Aussicht und ruhigem Innenraum.',
        badge: 'Empfohlener Gastgeber',
        price: '€245 / Nacht',
        meta: '4,8 Bewertung · Schnelles WLAN · 3 Gäste',
      },
      {
        title: 'Reihenhaus in der Altstadt',
        location: 'Gent, Belgien',
        description: 'Ein charaktervolles Reihenhaus mit Platz für Familien und einer fußläufigen Altstadt.',
        badge: 'Neu bei LocaleRent',
        price: '€160 / Nacht',
        meta: '4,7 Bewertung · 3 Betten · 6 Gäste',
      },
    ],
    steps: [
      {
        title: 'Gezielt suchen',
        description: 'Filtern Sie nach Stadt, Reisestil, Budget und den Details, die vor der Buchung wichtig sind.',
      },
      {
        title: 'Mit Sicherheit vergleichen',
        description: 'Sehen Sie lokalen Kontext, Gastgeber-Reputation und klare Preise ohne unnötige Unruhe.',
      },
      {
        title: 'Buchen oder den Gastgeber kontaktieren',
        description: 'Wechseln Sie vom Entdecken zur Aktion mit einem Ablauf für Reisende und Gastgeber.',
      },
    ],
    why: [
      {
        title: 'Für mehrere Sprachen gebaut',
        description: 'Die lokalisierte Routenstruktur hält das Erlebnis lesbar, teilbar und SEO-freundlich.',
      },
      {
        title: 'Auf Vertrauen ausgelegt',
        description: 'Editoriales Layout, starke Vorschau-Karten und klare Signale senken die Hürde.',
      },
      {
        title: 'Bereit zum Wachsen',
        description: 'Die Feature-Struktur erleichtert Buchungen, Abos und CMS-Inhalte später erheblich.',
      },
    ],
    host: [
      {
        title: 'Professionell auftreten',
        description: 'Präsentieren Sie Listings mit sauberen Karten, klaren Texten und einem hochwertigen Eindruck.',
      },
      {
        title: 'In kostenpflichtige Stufen wachsen',
        description: 'Starten Sie kostenlos und schalten Sie später mehr Listings, Analytics und Premium-Platzierung frei.',
      },
      {
        title: 'Die Kontrolle behalten',
        description: 'Die Host-Tools werden später Anfragen, Nachrichten, QR-Codes und Verfügbarkeiten abdecken.',
      },
    ],
    testimonials: [
      {
        quote: 'Es wirkt weniger wie eine Vorlage und mehr wie ein Ort, an dem man wirklich wohnen möchte.',
        name: 'Sofia M.',
        role: 'Unabhängige Gastgeberin, Lissabon',
      },
      {
        quote: 'Der mehrsprachige Ansatz vermittelt sofort das Gefühl eines echten Reiseprodukts.',
        name: 'Julian K.',
        role: 'Reisender, Berlin',
      },
      {
        quote: 'Die Struktur ist von Anfang an klar, daher wirkt spätere Skalierung natürlich.',
        name: 'Nadia R.',
        role: 'Property Managerin, Lyon',
      },
    ],
    faq: [
      {
        question: 'Kann man direkt buchen?',
        answer: 'Dieser Ablauf kommt mit der Buchungsphase; die Landingpage führt zuerst in das Produkt ein.',
      },
      {
        question: 'Ist die Plattform eher für Reisende oder Gastgeber gedacht?',
        answer: 'Die Startseite balanciert beide Seiten, aber Hero und erste Abschnitte sind reisefokussiert.',
      },
      {
        question: 'Wird es Suche und Filter geben?',
        answer: 'Ja, diese Funktionen folgen in den Phasen Properties und Search nach dem Aufbau der Startseite.',
      },
      {
        question: 'Und die Sprachen?',
        answer: 'LocaleRent ist von Anfang an auf Englisch, Französisch und Deutsch ausgelegt.',
      },
    ],
  },
};

export async function LandingPage() {
  const locale = (await getLocale()) as Locale;
  const tHome = await getTranslations('home');
  const copy = copyByLocale[locale];

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.08),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(0,0,0,0.06),_transparent_30%)]" />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="inline-flex items-center rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground shadow-sm">
              {tHome('hero.kicker')}
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {tHome('hero.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {tHome('hero.description')}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={`/${locale}#featured-properties`}>{tHome('hero.primaryCta')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${locale}#host-benefits`}>{tHome('hero.secondaryCta')}</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm backdrop-blur">
                <p className="text-sm text-muted-foreground">{tHome('stats.properties')}</p>
                <p className="mt-2 text-2xl font-semibold">120+</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm backdrop-blur">
                <p className="text-sm text-muted-foreground">{tHome('stats.cities')}</p>
                <p className="mt-2 text-2xl font-semibold">35</p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm backdrop-blur">
                <p className="text-sm text-muted-foreground">{tHome('stats.rating')}</p>
                <p className="mt-2 text-2xl font-semibold">4.9/5</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/5 blur-3xl" />
            <Card className="overflow-hidden border-border/70 bg-card/90 shadow-xl shadow-black/5 backdrop-blur">
              <CardContent className="p-6 sm:p-8">
                <div className="rounded-[1.75rem] border border-border/60 bg-[linear-gradient(135deg,_rgba(0,0,0,0.88),_rgba(0,0,0,0.56))] p-5 text-primary-foreground shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.26em] text-white/70">{tHome('featured.badge')}</p>
                      <h2 className="mt-2 text-2xl font-semibold">{copy.featured[0].title}</h2>
                      <p className="mt-1 text-sm text-white/70">{copy.featured[0].location}</p>
                    </div>
                    <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
                      {copy.featured[0].price}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Locale</p>
                      <p className="mt-2 text-sm font-medium">{locale.toUpperCase()}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Guests</p>
                      <p className="mt-2 text-sm font-medium">4</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">Rating</p>
                      <p className="mt-2 text-sm font-medium">{copy.featured[0].meta}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
                    <p className="text-sm leading-7 text-white/85">{copy.featured[0].description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="featured-properties" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {tHome('sections.featuredKicker')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {tHome('sections.featuredTitle')}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {tHome('sections.featuredDescription')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {copy.featured.map((property) => (
            <Card key={property.title} className="overflow-hidden border-border/70 transition-transform duration-300 hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-[linear-gradient(135deg,_rgba(0,0,0,0.92),_rgba(0,0,0,0.52)),linear-gradient(135deg,_#d7c6a3,_#8f9fb0)]" />
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{property.badge}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight">{property.title}</h3>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                    </div>
                    <p className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                      {property.price}
                    </p>
                  </div>
                  <CardDescription className="text-sm leading-6">{property.description}</CardDescription>
                  <p className="text-sm font-medium text-foreground/80">{property.meta}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border/60 bg-secondary/20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {tHome('sections.howKicker')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tHome('sections.howTitle')}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{tHome('sections.howDescription')}</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {copy.steps.map((step, index) => (
              <Card key={step.title} className="border-border/70 bg-background/80">
                <CardHeader>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">0{index + 1}</p>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {tHome('sections.whyKicker')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tHome('sections.whyTitle')}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{tHome('sections.whyDescription')}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {copy.why.map((item) => (
              <Card key={item.title} className="border-border/70 bg-card/90">
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="host-benefits" className="border-y border-border/60 bg-secondary/20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {tHome('sections.hostKicker')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tHome('sections.hostTitle')}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{tHome('sections.hostDescription')}</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {copy.host.map((item) => (
              <Card key={item.title} className="border-border/70 bg-background/80">
                <CardHeader>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {tHome('sections.testimonialKicker')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {tHome('sections.testimonialTitle')}
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {tHome('sections.testimonialDescription')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {copy.testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border/70 bg-card/90">
              <CardContent className="space-y-4 p-6">
                <p className="text-sm leading-7 text-muted-foreground">“{testimonial.quote}”</p>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="faq" className="border-y border-border/60 bg-secondary/20 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {tHome('sections.faqKicker')}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{tHome('sections.faqTitle')}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{tHome('sections.faqDescription')}</p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {copy.faq.map((item) => (
              <Card key={item.question} className="border-border/70 bg-background/80">
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,_rgba(0,0,0,0.95),_rgba(0,0,0,0.7))] text-primary-foreground shadow-2xl">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-12">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/65">
                {tHome('sections.finalKicker')}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {tHome('sections.finalTitle')}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {tHome('sections.finalDescription')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg">
                <Link href={`/${locale}#featured-properties`}>{tHome('sections.finalPrimaryCta')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/${locale}#host-benefits`}>{tHome('sections.finalSecondaryCta')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}