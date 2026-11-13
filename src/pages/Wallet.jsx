import React, { useEffect, useMemo, useState } from "react";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import Section from "@/components/Section";

const STATUS_STYLES = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Pending" },
  completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Completed" },
  failed: { icon: XCircle, color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30", label: "Failed" },
};

const FILTERS = ["all", "pending", "completed", "failed"];

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState("");

  const load = async () => {
    const [agg, page] = await Promise.all([
      base44.entities.WalletTransaction.aggregate({ query: { status: "completed" }, groupBy: "type", sum: "amount" }),
      base44.entities.WalletTransaction.filter({}, { sort: "-created_date", limit: 50 }),
    ]);
    const rows = agg.rows || [];
    const credit = rows.find((r) => r.type === "credit")?.sum_amount || 0;
    const debit = rows.find((r) => r.type === "debit")?.sum_amount || 0;
    setBalance(credit - debit);
    setTransactions(page.items || []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const count = await base44.entities.WalletTransaction.count({});
      if (count === 0) {
        await base44.entities.WalletTransaction.bulkCreate([
          { type: "credit", amount: 5000, status: "completed", category: "demo", description: "Demo credit — not real money" },
          { type: "debit", amount: 1200, status: "pending", category: "demo", description: "Demo pending payment — not real money" },
          { type: "credit", amount: 500, status: "failed", category: "demo", description: "Demo failed deposit — not real money" },
        ]);
      }
      load();
    })();
  }, []);

  const filtered = useMemo(() => (filter === "all" ? transactions : transactions.filter((t) => t.status === filter)), [transactions, filter]);

  const showNotice = (action) =>
    setNotice(`${action} requires a connected payment provider (Stripe). This demo wallet moves no real money. Real deposits, withdrawals, and payments will be enabled after KYC and provider setup.`);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[130px]" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1600px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">BAJAVERSE Wallet</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">Your balance &amp; transaction history</h1>
        </div>
      </section>

      <Section className="py-10 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <WalletIcon className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.16em]">Demo balance</span>
            </div>
            <p className="num mt-4 font-display text-4xl font-semibold text-foreground">{formatPrice(balance)}</p>
            <p className="mt-2 text-xs text-amber-600">Prototype — no real funds are held.</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Button onClick={() => showNotice("Depositing")} className="h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowDownToLine className="mr-1 h-4 w-4" /> Deposit
              </Button>
              <Button onClick={() => showNotice("Withdrawing")} variant="outline" className="h-11 rounded-full border-border bg-muted text-foreground hover:bg-muted">
                <ArrowUpFromLine className="mr-1 h-4 w-4" /> Withdraw
              </Button>
              <Button onClick={() => showNotice("Paying")} variant="outline" className="h-11 rounded-full border-border bg-muted text-foreground hover:bg-muted">
                Pay
              </Button>
            </div>
            {notice && <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">{notice}</p>}
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>BAJAVERSE never stores your GCash PIN, passwords, or OTPs. Real money transfers require a verified payment provider, KYC, and escrow compliance.</span>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Transactions</h2>
              <div className="flex gap-1 rounded-full border border-border bg-muted p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium capitalize transition",
                      filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />)
              ) : filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                filtered.map((t) => {
                  const s = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
                  const SIcon = s.icon;
                  const positive = t.type === "credit";
                  return (
                    <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", s.bg, s.color)}>
                        <SIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{t.description}</p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          {t.category} · {new Date(t.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn("num text-sm font-semibold", positive ? "text-emerald-600" : "text-foreground")}>
                          {positive ? "+" : "−"}
                          {formatPrice(t.amount)}
                        </p>
                        <span className={cn("mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium", s.border, s.color, s.bg)}>{s.label}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
