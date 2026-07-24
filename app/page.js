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

const adminNames = new Set([
  "андрей петров",
  "юля коновальцева",
  "полина организатор"
]);

const normalizeName = (value) =>
  value.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");

const cropPoint = ([x, y]) => [((x - 40) / 770) * 100, ((y - 50) / 900) * 100];
const leftOuterRaw = [
  [148, 276], [127, 323], [126, 383], [143, 430], [176, 476], [176, 520],
  [148, 575], [128, 622], [127, 677], [145, 725], [174, 773], [180, 819]
];
const leftInnerRaw = [
  [264, 335], [278, 383], [290, 431], [301, 477], [302, 529], [287, 579],
  [262, 624], [258, 675], [278, 723], [301, 767], [302, 817], [292, 868]
];
const mirrorRaw = (points) => points.map(([x, y]) => [850 - x, y]);
const seatLayout = [
  ...leftOuterRaw,
  ...leftInnerRaw,
  ...mirrorRaw(leftOuterRaw),
  ...mirrorRaw(leftInnerRaw)
].map((point, index) => {
  const [x, y] = cropPoint(point);
  return { id: `seat-${index + 1}`, number: index + 1, x, y, angle: 0 };
});

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
  const [session, setSession] = useState(null);
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("andrey-yulia-seating");
      if (saved) setAssignments(JSON.parse(saved));
      const savedSession = localStorage.getItem("andrey-yulia-session");
      if (savedSession) setSession(JSON.parse(savedSession));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("andrey-yulia-seating", JSON.stringify(assignments));
  }, [assignments, ready]);

  const seatedIds = useMemo(() => new Set(Object.values(assignments)), [assignments]);
  const selected = guests.find((guest) => guest.id === selectedGuest);
  const isAdmin = session?.role === "admin";
  const viewerGuest = useMemo(() => {
    if (!session || session.role !== "guest") return null;
    const normalized = normalizeName(session.name);
    const firstName = normalized.split(" ")[0];
    return guests.find((guest) => {
      const candidate = normalizeName(guest.name);
      return candidate === normalized || candidate === firstName;
    }) || null;
  }, [session]);
  const viewerSeatId = viewerGuest
    ? Object.keys(assignments).find((seatId) => assignments[seatId] === viewerGuest.id)
    : null;

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

  function logIn(event) {
    event.preventDefault();
    const normalized = normalizeName(loginName);
    if (normalized.split(" ").length < 2) {
      setLoginError("Введите имя и фамилию");
      return;
    }
    const nextSession = {
      name: loginName.trim().replace(/\s+/g, " "),
      role: adminNames.has(normalized) ? "admin" : "guest"
    };
    localStorage.setItem("andrey-yulia-session", JSON.stringify(nextSession));
    setSession(nextSession);
    setLoginError("");
  }

  function logOut() {
    localStorage.removeItem("andrey-yulia-session");
    setSession(null);
    setLoginName("");
    setSelectedGuest(null);
    setSidebarOpen(false);
  }

  const seatedCount = seatedIds.size;

  if (!ready) return <main className="auth-page" />;

  if (!session) {
    return (
      <main className="auth-page">
        <BotanicalMark />
        <BotanicalMark />
        <section className="auth-card">
          <span className="auth-monogram">А <i>&amp;</i> Ю</span>
          <span className="eyebrow">Свадебный ужин</span>
          <h1>Добро пожаловать</h1>
          <p>Введите имя и фамилию, чтобы увидеть своё место за столом.</p>
          <form onSubmit={logIn}>
            <label htmlFor="guest-login">Имя и фамилия</label>
            <input
              id="guest-login"
              autoFocus
              autoComplete="name"
              value={loginName}
              onChange={(event) => {
                setLoginName(event.target.value);
                setLoginError("");
              }}
              placeholder="Например, Андрей Петров"
            />
            {loginError && <span className="auth-error">{loginError}</span>}
            <button type="submit">Найти моё место</button>
          </form>
          <small>Андрей &amp; Юля · с любовью к каждому гостю</small>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${isAdmin ? "admin-mode" : "guest-mode"}`}>
      {isAdmin && <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
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
      </aside>}

      {isAdmin && sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Закрыть список" />}

      <section className="canvas">
        <BotanicalMark />
        <BotanicalMark />
        <header className="topbar">
          {isAdmin ? <button className="mobile-guests" onClick={() => setSidebarOpen(true)}>
            <span>☰</span> Гости
          </button> : <span className="guest-greeting">Здравствуйте, {session.name.split(" ")[0]}</span>}
          <div className="title-block">
            <span className="eyebrow">План свадебного ужина</span>
            <h2>Наша рассадка</h2>
          </div>
          <div className="top-actions">
            {isAdmin && <button className="reset-button" onClick={reset}>Очистить</button>}
            <button className="logout-button" onClick={logOut}>Выйти</button>
          </div>
        </header>

        <div className="instruction">
          {!isAdmin ? (
            <>
              <span className={`seat-icon ${viewerSeatId ? "found" : ""}`}>{viewerSeatId ? "✓" : "!"}</span>
              <span>
                <small>{viewerSeatId ? "Ваше место найдено" : "Место пока не назначено"}</small>
                <strong>{viewerSeatId ? `Стул № ${seatLayout.find((seat) => seat.id === viewerSeatId)?.number}` : "Обратитесь к организатору"}</strong>
              </span>
            </>
          ) : selected ? (
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

        <div className="serpentine-plan">
          <div className="reference-layer" aria-label="Схема столов по референсу">
            <img src="/reference.jpg" alt="" />
          </div>

          {seatLayout.map((seat) => {
            const guest = guests.find((item) => item.id === assignments[seat.id]);
            return (
              <button
                key={seat.id}
                className={`plan-seat ${guest ? "occupied" : ""} ${selectedGuest && isAdmin ? "available" : ""} ${viewerSeatId === seat.id ? "my-seat" : ""}`}
                style={{ left: `${seat.x}%`, top: `${seat.y}%`, "--seat-angle": `${seat.angle}deg` }}
                onClick={() => isAdmin && placeGuest(seat.id)}
                title={guest ? `${guest.name} — двойной клик, чтобы снять с места` : `Место ${seat.number}`}
                onDoubleClick={(event) => isAdmin && guest && unseat(seat.id, event)}
              >
                <span className="place-number">{seat.number}</span>
                {isAdmin && guest && (
                  <span className="plan-seat-name">
                    <i className={guest.group}>{guest.group === "andrey" ? "А" : "Ю"}</i>
                    <b>{guest.name}</b>
                    <em onClick={(event) => unseat(seat.id, event)}>×</em>
                  </span>
                )}
              </button>
            );
          })}

          <div className="plan-caption">
            <span>48 мест</span>
            <i />
            <span>{seatedCount} занято</span>
          </div>
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
