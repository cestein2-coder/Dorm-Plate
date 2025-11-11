import React, { useMemo, useState } from 'react';
import { Search, Sparkles, Trash2, BarChart2, RefreshCw, AlertCircle } from 'lucide-react';

type Suggestion = {
  title: string;
  ingredients: string[];
  est_cost: number;
  description?: string;
};

const FALLBACK_RECIPES: Suggestion[] = [
  { title: 'Veggie Omelette', ingredients: ['eggs', 'milk', 'cheese', 'spinach'], est_cost: 3.5 },
  { title: 'Pasta Primavera', ingredients: ['pasta', 'tomato', 'zucchini', 'olive oil'], est_cost: 6.0 },
  { title: 'Fried Rice', ingredients: ['rice', 'egg', 'carrot', 'peas', 'soy sauce'], est_cost: 4.0 },
  { title: 'Grilled Cheese', ingredients: ['bread', 'cheese', 'butter'], est_cost: 2.5 },
  { title: 'Chicken Bowl', ingredients: ['chicken', 'rice', 'lettuce', 'sauce'], est_cost: 7.5 },
  { title: 'Salad Bowl', ingredients: ['lettuce', 'tomato', 'cucumber', 'olive oil'], est_cost: 5.0 },
];

const estimateSavingsFromWaste = (wasteItems: Record<string, number>) => {
  // crude estimate: each wasted "unit" costs $2 on average
  const unitCost = 2.0;
  let total = 0;
  for (const qty of Object.values(wasteItems)) {
    total += qty * unitCost;
  }
  return Math.max(0, total);
};

const FridgeWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [rawInput, setRawInput] = useState('');
  const [fridgeItems, setFridgeItems] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Suggestion[]>([]);
  const [wasteItems, setWasteItems] = useState<Record<string, number>>({});
  const [wasteLogs, setWasteLogs] = useState<Array<{ id: string; date: string; items: Record<string, number>; total: number }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addItemText, setAddItemText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const parsedItems = useMemo(() => {
    const tokens = rawInput
      .split(/[\n,;]+/)
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);
    return tokens;
  }, [rawInput, refreshKey]);

  const fetchAISuggestions = async (items: string[]) => {
    if (items.length === 0) return;

    setLoadingSuggestions(true);
    setSuggestionError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-meal-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: items,
          dietary_preferences: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setSuggestions(data.recipes);
      } else {
        setSuggestions(FALLBACK_RECIPES.filter(r =>
          r.ingredients.some(i => items.includes(i))
        ).slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestionError('Could not generate AI suggestions, showing similar recipes');
      setSuggestions(FALLBACK_RECIPES.filter(r =>
        r.ingredients.some(i => items.includes(i))
      ).slice(0, 5));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const onAddFridge = async () => {
    const items = parsedItems;
    if (items.length === 0) return;
    setFridgeItems(items);
    setStep(2);
    await fetchAISuggestions(items);
  };

  const toggleSuggestion = (s: Suggestion) => {
    const exists = selectedSuggestions.find(x => x.title === s.title);
    if (exists) {
      setSelectedSuggestions(selectedSuggestions.filter(x => x.title !== s.title));
    } else {
      setSelectedSuggestions([...selectedSuggestions, s]);
    }
  };

  const setWasteQty = (item: string, qty: number) => {
    setWasteItems(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[item];
      else next[item] = qty;
      return next;
    });
  };

  const onAddItemManually = () => {
    const item = addItemText.trim().toLowerCase();
    if (!item) return;
    if (!fridgeItems.includes(item)) setFridgeItems(prev => [...prev, item]);
    setAddItemText('');
  };

  const logWasteNow = () => {
    const total = estimateSavingsFromWaste(wasteItems);
    const entry = { id: String(Date.now()), date: new Date().toISOString(), items: { ...wasteItems }, total };
    setWasteLogs(prev => [entry, ...prev]);
    // clear current tracked quantities after logging
    setWasteItems({});
  };

  const reset = () => {
    setStep(1);
    setRawInput('');
    setFridgeItems([]);
    setSelectedSuggestions([]);
    setWasteItems({});
    setRefreshKey(k => k + 1);
  };

  const savings = useMemo(() => {
    const waste = estimateSavingsFromWaste(wasteItems);
    const mealSavings = selectedSuggestions.reduce((s, r) => s + (r.est_cost * 0.2), 0); // assume 20% saved by using leftovers
    return { waste, mealSavings, total: waste + mealSavings };
  }, [wasteItems, selectedSuggestions]);

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-food-brown">Smart Kitchen — Fridge → AI → Waste → Savings</h3>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-sm text-food-brown/60 hover:text-food-brown inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {step === 1 && (
        <div>
          <p className="text-food-brown mb-3">Tell us what's in your fridge (one per line or comma separated). Be honest — the AI will make meal suggestions and estimate waste avoidance.</p>
          <textarea
            value={rawInput}
            onChange={e => setRawInput(e.target.value)}
            placeholder={"e.g. eggs, milk, bread, spinach, tomato"}
            className="w-full border border-food-brown rounded p-3 h-28 focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-3">
            <button onClick={onAddFridge} className="bg-food-brown text-white px-4 py-2 rounded">Find Meals</button>
            <button onClick={() => { setRawInput('eggs, milk, bread, spinach, tomato'); }} className="text-food-brown underline">Try sample</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-3">
            <h4 className="font-semibold text-food-brown">Detected items</h4>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 flex flex-wrap gap-2">
                {fridgeItems.map(i => (
                  <span key={i} className="px-3 py-1 bg-food-cream text-food-brown rounded-full text-sm">{i}</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search produce..." className="px-2 py-1 border rounded" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input value={addItemText} onChange={e => setAddItemText(e.target.value)} placeholder="Add item (e.g. basil)" className="flex-1 px-3 py-2 border rounded" />
              <button onClick={onAddItemManually} className="bg-food-brown text-white px-3 py-2 rounded">Add</button>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold text-food-brown mb-2">AI Meal Suggestions <Sparkles className="inline-block ml-2" /></h4>

            {suggestionError && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">{suggestionError}</p>
              </div>
            )}

            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-food-brown border-t-food-orange"></div>
                <span className="ml-3 text-food-brown">Getting AI suggestions...</span>
              </div>
            ) : suggestions.filter(s => !searchTerm || s.ingredients.join(' ').includes(searchTerm.toLowerCase())).length === 0 ? (
              <p className="text-food-brown/70">No suggestions available — add more items.</p>
            ) : (
              <div className="grid gap-3">
                {suggestions.filter(s => !searchTerm || s.ingredients.join(' ').includes(searchTerm.toLowerCase())).map(s => (
                  <div key={s.title} className="p-3 border rounded flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-food-brown">{s.title}</div>
                      <div className="text-sm text-food-brown/70">{s.ingredients.join(', ')}</div>
                      {s.description && <div className="text-xs text-food-brown/60 mt-1">{s.description}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm text-food-brown/70">Est ${s.est_cost.toFixed(2)}</div>
                      <button onClick={() => toggleSuggestion(s)} className={`px-3 py-1 rounded text-sm ${selectedSuggestions.find(x=>x.title===s.title)? 'bg-food-brown text-white' : 'border text-food-brown'}`}>
                        {selectedSuggestions.find(x=>x.title===s.title) ? 'Selected' : 'Use'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setStep(1)} className="text-food-brown underline">Back</button>
            <button onClick={() => setStep(3)} className="bg-food-brown text-white px-4 py-2 rounded">Track Waste</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h4 className="font-semibold text-food-brown mb-2">Waste Tracking <Trash2 className="inline-block ml-2" /></h4>
          <p className="text-food-brown/70 mb-3">Mark items you think you would normally throw away and estimate units (e.g., 1 loaf, 2 eggs).</p>
          <div className="grid gap-2 mb-4">
            {fridgeItems.map(item => (
              <div key={item} className="flex items-center justify-between p-2 border rounded">
                <div className="capitalize text-food-brown">{item}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    defaultValue={wasteItems[item] ?? 0}
                    onChange={e => setWasteQty(item, Number(e.target.value))}
                    className="w-20 p-1 border rounded"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <button onClick={() => setStep(2)} className="text-food-brown underline mr-3">Back</button>
              <button onClick={() => setStep(4)} className="bg-food-brown text-white px-4 py-2 rounded">View Savings</button>
            </div>
            <div>
              <button onClick={logWasteNow} className="bg-food-orange text-white px-4 py-2 rounded">Log Waste</button>
            </div>
          </div>
          {wasteLogs.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold text-food-brown mb-2">Waste Log</h5>
              <ul className="space-y-2">
                {wasteLogs.map(log => (
                  <li key={log.id} className="p-2 border rounded bg-food-cream">
                    <div className="text-sm text-food-brown/70">{new Date(log.date).toLocaleString()}</div>
                    <div className="text-food-brown">Total estimated cost: ${log.total.toFixed(2)}</div>
                    <div className="text-sm text-food-brown/70 mt-1">{Object.entries(log.items).map(([k,v]) => `${k}: ${v}`).join(' — ')}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h4 className="font-semibold text-food-brown mb-2">Savings Dashboard <BarChart2 className="inline-block ml-2" /></h4>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-food-cream rounded text-center">
              <div className="text-sm text-food-brown/70">Estimated Waste Cost</div>
              <div className="text-2xl font-bold text-food-brown">${savings.waste.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-food-cream rounded text-center">
              <div className="text-sm text-food-brown/70">Meal Savings (reuse leftovers)</div>
              <div className="text-2xl font-bold text-food-brown">${savings.mealSavings.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-food-cream rounded text-center">
              <div className="text-sm text-food-brown/70">Total Estimated Savings</div>
              <div className="text-2xl font-bold text-food-green">${savings.total.toFixed(2)}</div>
            </div>
          </div>

          {wasteLogs.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-food-brown">Savings History</h5>
              <ul className="divide-y mt-2">
                {wasteLogs.map(log => (
                  <li key={log.id} className="py-2 flex justify-between">
                    <div className="text-food-brown/70">{new Date(log.date).toLocaleDateString()} — {Object.entries(log.items).slice(0,3).map(([k,v]) => `${k}(${v})`).join(', ')}</div>
                    <div className="font-semibold text-food-brown">${log.total.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-4">
            <h5 className="font-semibold text-food-brown">Actionable Tips</h5>
            <ul className="list-disc pl-5 mt-2 text-food-brown/80">
              <li>Schedule the selected recipes in the next 3 days to use leftovers.</li>
              <li>Store leafy greens with paper towels to extend freshness.</li>
              <li>Freeze bread if you won't finish within 2 days.</li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-food-brown/70">Based on your input — this is a lightweight estimate for planning only.</div>
            <div>
              <button onClick={() => { setStep(2); }} className="text-food-brown underline mr-3">Adjust Meals</button>
              <button onClick={reset} className="bg-food-brown text-white px-4 py-2 rounded">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FridgeWizard;
