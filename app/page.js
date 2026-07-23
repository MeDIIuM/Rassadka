"use client";

import { useEffect, useMemo, useState } from "react";

const guestGroups = [
  {
    id: "andrey",
    title: "Гости Андрея",
    short: "А",
    guests: [
      "Мама", "Папа", "Борис", "Маша", "Тая", "Шем", "Юля Шема", "Никита",
      "Игорь", "Настя", "Бульбес", "Ангелина", "Даня", "Лера", "Серёжа",
      "Лена", "Макс", "Аня", "Андрей", "Таня", "Коля", "Лена", "Таня",
      "Слава", "Настя", "Петя", "Ольга", "Алексей", "Ирина", "Саша"
    ]
  },
  {
    id: "yulia",
    title: "Гости Юли",
    short: "Ю",
    guests: [
      "Мама", "Папа", "Бабушка Валя", "Бабушка Наташа", "Никита", "Тётя Оля",
      "Дядя Миша", "Тётя Юля", "Юля", "Саша", "Ира", "Таня", "Андрей",
      "Женя", "Марина"
    ]
  }
];

const guests = guestGroups.flatMap((group) =>
  group.guests.map((name, index) => ({
    id: `${group.id}-${index + 1}`,
    name,
    group: group.id,
    number: index + 1
  }))
);

const tables = Array.from({ length: 6 }, (_, index) => ({
  id: `table-${index + 1}`,
  number: index + 1,
  seats: Array.from({ length: 8 }, (__, seatIndex) => `${index + 1}-${seatIndex + 1}`)
}));

const positions = [
  [50, -6], [91, 14], [104, 50], [91, 86],
  [50, 106], [9, 86], [-4, 50], [9, 14]
];

function BotanicalMark() {
  return (
    <svg className="botanical" viewBox="0 0 180 190" aria-hidden="true">
      <path d="M157 177C111 145 83 104 69 44M70 45C54 71 33 86 12 91M88 88c20-20 39-30 61-31M109 124c20-12 38-14 58-9M53 109c-18 5-31 14-41 30" />
      <path d="M70 47c-11-17-8-31 2-43 9 17 8 31-2 43ZM48 69C26 67 16 56 12 42c20 2 32 10 36 27ZM91 85c4-20 15-30 31-34-2 19-12 30-31 34ZM112 122c10-18 24-24 40-22-8 17-21 24-40 22ZM51 108c-20-6-33-1-42 11 18 8 32 4 42-11Z" />
    </svg>
  );
}

export default function Home() {
  const [assignments, setAssignments] = useState({});
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("andrey-yulia-seating");
      if (saved) setAssignments(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("andrey-yulia-seating", JSON.stringify(assignments));
  }, [assignments, ready]);

  const seatedIds = useMemo(() => new Set(Object.values(assignments)), [assignments]);
  const selected = guests.find((guest) => guest.id === selectedGuest);

  const filteredGroups = guestGroups.map((group) => ({
    ...group,
    items: guests.filter((guest) => {
      const matchesGroup = guest.group === group.id;
      const matchesQuery = guest.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "free" && !seatedIds.has(guest.id)) ||
        (filter === "seated" && seatedIds.has(guest.id));
      return matchesGroup && matchesQuery && matchesFilter;
    })
  }));

  function chooseGuest(id) {
    setSelectedGuest(id);
    setSidebarOpen(false);
    setNotice("");
  }

  function placeGuest(seatId) {
    if (!selectedGuest) {
      const current = assignments[seatId];
      if (current) {
        setSelectedGuest(current);
        setNotice("Гость выбран. Нажмите на другое место, чтобы пересадить.");
      }
      return;
    }

    setAssignments((current) => {
      const next = { ...current };
      const oldSeat = Object.keys(next).find((key) => next[key] === selectedGuest);
      const displaced = next[seatId];
      if (oldSeat) delete next[oldSeat];
      next[seatId] = selectedGuest;
      if (displaced && displaced !== selectedGuest && oldSeat) next[oldSeat] = displaced;
      return next;
    });
    setNotice(`${selected?.name || "Гость"} — место назначено`);
    setSelectedGuest(null);
  }

  function unseat(seatId, event) {
    event.stopPropagation();
    const id = assignments[seatId];
    setAssignments((current) => {
      const next = { ...current };
      delete next[seatId];
      return next;
    });
    setSelectedGuest(id);
    setNotice("Гость снят с места и выбран для новой посадки.");
  }

  function reset() {
    if (Object.keys(assignments).length && window.confirm("Очистить всю рассадку?")) {
      setAssignments({});
      setSelectedGuest(null);
      setNotice("Все места освобождены.");
    }
  }

  const seatedCount = seatedIds.size;

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)} aria-label="Закрыть">×</button>
          <span className="eyebrow">Андрей &amp; Юля</span>
          <h1>Список гостей</h1>
          <p>Выберите гостя, затем нажмите на свободный стул.</p>
        </div>

        <div className="search-wrap">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти гостя" />
        </div>

        <div className="filters" aria-label="Фильтр гостей">
          {[["all", "Все"], ["free", "Не рассажены"], ["seated", "Рассажены"]].map(([id, label]) => (
            <button key={id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>

        <div className="guest-list">
          {filteredGroups.map((group) => (
            <section key={group.id} className="guest-group">
              <div className="group-title">
                <span>{group.title}</span>
                <small>{group.items.length}</small>
              </div>
              {group.items.map((guest) => {
                const isSeated = seatedIds.has(guest.id);
                return (
                  <button
                    key={guest.id}
                    className={`guest-card ${selectedGuest === guest.id ? "selected" : ""} ${isSeated ? "seated" : ""}`}
                    onClick={() => chooseGuest(guest.id)}
                  >
                    <span className={`guest-avatar ${guest.group}`}>{group.short}</span>
                    <span className="guest-info">
                      <strong>{guest.name}</strong>
                      <small>{isSeated ? "Место назначено" : `${group.title} · ${guest.number}`}</small>
                    </span>
                    <span className="guest-status">{isSeated ? "✓" : "+"}</span>
                  </button>
                );
              })}
              {!group.items.length && <p className="empty-group">Нет гостей</p>}
            </section>
          ))}
        </div>

        <div className="sidebar-footer">
          <div><strong>{seatedCount}</strong><span>из {guests.length} рассажено</span></div>
          <div className="progress"><i style={{ width: `${(seatedCount / guests.length) * 100}%` }} /></div>
        </div>
      </aside>

      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Закрыть список" />}

      <section className="canvas">
        <BotanicalMark />
        <BotanicalMark />
        <header className="topbar">
          <button className="mobile-guests" onClick={() => setSidebarOpen(true)}>
            <span>☰</span> Гости
          </button>
          <div className="title-block">
            <span className="eyebrow">План свадебного ужина</span>
            <h2>Наша рассадка</h2>
          </div>
          <button className="reset-button" onClick={reset}>Очистить</button>
        </header>

        <div className="instruction">
          {selected ? (
            <>
              <span className={`mini-avatar ${selected.group}`}>{selected.group === "andrey" ? "А" : "Ю"}</span>
              <span><small>Выбран гость</small><strong>{selected.name}</strong></span>
              <button onClick={() => setSelectedGuest(null)}>Отмена</button>
            </>
          ) : (
            <>
              <span className="seat-icon">⌄</span>
              <span><small>Как рассаживать</small><strong>Выберите гостя слева и нажмите на стул</strong></span>
            </>
          )}
        </div>

        <div className="tables-grid">
          {tables.map((table) => {
            const tableCount = table.seats.filter((seat) => assignments[seat]).length;
            return (
              <div className="table-zone" key={table.id}>
                <div className="table">
                  <div className="table-label">
                    <span>Стол</span>
                    <strong>{table.number}</strong>
                    <small>{tableCount} / 8</small>
                  </div>
                  {table.seats.map((seatId, index) => {
                    const guest = guests.find((item) => item.id === assignments[seatId]);
                    return (
                      <button
                        key={seatId}
                        className={`seat seat-${index} ${guest ? "occupied" : ""} ${selectedGuest ? "available" : ""}`}
                        style={{ left: `${positions[index][0]}%`, top: `${positions[index][1]}%` }}
                        onClick={() => placeGuest(seatId)}
                        title={guest ? `${guest.name} — двойной клик, чтобы снять с места` : "Свободное место"}
                        onDoubleClick={(event) => guest && unseat(seatId, event)}
                      >
                        <span className="chair" />
                        {guest ? (
                          <span className="seat-name">
                            <i className={guest.group}>{guest.group === "andrey" ? "А" : "Ю"}</i>
                            <b>{guest.name}</b>
                            <em onClick={(event) => unseat(seatId, event)}>×</em>
                          </span>
                        ) : (
                          <span className="seat-empty">+</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="canvas-footer">
          <span>А</span><p>Андрей</p><i />
          <span>Ю</span><p>Юля</p>
          <small>Все изменения сохраняются автоматически</small>
        </footer>

        {notice && <div className="toast" onAnimationEnd={() => setNotice("")}>{notice}</div>}
      </section>
    </main>
  );
}
