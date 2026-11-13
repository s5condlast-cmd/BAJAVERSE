import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollPulse from "@/components/ScrollPulse";
import BottomTabBar from "@/components/BottomTabBar";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
      <ScrollPulse />
      <Header />
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <BottomTabBar />
    </div>
  );
}
