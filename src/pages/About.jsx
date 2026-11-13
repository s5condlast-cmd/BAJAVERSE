import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Globe2, Headset, Mail, PackageSearch, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";

const ABOUT_IMAGE = "https://media.base44.com/images/public/6ac5de62ce1608ab0e4aa2c0/349414ab4_generated_e80a6159.jpg";

const STATS = [
  { value: "400k", label: "Monthly shoppers" },
  { value: "4,800", label: "Verified sellers" },
  { value: "38", label: "Countries delivered" },
  { value: "4.9", label: "Average order rating" },
];

const VALUES = [
  { Icon: BadgeCheck, title: "Verified sellers only", copy: "Every store on BAJAVERSE passes identity and catalogue checks before a single item is listed." },
  { Icon: ShieldCheck, title: "Transparent pricing", copy: "Deal badges are validated against 30 days of real pricing history — no inflated list prices, ever." },
  { Icon: Truck, title: "Built for fast delivery", copy: "Sellers commit to a 24-hour dispatch window, with tracked shipping on every single order." },
  { Icon: Globe2, title: "Borderless by design", copy: "One checkout, localised delivery options and duties calculated up front for 38 countries." },
];

const STEPS = [
  { Icon: PackageSearch, title: "Browse the marketplace", copy: "Filter by category, price or rating across thousands of live listings." },
  { Icon: Sparkles, title: "Add it to your cart", copy: "Build your basket, compare deals and check out when you are ready." },
  { Icon: RotateCcw, title: "Track and return easily", copy: "Follow your parcel and send anything back within 30 days, no questions." },
];

export default function About() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">About BAJAVERSE</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
            A marketplace engineered for the next decade of shopping
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            BAJAVERSE started with a simple frustration: buying tech online should feel as considered as the products themselves. So we built a marketplace where every seller is verified, every price is honest and every order is tracked from the moment you tap buy.
          </p>

          <div className="relative mt-12 overflow-hidden rounded-3xl border border-border p-2">
            <Image
              src={ABOUT_IMAGE}
              alt="The BAJAVERSE fulfilment warehouse at night, with violet-lit shelves of parcels ready for dispatch"
              fittingType="fill"
              className="h-[260px] w-full rounded-[20px] object-cover sm:h-[360px] lg:h-[440px]"
            />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-border pt-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="num text-3xl font-semibold text-foreground">{stat.value}</dt>
                <dd className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="Our story"
            title="Built by people who buy online a lot"
            description="We are a team of engineers, buyers and ex-warehouse operators across Singapore, Manila and Berlin."
          />
          <div className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            <p>
              BAJAVERSE launched as a single-category store for audio gear. Six months in, independent sellers kept asking to list alongside us — so we rebuilt the platform around them. Today the marketplace spans six departments, thousands of verified stores and a fulfilment network that reaches 38 countries.
            </p>
            <p>
              Everything we ship follows one rule: the product should be the hero. That means clean listings, real photography, honest stock counts and reviews we never edit. If a seller cannot meet the standard, they cannot hold a storefront here.
            </p>
            <p>
              We are still early. Over the next year we are expanding local delivery hubs, adding buyer financing and opening the Seller Center APIs so brands can sync their catalogues automatically.
            </p>
          </div>
        </div>
      </Section>

      <Section className="border-y border-border bg-muted/40">
        <SectionHeading eyebrow="Why BAJAVERSE" title="The standards behind every listing" description="Four commitments that apply to every product, seller and order on the marketplace." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ Icon, title, copy }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-sm font-medium text-foreground">{title}</h3>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="How it works" title="Three steps, no surprises" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ Icon, title, copy }, index) => (
            <div key={title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="num absolute right-5 top-5 text-3xl font-semibold text-muted-foreground/20">{String(index + 1).padStart(2, "0")}</span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-sm font-medium text-foreground">{title}</h3>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="support" className="border-t border-border bg-muted/40">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="Support" title="Talk to a human, any hour" description="Our buyer support team covers every time zone and answers within one hour, day or night." />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full bg-primary px-7 text-sm text-primary-foreground hover:bg-primary/90">
                <a href="mailto:hello@bajashop.com">
                  <Mail className="mr-1.5 h-4 w-4" />
                  Email support
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-border bg-card px-7 text-sm text-foreground hover:bg-muted hover:text-foreground">
                <Link to="/seller">
                  Seller help
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <Headset className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Buyer support</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Order changes, delivery questions and returns — 24 hours a day, seven days a week.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Seller onboarding</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Catalogue setup, commission questions and payout schedules, handled by our merchant team.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Returns &amp; refunds</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">Start a return from your order email within 30 days and we arrange the collection for you.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
