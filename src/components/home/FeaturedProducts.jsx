import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Section from "@/components/Section";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";

export default function FeaturedProducts({ products = [], loading = false }) {
  return (
    <Section id="featured" className="border-y border-border bg-muted/40">
      <SectionHeading
        eyebrow="Featured products"
        title="Handpicked by the BAJAVERSE team"
        description="A rotating edit of the most wanted releases across audio, wearables, imaging and play."
        action={
          <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80">
            See all products
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />
      <ProductGrid products={products} loading={loading} skeletonCount={8} className="mt-10" />
    </Section>
  );
}
