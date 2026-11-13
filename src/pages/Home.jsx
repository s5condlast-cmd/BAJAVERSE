import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Hero from "@/components/home/Hero";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import DealsSection from "@/components/home/DealsSection";
import BestSellers from "@/components/home/BestSellers";
import TrustStrip from "@/components/home/TrustStrip";
import SellerBanner from "@/components/home/SellerBanner";

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    featured: [],
    deals: [],
    best: [],
    categories: [],
    counts: {},
    loading: true,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [featured, deals, best, categories, sales] = await Promise.all([
        base44.entities.Product.filter({ status: "active", featured: true }, { sort: "-rating", limit: 8 }),
        base44.entities.Product.filter({ status: "active", deal: true }, { sort: "-discount_percent", limit: 4 }),
        base44.entities.Product.filter({ status: "active", best_seller: true }, { sort: "-sales_count", limit: 4 }),
        base44.entities.Category.filter({}, { sort: "sort_order", limit: 12 }),
        base44.entities.Product.aggregate({ query: { status: "active" }, groupBy: "category_slug" }),
      ]);
      if (!active) return;

      const counts = {};
      (sales.rows || []).forEach((row) => {
        counts[row.category_slug] = row.count;
      });

      setData({
        featured: featured.items || [],
        deals: deals.items || [],
        best: best.items || [],
        categories: categories.items || [],
        counts,
        loading: false,
      });
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (term) => navigate(term ? `/products?q=${encodeURIComponent(term)}` : "/products");

  return (
    <>
      <Hero onSearch={handleSearch} />
      <CategoryStrip categories={data.categories} counts={data.counts} loading={data.loading} />
      <FeaturedProducts products={data.featured} loading={data.loading} />
      <DealsSection products={data.deals} loading={data.loading} />
      <BestSellers products={data.best} loading={data.loading} />
      <TrustStrip />
      <SellerBanner />
    </>
  );
}
