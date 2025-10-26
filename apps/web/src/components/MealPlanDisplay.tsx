import React from "react";

type Ingredient = { item: string; qty: string };
type Meal = {
  name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  time_min?: number;
  labels?: string[]; // e.g., ["Quick prep","High protein"]
  ingredients: Ingredient[];
  steps: string[];
  substitution?: string;
  prep_note?: string;
  tip?: string;
};

type Day = {
  day: number;
  meals: Meal[];
  daily_nutrition_summary?: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
  labels?: string[];
};

type GroceryCategory = { category: string; items: string[] };

type PlanData = {
  plan: Day[];
  totals?: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
  groceries?: GroceryCategory[];
  grocery_prices_style?: string; // "Budget Edition" | "Normal Edition" | "Gourmet Edition"
  grocery_prices?: string[];     // ["Rice 1kg = EUR 2.10", ...]
  estimated_total_grocery_cost?: string;
  meta?: { brand?: string; userEmail?: string; date?: string };
};

function MacroBars({ p, c, f }: { p: number; c: number; f: number }) {
  // width approximation based on grams; tweak as you like
  const sum = Math.max(p + c + f, 1);
  const wp = Math.round((p / sum) * 100);
  const wc = Math.round((c / sum) * 100);
  const wf = Math.max(0, 100 - wp - wc);
  return (
    <>
      <div className="macro-bars">
        <div className="macro"><span style={{ width: `${wp}%` }} /></div>
        <div className="macro"><span style={{ width: `${wc}%` }} /></div>
        <div className="macro"><span style={{ width: `${wf}%` }} /></div>
      </div>
      <div className="macro-labels">
        <span>Protein {p}g</span>
        <span>Carbs {c}g</span>
        <span>Fat {f}g</span>
      </div>
    </>
  );
}

export default function MealPlanPremium({ data, onClose }: { data: any, onClose?: () => void }) {
  // Handle both old PlanData format and new database format
  let planData: PlanData;
  let brand = "WellPlate";
  let userEmail = "user@example.com";
  let date = new Date().toLocaleDateString();

  if (data?.plan) {
    // Old format - direct PlanData
    planData = data;
    brand = data?.meta?.brand ?? "WellPlate";
    userEmail = data?.meta?.userEmail ?? "user@example.com";
    date = data?.meta?.date ?? new Date().toLocaleDateString();
  } else if (data?.jsonData) {
    // New format - database meal plan object
    try {
      planData = typeof data.jsonData === 'string' ? JSON.parse(data.jsonData) : data.jsonData;
      userEmail = data.userEmail || "user@example.com";
      date = new Date(data.createdAt).toLocaleDateString();
    } catch (error) {
      console.error('Failed to parse meal plan data:', error);
      // Fallback for incomplete data
      planData = {
        plan: [],
        totals: { kcal: data.calories || 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
        groceries: []
      };
    }
  } else {
    // Fallback for incomplete data
    planData = {
      plan: [],
      totals: { kcal: data?.calories || 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      groceries: []
    };
  }

  const CATEGORY_ICON: Record<string, string> = {
    Proteins: 'PR',
    Grains: 'GR',
    Vegetables: 'VE',
    Fruits: 'FR',
    'Dairy/Alternatives': 'DA',
    Pantry: 'PA',
    Spices: 'SP',
  };

  const getCategoryIcon = (category: string) => CATEGORY_ICON[category] ?? 'IN';

  return (
    <div className="print-root container">
      {/* Running header/footer for browser print */}
      <div className="print-header">{brand} | {userEmail} | {date}</div>
      <div className="print-footer">
        <span className="muted">{planData?.grocery_prices_style ?? "Normal Edition"}</span>
        <span className="page-count" />
      </div>

      {/* Close button for modal */}
      {onClose && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
          <button 
            onClick={onClose}
            style={{ 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '50%', 
              width: '30px', 
              height: '30px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Cover / Summary */}
      <div className="sheet soft no-break">
        <h1 className="section-title" style={{ border: "0", margin: 0 }}>
          {brand} | Personalized Meal Plan
        </h1>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>
          Generated for <strong>{userEmail}</strong> | {date}
        </div>
        {planData?.totals && (
          <table className="table" style={{ marginTop: 8 }}>
            <thead><tr><th>Total kcal</th><th>Protein (g)</th><th>Carbs (g)</th><th>Fat (g)</th></tr></thead>
            <tbody><tr>
              <td>{planData.totals.kcal}</td>
              <td>{planData.totals.protein_g}</td>
              <td>{planData.totals.carbs_g}</td>
              <td>{planData.totals.fat_g}</td>
            </tr></tbody>
          </table>
        )}
      </div>

      {/* Days */}
      {planData.plan?.map((d: any) => (
        <div key={d.day} className="day-card">
          <div className="day-head">
            <h2 className="day-title">Day {d.day}</h2>
            <div className="day-labels">
              {(d.labels ?? []).map((x: any, i: number) => <span key={i} className="chip">{x}</span>)}
            </div>
          </div>

          <div>
            {d.meals.map((m: any, i: number) => (
              <div key={i} className="meal-card">
                <div className="meal-head">
                  <h3 className="meal-title">{m.name}</h3>
                </div>

                <div className="macro-details">
                  <div className="macro-row">
                    <span className="macro-value">{m.kcal} kcal</span>
                    <span className="macro-value">{m.protein_g}g protein</span>
                    <span className="macro-value">{m.carbs_g}g carbs</span>
                    <span className="macro-value">{m.fat_g}g fat</span>
                  </div>
                  <div className="meta-inline">
                    {m.time_min ? <span>Prep {m.time_min} min</span> : null}
                    {(m.labels ?? []).map((x: any, j: number) => <span key={j}>{x}</span>)}
                  </div>
                </div>

                <MacroBars p={m.protein_g} c={m.carbs_g} f={m.fat_g} />

                <div className="block-title">Ingredients</div>
                <ul className="ing-list">
                  {m.ingredients.map((ing: any, k: number) => (
                    <li key={k}>{ing.item} - {ig(ing.qty)}</li>
                  ))}
                </ul>

                <div className="block-title">Instructions</div>
                <ol className="steps">
                  {m.steps.map((s: any, k: number) => (<li key={k}>{s}</li>))}
                </ol>

                <ul className="meta">
                  {m.substitution && <li><strong>Substitution:</strong> {m.substitution}</li>}
                  {m.prep_note && <li><strong>Prep note:</strong> {m.prep_note}</li>}
                  {m.tip && <li><strong>Tip:</strong> {m.tip}</li>}
                </ul>
              </div>
            ))}
          </div>

          {d.daily_nutrition_summary && (
            <div className="sheet">
              <div className="section-title">Daily Totals</div>
              <table className="table">
                <thead><tr><th>kcal</th><th>Protein (g)</th><th>Carbs (g)</th><th>Fat (g)</th></tr></thead>
                <tbody><tr>
                  <td>{d.daily_nutrition_summary.kcal}</td>
                  <td>{d.daily_nutrition_summary.protein_g}</td>
                  <td>{d.daily_nutrition_summary.carbs_g}</td>
                  <td>{d.daily_nutrition_summary.fat_g}</td>
                </tr></tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {/* Professional Grocery List */}
      <div className="sheet page-break">
        <div className="section-title">Shopping List</div>
        
        {/* Simplified Grocery Grid */}
        <div className="professional-grocery-grid">
          {planData?.groceries?.map((cat: any, i: number) => (
            <div key={i} className="grocery-category-card">
              <div className="grocery-category-header">
                <div className="category-icon">{getCategoryIcon(cat.category)}</div>
                <h3 className="category-title">{cat.category}</h3>
              </div>
              <div className="grocery-items-list">
                {cat.items.map((item: any, j: number) => (
                  <div key={j} className="grocery-item-professional">
                    <div className="checkbox-wrapper">
                      <input type="checkbox" className="grocery-checkbox" />
                      <span className="checkmark"></span>
                    </div>
                    <span className="item-name">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cost Summary */}
        {planData?.estimated_total_grocery_cost && (
          <div className="cost-summary">
            <div className="cost-summary-content">
              <div className="cost-icon">EUR</div>
              <div className="cost-details">
                <div className="cost-label">Estimated Total</div>
                <div className="cost-amount">{planData.estimated_total_grocery_cost}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// helper to normalize Qty text a little
function ig(qty?: string) {
  if (!qty) return "";
  return qty.replace(/\s+/g, " ").trim();
}
