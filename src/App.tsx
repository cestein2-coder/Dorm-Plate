import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
import React, { useEffect, useMemo, useState } from "react";

/** ---------- Types ---------- */
export type Meal = {
  id: string;
  name: string;
  tags: string[];            // e.g., ['cheap', 'no-cook', '15-min']
  rating: number;            // 0..5
  cost: number;              // per serving, e.g. 2.49
  prepMinutes: number;       // estimated prep time
  calories?: number;         // optional
  imageUrl?: string;
  description?: string;
  link?: string;             // optional recipe / detail URL
};

type TopMealsSectionProps = {
  title?: string;
  meals?: Meal[];            // if omitted, uses the mockData below
  defaultFilters?: string[]; // tags to preselect as active
};

/** ---------- Local Mock (safe fallback) ---------- */
const mockData: Meal[] = [
  {
    id: "oats-jar",
    name: "Overnight Oats Jar",
    tags: ["no-cook", "cheap", "5-min", "fridge-friendly"],
    rating: 4.7,
    cost: 1.25,
    prepMinutes: 5,
    calories: 420,
    imageUrl:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
    description:
      "Rolled oats + milk + peanut butter + banana. Mix, refrigerate, and go.",
  },
  {
    id: "microwave-quesadilla",
    name: "Microwave Quesadilla",
    tags: ["microwave", "cheap", "10-min"],
    rating: 4.5,
    cost: 1.85,
    prepMinutes: 8,
    calories: 380,
    imageUrl:
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1200&auto=format&fit=crop",
    description:
      "Tortilla + cheese + canned beans. Microwave, fold, and crisp on a pan if you can.",
  },
  {
    id: "pesto-pasta",
    name: "One-Pot Pesto Pasta",
    tags: ["15-min", "stovetop", "leftover-friendly"],
    rating: 4.8,
    cost: 2.35,
    prepMinutes: 15,
    calories: 520,
    imageUrl:
      "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1200&auto=format&fit=crop",
    description:
      "Pasta + store pesto + frozen veggies. Cook once, eat twice.",
  },
  {
    id: "tuna-bowl",
    name: "No-Cook Tuna Rice Bowl",
    tags: ["no-cook", "15-min", "protein"],
    rating: 4.4,
    cost: 2.10,
    prepMinutes: 12,
    calories: 450,
    imageUrl:
      "https://images.unsplash.com/photo-1604909052743-88b71b3fba88?q=80&w=1200&auto=format&fit=crop",
    description:
      "Microwave rice cup + canned tuna + mayo + soy sauce + scallions.",
  },
  {
    id: "sheet-pan",
    name: "Sheet-Pan Chicken & Veg",
    tags: ["oven", "30-min", "leftover-friendly"],
    rating: 4.6,
    cost: 3.10,
    prepMinutes: 30,
    calories: 580,
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    description:
      "Chicken thighs + frozen veggies + seasoning. Roast and portion.",
  },
];

/** ---------- Small Utilities ---------- */
const currency = (n: number) => `$${n.toFixed(2)}`;

function useSavedMeals(key = "dormplate_saved_meals") {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, [key]);

  const toggle = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  return { saved, toggle, isSaved: (id: string) => saved.includes(id) };
}

const tagPalette: Record<string, string> = {
  "no-cook": "bg-emerald-100 text-emerald-800",
  cheap: "bg-yellow-100 text-yellow-800",
  "5-min": "bg-blue-100 text-blue-800",
  "10-min": "bg-blue-100 text-blue-800",
  "15-min": "bg-blue-100 text-blue-800",
  "30-min": "bg-blue-100 text-blue-800",
  microwave: "bg-rose-100 text-rose-800",
  stovetop: "bg-purple-100 text-purple-800",
  oven: "bg-orange-100 text-orange-800",
  "leftover-friendly": "bg-teal-100 text-teal-800",
  protein: "bg-fuchsia-100 text-fuchsia-800",
  "fridge-friendly": "bg-lime-100 text-lime-800",
};

/** ---------- Card ---------- */
function MealCard({
  meal,
  onSave,
  saved,
}: {
  meal: Meal;
  saved: boolean;
  onSave: (id: string) => void;
}) {
  const stars = Math.round(meal.rating ?? 0);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {meal.imageUrl && (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug">{meal.name}</h3>
          <button
            onClick={() => onSave(meal.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm border transition ${
              saved
                ? "bg-black text-white border-black"
                : "bg-white text-black border-gray-300 hover:bg-gray-50"
            }`}
            aria-pressed={saved}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {meal.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tagPalette[t] ?? "bg-gray-100 text-gray-800"}`}
            >
              {t}
            </span>
          ))}
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">{meal.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-700">
          <span className="flex items-center gap-1" aria-label={`Rating ${meal.rating} out of 5`}>
            {"★".repeat(stars)}
            {"☆".repeat(5 - stars)}
            <span className="ml-1 text-gray-500">({meal.rating.toFixed(1)})</span>
          </span>
          <span>
            {currency(meal.cost)} • {meal.prepMinutes} min
          </span>
        </div>

        {meal.link && (
          <a
            href={meal.link}
            className="inline-block text-sm font-medium text-blue-600 underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            View recipe →
          </a>
        )}
      </div>
    </div>
  );
}

/** ---------- Top Meals Section ---------- */
const TopMealsSection: React.FC<TopMealsSectionProps> = ({
  title = "Top Meals",
  meals = mockData,
  defaultFilters = [],
}) => {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>(defaultFilters);
  const [sort, setSort] = useState<"top" | "cheap" | "fast">("top");
  const { saved, toggle, isSaved } = useSavedMeals();

  const allTags = useMemo(() => {
    const s = new Set<string>();
    meals.forEach((m) => m.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [meals]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = meals.filter((m) => {
      const matchesQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTags =
        activeTags.length === 0 || activeTags.every((t) => m.tags.includes(t));
      return matchesQ && matchesTags;
    });

    if (sort === "top") out = out.sort((a, b) => b.rating - a.rating);
    if (sort === "cheap") out = out.sort((a, b) => a.cost - b.cost);
    if (sort === "fast") out = out.sort((a, b) => a.prepMinutes - b.prepMinutes);

    return out;
  }, [meals, query, activeTags, sort]);

  const toggleTag = (t: string) =>
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-gray-600">
            Quick, budget-friendly, dorm-proof meals. Filter, sort, and save your favorites.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meals or tags…"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none sm:w-64"
              aria-label="Search meals"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            aria-label="Sort meals"
          >
            <option value="top">Top Rated</option>
            <option value="cheap">Lowest Cost</option>
            <option value="fast">Fastest Prep</option>
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {allTags.map((t) => {
          const active = activeTags.includes(t);
          return (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              }`}
              aria-pressed={active}
            >
              {t}
            </button>
          );
        })}
        {activeTags.length > 0 && (
          <button
            onClick={() => setActiveTags([])}
            className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
          No meals match your filters. Try clearing filters or changing the search.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              saved={isSaved(m.id)}
              onSave={toggle}
            />
          ))}
        </div>
      )}

      {/* Saved hint */}
      {saved.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <span className="font-medium">{saved.length}</span> saved{" "}
          {saved.length === 1 ? "meal" : "meals"}. They’ll stay saved on this device.
        </div>
      )}
    </section>
  );
};

export default TopMealsSection;
