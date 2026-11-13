import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Mail, Youtube } from "lucide-react";
import Logo from "@/components/Logo";

const SHOP_LINKS = [
  { label: "All products", to: "/products" },
  { label: "Audio", to: "/products?category=audio" },
  { label: "Wearables", to: "/products?category=wearables" },
  { label: "Cameras", to: "/products?category=cameras" },
  { label: "Gaming", to: "/products?category=gaming" },
  { label: "Smart Home", to: "/products?category=smart-home" },
];

const COMPANY_LINKS = [
  { label: "About BAJAVERSE", to: "/about" },
  { label: "Seller Center", to: "/seller" },
  { label: "Deals & discounts", to: "/products?sale=1" },
  { label: "Best sellers", to: "/products?best=1" },
];

const ACCOUNT_LINKS = [
  { label: "Sign in", to: "/login" },
  { label: "Create account", to: "/register" },
  { label: "Your cart", to: "/cart" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com", Icon: Facebook },
  { label: "YouTube", href: "https://www.youtube.com", Icon: Youtube },
  { label: "LinkedIn", href: "https://www.linkedin.com", Icon: Linkedin },
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-foreground/80 transition-colors hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              BAJAVERSE is a curated marketplace for future-facing tech. Verified sellers, transparent pricing and
              delivery you can track from checkout to doorstep.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`BAJAVERSE on ${label}`}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title="Shop" links={SHOP_LINKS} />
          <LinkColumn title="Company" links={COMPANY_LINKS} />
          <div>
            <LinkColumn title="Account" links={ACCOUNT_LINKS} />
            <a
              href="mailto:hello@bajashop.com"
              className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 text-primary" />
              hello@bajashop.com
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="num text-xs text-muted-foreground">© 2026 BAJAVERSE. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <Link to="/about" className="transition-colors hover:text-primary">
              About
            </Link>
            <Link to="/seller" className="transition-colors hover:text-primary">
              Seller Center
            </Link>
            <Link to="/about#support" className="transition-colors hover:text-primary">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
