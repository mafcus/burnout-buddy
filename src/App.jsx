import React, { useEffect, useMemo, useState } from "react";

export default function App() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [store, setStore] = useState(() => loadStore());

  const day = store[selectedDate] || defaultDay(selectedDate);
  const week = useMemo(() => makeWeek(selectedDate), [selectedDate]);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  function updateDay(partial) {
    setStore((prev) => ({ ...prev, [selectedDate]: { ...day, ...partial } }));
  }

  function toggleCheck(listName, idx) {
    const list = day[listName].slice();
    list[idx].done = !list[idx].done;
    updateDay({ [listName]: list });
  }

  function updateText(listName, idx, value) {
    const list = day[listName].slice();
    list[idx].text = value;
    updateDay({ [listName]: list });
  }

  function setDate(offset) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().slice(0, 10));
  }

  function jumpTo(dateStr) {
    setSelectedDate(dateStr);
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold">Burnout Buddy</h1>
          <div className="flex gap-2">
            <button className="btn" onClick={() => exportCSV(store)}>
              CSV
            </button>
            <button className="btn" onClick={() => exportJSON(store)}>
              JSON
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm("Erase ALL saved entries?")) {
                  setStore({});
                  localStorage.removeItem(LS_KEY);
                }
              }}
            >
              Clear
            </button>
          </div>
        </header>

        <nav className="mt-4 flex items-center gap-2">
          <button className="btn" onClick={() => setDate(-1)}>
            ← Prev
          </button>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => jumpTo(e.target.value)}
          />
          <button className="btn" onClick={() => setSelectedDate(todayISO)}>
            Today
          </button>
          <button className="btn" onClick={() => setDate(1)}>
            Next →
          </button>
        </nav>

        <section className="card mt-4">
          <h2 className="card-title">Daily Check-In</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mood (1–10)</label>
              <input
                type="range"
                min={1}
                max={10}
                value={day.mood}
                onChange={(e) => updateDay({ mood: Number(e.target.value) })}
                className="w-full"
              />
              <div className="text-sm mt-1">
                Current: <span className="font-semibold">{day.mood}</span>
              </div>
            </div>

            <div>
              <label className="label">Boundary kept today?</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={day.boundaryKept}
                  onChange={(e) => updateDay({ boundaryKept: e.target.checked })}
                />
                <input
                  type="text"
                  placeholder="e.g., No work email after 9pm"
                  className="input flex-1"
                  value={day.boundaryNote}
                  onChange={(e) =>
                    updateDay({ boundaryNote: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Top 3 Must-Dos</label>
              <ul className="space-y-2">
                {day.mustDos.map((t, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleCheck("mustDos", i)}
                    />
                    <input
                      className="input flex-1"
                      placeholder={`Must-do ${i + 1}`}
                      value={t.text}
                      onChange={(e) =>
                        updateText("mustDos", i, e.target.value)
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label className="label">1 Nice-to-Do</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.nice.done}
                  onChange={() =>
                    updateDay({ nice: { ...day.nice, done: !day.nice.done } })
                  }
                />
                <input
                  className="input flex-1"
                  placeholder="Stretch / walk / hobby…"
                  value={day.nice.text}
                  onChange={(e) =>
                    updateDay({ nice: { ...day.nice, text: e.target.value } })
                  }
                />
              </div>

              <label className="label mt-4">Evening Win</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="What went well today?"
                value={day.eveningWin}
                onChange={(e) => updateDay({ eveningWin: e.target.value })}
              />

              <div className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={day.kidTime}
                  onChange={(e) => updateDay({ kidTime: e.target.checked })}
                />
                <span className="text-sm">Kid-time / connection done</span>
              </div>
            </div>
          </div>

          <label className="label mt-4">Notes</label>
          <textarea
            className="textarea"
            rows={2}
            placeholder="Anything to remember for tomorrow?"
            value={day.notes}
            onChange={(e) => updateDay({ notes: e.target.value })}
          />
        </section>

        <section className="card mt-4">
          <h2 className="card-title">Week at a Glance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {week.map((d) => (
              <button
                key={d.date}
                className={`w-full text-left rounded-xl border p-3 transition hover:shadow ${
                  d.date === selectedDate
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-neutral-200 bg-white"
                }`}
                onClick={() => jumpTo(d.date)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {formatDisplayDate(d.date)}
                  </div>
                  <div className="text-xs opacity-70">
                    Mood: {store[d.date]?.mood ?? "–"}
                  </div>
                </div>
                <div className="mt-1 text-sm line-clamp-2">
                  {store[d.date]?.mustDos
                    ?.filter((x) => x.text)
                    .map((x) => (x.done ? `✓ ${x.text}` : x.text))
                    .join(" · ") || (
                    <span className="opacity-60">No tasks yet</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// helpers & storage
const LS_KEY = "burnout-buddy-v1";
function loadStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveStore(obj) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch {}
}
function defaultDay(date) {
  return {
    date,
    mood: 5,
    mustDos: [
      { text: "", done: false },
      { text: "", done: false },
      { text: "", done: false }
    ],
    nice: { text: "", done: false },
    eveningWin: "",
    kidTime: false,
    boundaryKept: false,
    boundaryNote: "",
    notes: ""
  };
}
function makeWeek(centerDate) {
  const base = new Date(centerDate);
  const start = new Date(base);
  start.setDate(base.getDate() - 3);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d.toISOString().slice(0, 10) };
  });
}
function formatDisplayDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}
function exportCSV(store) {
  const rows = [
    [
      "date",
      "mood",
      "must1",
      "must1_done",
      "must2",
      "must2_done",
      "must3",
      "must3_done",
      "nice",
      "nice_done",
      "evening_win",
      "kid_time",
      "boundary_kept",
      "notes"
    ]
  ];
  Object.keys(store)
    .sort()
    .forEach((d) => {
      const rec = store[d];
      if (!rec) return;
      rows.push([
        d,
        String(rec.mood ?? ""),
        rec.mustDos[0]?.text ?? "",
        rec.mustDos[0]?.done ? "1" : "0",
        rec.mustDos[1]?.text ?? "",
        rec.mustDos[1]?.done ? "1" : "0",
        rec.mustDos[2]?.text ?? "",
        rec.mustDos[2]?.done ? "1" : "0",
        rec.nice?.text ?? "",
        rec.nice?.done ? "1" : "0",
        rec.eveningWin ?? "",
        rec.kidTime ? "1" : "0",
        rec.boundaryKept ? "1" : "0",
        rec.notes ?? ""
      ]);
    });
  const csv = rows.map((r) => r.join(",")).join("\n");
  downloadFile(`burnout_buddy_${todayISO()}.csv`, csv, "text/csv");
}
function exportJSON(store) {
  downloadFile(
    `burnout_buddy_${todayISO()}.json`,
    JSON.stringify(store, null, 2),
    "application/json"
  );
}
function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
<div style={{position:"fixed", right:8, bottom:8, opacity:.6, fontSize:12}}>
  v4
</div>