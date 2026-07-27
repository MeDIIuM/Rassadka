"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GUEST_DATA_VERSION = "filled-docx-44-v1";

const guestGroups = [
  {
    id: "guests",
    title: "Гости",
    short: "Г",
    guests: [
      { firstName: "Оксана", lastName: "Коновальцева", status: "Мама невесты", alcohol: "wine" },
      { firstName: "Алексей", lastName: "Коновальцев", status: "Отец невесты" },
      { firstName: "Александр", lastName: "Петров", status: "Отец жениха" },
      { firstName: "Марина", lastName: "Гаврилова", status: "Мама жениха" },
      { firstName: "Борис", lastName: "Петров", status: "Брат жениха" },
      { firstName: "Мария", lastName: "Петрова", status: "Невестка (жена брата жениха)" },
      { firstName: "Таисия", lastName: "Петрова", status: "Племянница" },
      { firstName: "Ольга", lastName: "Семидотченко", status: "Тётя невесты" },
      { firstName: "Никита", lastName: "Семидотченко", status: "Двоюродный брат невесты" },
      { firstName: "Наталья", lastName: "Семидотченко", status: "Бабушка невесты" },
      { firstName: "Никита", lastName: "Орехов", status: "Друг молодожёнов" },
      { firstName: "Владислав", lastName: "Шеметов", status: "Друг молодожёнов" },
      { firstName: "Игорь", lastName: "Бутков", status: "Друг молодожёнов" },
      { firstName: "Даниил", lastName: "Попсуйко", status: "Друг молодожёнов" },
      { firstName: "Максим", lastName: "Волосков", status: "Друг молодожёнов" },
      { firstName: "Владислав", lastName: "Катаев", status: "Друг молодожёнов" },
      { firstName: "Сергей", lastName: "Мякишев", status: "Друг молодожёнов" },
      { firstName: "Никита", lastName: "Болбатун", status: "Друг молодожёнов" },
      { firstName: "Андрей", lastName: "Зимин", status: "Друг молодожёнов" },
      { firstName: "Евгений", lastName: "Азовцев", status: "Троюродный брат невесты" },
      { firstName: "Марина", lastName: "Азовцева", status: "Жена троюродного брата невесты" },
      { firstName: "Ольга", lastName: "Русакова", status: "Мама жены брата жениха" },
      { firstName: "Алексей", lastName: "Русаков", status: "Папа жены брата жениха" },
      { firstName: "Татьяна", lastName: "Зимина", status: "Подруга молодожёнов" },
      { firstName: "Александр", lastName: "Гладков", status: "Друг молодожёнов" },
      { firstName: "Юлия", lastName: "Гладкова", status: "Подруга молодожёнов" },
      { firstName: "Ирина", lastName: "Щеглова", status: "Подруга молодожёнов" },
      { firstName: "Ирина", lastName: "Яковлева", status: "Тётя жениха" },
      { firstName: "Татьяна", lastName: "Букина", status: "Двоюродная тётя жениха" },
      { firstName: "Вячеслав", lastName: "Букин", status: "Двоюродный дядя жениха" },
      { firstName: "Николай", lastName: "Букин", status: "Троюродный брат жениха" },
      { firstName: "Елена", lastName: "Букина", status: "Жена троюродного брата жениха" },
      { firstName: "Анастасия", lastName: "Выходцева", status: "Троюродная сестра жениха" },
      { firstName: "Пётр", lastName: "Выходцев", status: "Муж троюродной сестры жениха" },
      { firstName: "Андрей", lastName: "Лямин", status: "Друг молодожёнов" },
      { firstName: "Татьяна", lastName: "Лямина", status: "Подруга молодожёнов" },
      { firstName: "Валерия", lastName: "Мясникова", status: "Подруга молодожёнов" },
      { firstName: "Елена", lastName: "Мякишева", status: "Подруга молодожёнов" },
      { firstName: "Анна", lastName: "Кондрашева", status: "Подруга молодожёнов" },
      { firstName: "Анастасия", lastName: "Бердникова", status: "Подруга молодожёнов" },
      { firstName: "Полина", lastName: "Белявская", status: "Подруга молодожёнов" },
      { firstName: "Юлия", lastName: "Демина", status: "Подруга молодожёнов" }
    ]
  }
];

const guests = guestGroups.flatMap((group) =>
  group.guests.map((person, index) => ({
    id: `${group.id}-${index + 1}`,
    name: [person.firstName, person.lastName].filter(Boolean).join(" "),
    firstName: person.firstName,
    lastName: person.lastName || "",
    status: person.status || "",
    alcohol: person.alcohol || "unknown",
    information: person.information || "",
    group: group.id,
    number: index + 1
  }))
);

const coupleGuests = [
  {
    id: "couple-yulia",
    name: "Юля Коновальцева",
    firstName: "Юля",
    lastName: "Коновальцева",
    status: "Невеста",
    group: "yulia",
    number: 0,
    isCouple: true
  },
  {
    id: "couple-andrey",
    name: "Андрей Петров",
    firstName: "Андрей",
    lastName: "Петров",
    status: "Жених",
    group: "andrey",
    number: 0,
    isCouple: true
  }
];
const profilePeople = [...guests, ...coupleGuests];
const groupShortById = {
  ...Object.fromEntries(guestGroups.map((group) => [group.id, group.short])),
  andrey: "А",
  yulia: "Ю"
};

const adminNames = new Set([
  "андрей петров",
  "юля коновальцева",
  "полина организатор"
]);

const normalizeName = (value) =>
  value.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");

const getPersonInitials = (guest, profile) => {
  const firstName = (profile?.firstName || guest?.firstName || "").trim();
  const lastName = (profile?.lastName || guest?.lastName || "").trim();
  return `${Array.from(firstName)[0] || ""}${Array.from(lastName)[0] || ""}`.toUpperCase();
};

const createDefaultProfile = (guest) => ({
  firstName: guest.firstName || guest.name,
  lastName: guest.lastName || "",
  status: guest.status || "",
  alcohol: guest.alcohol || "unknown",
  information: guest.information || ""
});

const defaultProfiles = Object.fromEntries(
  profilePeople.map((guest) => [guest.id, createDefaultProfile(guest)])
);

const mergeStoredProfiles = (storedProfiles) =>
  Object.fromEntries(
    profilePeople.map((guest) => [
      guest.id,
      {
        ...createDefaultProfile(guest),
        ...(storedProfiles?.[guest.id] || {})
      }
    ])
  );

const serializeSharedState = (assignments, profiles) =>
  JSON.stringify({ assignments, profiles });

const alcoholLabels = {
  unknown: "Не указано",
  none: "Не пьёт",
  wine: "Вино / шампанское",
  strong: "Крепкий алкоголь",
  all: "Всё"
};

const cropPoint = ([x, y]) => [((x - 40) / 770) * 100, ((y - 50) / 900) * 100];
const leftOuterRaw = [
  [148, 276], [127, 323], [126, 383], [143, 430], [176, 476], [176, 520],
  [148, 575], [128, 622], [127, 677], [145, 725], [174, 773], [180, 819]
];
const leftInnerRaw = [
  [282, 430], [297, 480], [302, 530], [296, 580], [278, 630], [260, 680],
  [260, 730], [279, 780], [300, 830], [302, 880], [292, 930]
];
const mirrorRaw = (points) => points.map(([x, y]) => [850 - x, y]);
const rightOuterRaw = mirrorRaw([
  [148, 295], [127, 350], [126, 405], [143, 460], [176, 515], [176, 570],
  [148, 625], [128, 680], [127, 735], [145, 790], [174, 845], [180, 900]
]);
const seatPointOverrides = {
  "seat-24": [160, 865]
};
const seatLayout = [
  ...leftOuterRaw.map((point, index) => ({
    point,
    id: `seat-${index + 1}`,
    number: index + 3
  })),
  ...leftInnerRaw.map((point, index) => ({
    point,
    id: `seat-${index + 14}`,
    number: 25 - index
  })),
  ...rightOuterRaw.map((point, index) => ({
    point,
    id: `seat-${index + 25}`,
    number: index + 26
  })),
  ...mirrorRaw(leftInnerRaw).map((point, index) => ({
    point,
    id: `seat-${index + 38}`,
    number: 48 - index
  }))
].map(({ point, id, number }) => {
  const [x, y] = cropPoint(seatPointOverrides[id] || point);
  return { id, number, x, y, angle: 0 };
});

function migrateHiddenAssignments(value) {
  const next = { ...(value || {}) };
  const visibleSeatIds = new Set(seatLayout.map((seat) => seat.id));
  const occupiedVisibleSeats = new Set(
    Object.keys(next).filter((seatId) => visibleSeatIds.has(seatId))
  );
  for (const hiddenSeatId of ["seat-13", "seat-37"]) {
    const guestId = next[hiddenSeatId];
    if (!guestId) continue;
    delete next[hiddenSeatId];
    const freeSeat = seatLayout.find((seat) => !occupiedVisibleSeats.has(seat.id));
    if (freeSeat) {
      next[freeSeat.id] = guestId;
      occupiedVisibleSeats.add(freeSeat.id);
    }
  }
  return next;
}

function normalizeAssignments(value) {
  const migrated = migrateHiddenAssignments(value);
  const validSeatIds = new Set(seatLayout.map((seat) => seat.id));
  const validGuestIds = new Set(guests.map((guest) => guest.id));
  const usedGuests = new Set();
  return Object.fromEntries(
    Object.entries(migrated).filter(([seatId, guestId]) => {
      if (
        !validSeatIds.has(seatId) ||
        !validGuestIds.has(guestId) ||
        usedGuests.has(guestId)
      ) {
        return false;
      }
      usedGuests.add(guestId);
      return true;
    })
  );
}

function BotanicalMark() {
  return (
    <svg className="botanical" viewBox="0 0 180 190" aria-hidden="true">
      <path d="M157 177C111 145 83 104 69 44M70 45C54 71 33 86 12 91M88 88c20-20 39-30 61-31M109 124c20-12 38-14 58-9M53 109c-18 5-31 14-41 30" />
      <path d="M70 47c-11-17-8-31 2-43 9 17 8 31-2 43ZM48 69C26 67 16 56 12 42c20 2 32 10 36 27ZM91 85c4-20 15-30 31-34-2 19-12 30-31 34ZM112 122c10-18 24-24 40-22-8 17-21 24-40 22ZM51 108c-20-6-33-1-42 11 18 8 32 4 42-11Z" />
    </svg>
  );
}

function GuestProfileCard({
  guest,
  draft,
  setDraft,
  isAdmin,
  seatNumber,
  seatLabel,
  onClose,
  onSave,
  onMove,
  onUnseat
}) {
  if (!guest || !draft) return null;
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  return (
    <div className="profile-card">
      <div className="profile-card-head">
        <button className="profile-back" onClick={onClose} aria-label="Вернуться к списку">←</button>
        <span className="eyebrow">Карточка гостя</span>
        <div className={`profile-avatar ${guest.group}`}>{groupShortById[guest.group] || "Г"}</div>
        <h2>{[draft.lastName, draft.firstName].filter(Boolean).join(" ") || guest.name}</h2>
        <p>{seatLabel || (seatNumber ? `Место № ${seatNumber}` : "Место пока не назначено")}</p>
      </div>

      <div className="profile-fields">
        <div className="profile-name-row">
          <label>
            <span>Фамилия</span>
            <input
              value={draft.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              placeholder="Не указана"
              disabled={!isAdmin}
            />
          </label>
          <label>
            <span>Имя</span>
            <input
              value={draft.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              placeholder="Имя"
              disabled={!isAdmin}
            />
          </label>
        </div>

        <label>
          <span>Статус</span>
          <input
            value={draft.status}
            onChange={(event) => update("status", event.target.value)}
            placeholder="Например, друг жениха"
            disabled={!isAdmin}
          />
        </label>

        <label>
          <span>Алкоголь</span>
          {isAdmin ? (
            <select value={draft.alcohol} onChange={(event) => update("alcohol", event.target.value)}>
              {Object.entries(alcoholLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          ) : (
            <div className="profile-readonly">{alcoholLabels[draft.alcohol] || alcoholLabels.none}</div>
          )}
        </label>

        <label className="profile-information">
          <span>Информация</span>
          <textarea
            value={draft.information}
            onChange={(event) => update("information", event.target.value)}
            placeholder={isAdmin ? "Предпочтения, важные детали, заметки…" : "Расскажите о важных пожеланиях или предпочтениях…"}
            rows={6}
            disabled={!isAdmin}
          />
          {!isAdmin && <small>Карточка доступна только для просмотра.</small>}
        </label>
      </div>

      <div className="profile-actions">
        {isAdmin
          ? <button className="profile-save" onClick={onSave}>Сохранить</button>
          : <button className="profile-close" onClick={onClose}>Закрыть</button>}
        {isAdmin && seatNumber && (
          <>
            <button className="profile-move" onClick={onMove}>Пересадить гостя</button>
            <button className="profile-unseat" onClick={onUnseat}>Освободить место</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [assignments, setAssignments] = useState({});
  const [profiles, setProfiles] = useState(defaultProfiles);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [draggingGuestId, setDraggingGuestId] = useState(null);
  const [dragOverSeatId, setDragOverSeatId] = useState(null);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [session, setSession] = useState(null);
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState("");
  const sharedInitializedRef = useRef(false);
  const sharedRevisionRef = useRef(null);
  const sharedWritableRef = useRef(false);
  const lastSyncedRef = useRef("");
  const currentSharedStateRef = useRef({
    assignments: {},
    profiles: defaultProfiles
  });
  const syncQueueRef = useRef(Promise.resolve());

  function applySharedState(sharedState) {
    const nextAssignments = normalizeAssignments(sharedState.assignments || {});
    const nextProfiles = mergeStoredProfiles(sharedState.profiles || {});
    const nextSnapshot = serializeSharedState(nextAssignments, nextProfiles);

    sharedInitializedRef.current = Boolean(sharedState.initialized);
    sharedRevisionRef.current = sharedState.revision || null;
    sharedWritableRef.current = true;
    lastSyncedRef.current = nextSnapshot;
    currentSharedStateRef.current = {
      assignments: nextAssignments,
      profiles: nextProfiles
    };
    setAssignments(nextAssignments);
    setProfiles(nextProfiles);
  }

  useEffect(() => {
    async function boot() {
      let localAssignments = {};
      let localProfiles = defaultProfiles;

      try {
        const savedSession = localStorage.getItem("andrey-yulia-session");
        if (savedSession) setSession(JSON.parse(savedSession));

        const savedVersion = localStorage.getItem("andrey-yulia-data-version");
        const savedAssignments = localStorage.getItem("andrey-yulia-seating");
        const savedProfiles = localStorage.getItem("andrey-yulia-profiles");

        if (
          (savedAssignments || savedProfiles) &&
          !localStorage.getItem("andrey-yulia-legacy-backup-v1")
        ) {
          localStorage.setItem(
            "andrey-yulia-legacy-backup-v1",
            JSON.stringify({
              savedAt: new Date().toISOString(),
              dataVersion: savedVersion,
              assignments: savedAssignments,
              profiles: savedProfiles
            })
          );
        }

        if (savedVersion === GUEST_DATA_VERSION) {
          if (savedAssignments) {
            localAssignments = normalizeAssignments(JSON.parse(savedAssignments));
          }
          if (savedProfiles) {
            localProfiles = mergeStoredProfiles(JSON.parse(savedProfiles));
          }
        }
      } catch {}

      const localSnapshot = serializeSharedState(localAssignments, localProfiles);
      currentSharedStateRef.current = {
        assignments: localAssignments,
        profiles: localProfiles
      };
      lastSyncedRef.current = localSnapshot;

      try {
        const response = await fetch("/api/seating", { cache: "no-store" });
        if (!response.ok) throw new Error("Shared seating is unavailable");
        const sharedState = await response.json();
        sharedWritableRef.current = true;

        if (sharedState.initialized) {
          applySharedState(sharedState);
        } else if (Object.keys(localAssignments).length) {
          const initializeResponse = await fetch("/api/seating", {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: "initialize",
              dataVersion: GUEST_DATA_VERSION,
              assignments: localAssignments,
              profiles: localProfiles
            })
          });
          const initializedState = await initializeResponse.json();
          if (!initializeResponse.ok && initializeResponse.status !== 409) {
            throw new Error("Unable to initialize shared seating");
          }
          if (initializedState.initialized) applySharedState(initializedState);
        } else {
          sharedInitializedRef.current = false;
          sharedRevisionRef.current = null;
          setAssignments(localAssignments);
          setProfiles(localProfiles);
        }
      } catch {
        sharedWritableRef.current = false;
        setAssignments(localAssignments);
        setProfiles(localProfiles);
      }

      try {
        localStorage.setItem("andrey-yulia-data-version", GUEST_DATA_VERSION);
      } catch {}
      setReady(true);
    }

    boot();
  }, []);

  useEffect(() => {
    if (!ready) return;

    currentSharedStateRef.current = { assignments, profiles };
    const currentSnapshot = serializeSharedState(assignments, profiles);
    try {
      localStorage.setItem("andrey-yulia-seating", JSON.stringify(assignments));
      localStorage.setItem("andrey-yulia-profiles", JSON.stringify(profiles));
      localStorage.setItem("andrey-yulia-data-version", GUEST_DATA_VERSION);
    } catch {}

    if (
      session?.role !== "admin" ||
      !sharedWritableRef.current ||
      currentSnapshot === lastSyncedRef.current ||
      (!sharedInitializedRef.current && !Object.keys(assignments).length)
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      syncQueueRef.current = syncQueueRef.current
        .then(async () => {
          const latest = currentSharedStateRef.current;
          const latestSnapshot = serializeSharedState(
            latest.assignments,
            latest.profiles
          );
          if (latestSnapshot === lastSyncedRef.current) return;

          const mode = sharedInitializedRef.current ? "replace" : "initialize";
          const response = await fetch("/api/seating", {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode,
              expectedRevision: sharedRevisionRef.current,
              dataVersion: GUEST_DATA_VERSION,
              assignments: latest.assignments,
              profiles: latest.profiles
            })
          });
          const sharedState = await response.json();

          if (response.ok) {
            sharedInitializedRef.current = true;
            sharedRevisionRef.current = sharedState.revision;
            sharedWritableRef.current = true;
            lastSyncedRef.current = latestSnapshot;
            return;
          }

          if (response.status === 409 && sharedState.initialized) {
            applySharedState(sharedState);
            setNotice("Рассадка обновлена с другого устройства.");
            return;
          }
          throw new Error("Unable to synchronize seating");
        })
        .catch(() => {
          sharedWritableRef.current = false;
          setNotice("Нет связи с общим хранилищем. Локальная копия сохранена.");
        });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [assignments, profiles, ready, session?.role]);

  useEffect(() => {
    if (!ready) return;
    let stopped = false;
    let inFlight = false;

    async function refreshSharedState() {
      if (stopped || inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const response = await fetch("/api/seating", { cache: "no-store" });
        if (!response.ok) throw new Error("Shared seating is unavailable");
        const sharedState = await response.json();
        sharedWritableRef.current = true;

        if (!sharedState.initialized) {
          sharedInitializedRef.current = false;
          if (
            session?.role === "admin" &&
            Object.keys(currentSharedStateRef.current.assignments).length
          ) {
            lastSyncedRef.current = "";
            setAssignments((current) => ({ ...current }));
          }
          return;
        }

        if (sharedState.revision === sharedRevisionRef.current) return;
        const hasPendingAdminChanges =
          session?.role === "admin" &&
          serializeSharedState(
            currentSharedStateRef.current.assignments,
            currentSharedStateRef.current.profiles
          ) !== lastSyncedRef.current;
        if (!hasPendingAdminChanges) applySharedState(sharedState);
      } catch {
        sharedWritableRef.current = false;
      } finally {
        inFlight = false;
      }
    }

    const interval = window.setInterval(refreshSharedState, 2500);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshSharedState();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    refreshSharedState();

    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [ready, session?.role]);

  const seatedIds = useMemo(() => new Set(Object.values(assignments)), [assignments]);
  const activeProfileGuest = profilePeople.find((guest) => guest.id === activeProfileId);
  const isAdmin = session?.role === "admin";
  const viewerGuest = useMemo(() => {
    if (!session || session.role !== "guest") return null;
    const normalized = normalizeName(session.name);
    const firstName = normalized.split(" ")[0];
    const exactProfileMatch = guests.find((guest) => {
      const profile = profiles[guest.id] || createDefaultProfile(guest);
      const profileName = normalizeName(profile.firstName);
      const firstLast = normalizeName(`${profile.firstName} ${profile.lastName}`);
      const lastFirst = normalizeName(`${profile.lastName} ${profile.firstName}`);
      const sourceName = normalizeName(guest.name);
      return (
        profileName === normalized ||
        sourceName === normalized ||
        (profile.lastName && (firstLast === normalized || lastFirst === normalized))
      );
    });
    if (exactProfileMatch) return exactProfileMatch;
    return guests.find((guest) => {
      const candidate = normalizeName(profiles[guest.id]?.firstName || guest.name);
      return !candidate.includes(" ") && candidate === firstName;
    }) || null;
  }, [session, profiles]);
  const viewerSeatId = viewerGuest
    ? Object.keys(assignments).find((seatId) => assignments[seatId] === viewerGuest.id)
    : null;

  const filteredGroups = guestGroups.map((group) => ({
    ...group,
    items: guests.filter((guest) => {
      const matchesGroup = guest.group === group.id;
      const profile = profiles[guest.id] || createDefaultProfile(guest);
      const matchesQuery = `${profile.lastName} ${profile.firstName}`.toLowerCase().includes(query.toLowerCase());
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

  function openProfile(id) {
    const guest = profilePeople.find((item) => item.id === id);
    if (!guest) return;
    setActiveProfileId(id);
    setProfileDraft({ ...(profiles[id] || createDefaultProfile(guest)) });
    setSidebarOpen(true);
    setNotice("");
  }

  function closeProfile() {
    setActiveProfileId(null);
    setProfileDraft(null);
    if (!isAdmin) setSidebarOpen(false);
  }

  function saveProfile() {
    if (!activeProfileId || !profileDraft) return;
    setProfiles((current) => {
      const previous = current[activeProfileId] || createDefaultProfile(activeProfileGuest);
      return {
        ...current,
        [activeProfileId]: isAdmin
          ? { ...previous, ...profileDraft }
          : { ...previous, information: profileDraft.information }
      };
    });
    setNotice("Карточка гостя сохранена");
  }

  function assignGuestToSeat(guestId, seatId) {
    if (!guestId || !seatId) return;
    setAssignments((current) => {
      const next = { ...current };
      const oldSeat = Object.keys(next).find((key) => next[key] === guestId);
      const displaced = next[seatId];
      if (oldSeat) delete next[oldSeat];
      next[seatId] = guestId;
      if (displaced && displaced !== guestId && oldSeat) next[oldSeat] = displaced;
      return next;
    });
    const movedGuest = guests.find((guest) => guest.id === guestId);
    setNotice(`${profiles[guestId]?.firstName || movedGuest?.name || "Гость"} — место назначено`);
    setSelectedGuest(null);
    setDraggingGuestId(null);
    setDragOverSeatId(null);
  }

  function placeGuest(seatId) {
    if (!selectedGuest) {
      const current = assignments[seatId];
      if (current) openProfile(current);
      return;
    }
    assignGuestToSeat(selectedGuest, seatId);
  }

  function startGuestDrag(event, guestId) {
    if (!isAdmin) return;
    setDraggingGuestId(guestId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", guestId);
  }

  function dropGuestOnSeat(event, seatId) {
    if (!isAdmin) return;
    event.preventDefault();
    const guestId = event.dataTransfer.getData("text/plain") || draggingGuestId;
    assignGuestToSeat(guestId, seatId);
  }

  function unseat(seatId) {
    setAssignments((current) => {
      const next = { ...current };
      delete next[seatId];
      return next;
    });
    setSelectedGuest(null);
    setNotice("Место освобождено.");
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
    setActiveProfileId(null);
    setProfileDraft(null);
    setSidebarOpen(false);
  }

  const seatedCount = seatedIds.size;
  const activeProfileSeatId = activeProfileId
    ? Object.keys(assignments).find((seatId) => assignments[seatId] === activeProfileId)
    : null;
  const activeProfileSeatNumber = activeProfileSeatId
    ? seatLayout.find((seat) => seat.id === activeProfileSeatId)?.number
    : null;
  const activeProfileSeatLabel = activeProfileId === "couple-andrey"
    ? "Место №1 · Стол молодожёнов"
    : activeProfileId === "couple-yulia"
      ? "Место №2 · Стол молодожёнов"
      : null;
  const showAvailableSeats = isAdmin && Boolean(selectedGuest || draggingGuestId);

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
      {isAdmin && <aside className={`sidebar ${activeProfileGuest ? "profile-sidebar" : ""} ${sidebarOpen ? "open" : ""}`}>
        {activeProfileGuest ? (
          <GuestProfileCard
            guest={activeProfileGuest}
            draft={profileDraft}
            setDraft={setProfileDraft}
            isAdmin
            seatNumber={activeProfileSeatNumber}
            seatLabel={activeProfileSeatLabel}
            onClose={closeProfile}
            onSave={saveProfile}
            onMove={() => {
              setSelectedGuest(activeProfileGuest.id);
              closeProfile();
              setNotice("Гость выбран. Нажмите на новое кресло.");
              setSidebarOpen(false);
            }}
            onUnseat={() => {
              if (activeProfileSeatId) unseat(activeProfileSeatId);
              closeProfile();
              setSidebarOpen(false);
            }}
          />
        ) : (
        <>
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
                    className={`guest-card ${selectedGuest === guest.id ? "selected" : ""} ${isSeated ? "seated" : ""} ${draggingGuestId === guest.id ? "dragging" : ""}`}
                    onClick={() => chooseGuest(guest.id)}
                    draggable
                    onDragStart={(event) => startGuestDrag(event, guest.id)}
                    onDragEnd={() => {
                      setDraggingGuestId(null);
                      setDragOverSeatId(null);
                    }}
                  >
                    <span className={`guest-avatar ${guest.group}`}>{group.short}</span>
                    <span className="guest-info">
                      <strong>{[profiles[guest.id]?.lastName, profiles[guest.id]?.firstName || guest.name].filter(Boolean).join(" ")}</strong>
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
        </>
        )}
      </aside>}

      {!isAdmin && activeProfileGuest && (
        <aside className="sidebar profile-sidebar open">
          <GuestProfileCard
            guest={activeProfileGuest}
            draft={profileDraft}
            setDraft={setProfileDraft}
            isAdmin={false}
            seatNumber={activeProfileSeatNumber}
            seatLabel={activeProfileSeatLabel}
            onClose={closeProfile}
            onSave={saveProfile}
          />
        </aside>
      )}

      {((isAdmin && sidebarOpen) || (!isAdmin && activeProfileGuest)) && (
        <button
          className="scrim"
          onClick={() => {
            if (activeProfileGuest) closeProfile();
            else setSidebarOpen(false);
          }}
          aria-label="Закрыть панель"
        />
      )}

      <section className="canvas">
        <BotanicalMark />
        <BotanicalMark />
        <header className="topbar">
          {isAdmin ? <button className="mobile-guests" onClick={() => setSidebarOpen(true)}>
            <span>☰</span> Гости
          </button> : (
            <div className="guest-user-actions">
              <span className="guest-greeting">Здравствуйте, {session.name.split(" ")[0]}</span>
              {viewerGuest && <button onClick={() => openProfile(viewerGuest.id)}>Моя карточка</button>}
            </div>
          )}
          <div className="title-block">
            <span className="eyebrow">План свадебного ужина</span>
            <h2>Наша рассадка</h2>
          </div>
          <div className="top-actions">
            {isAdmin && <button className="reset-button" onClick={reset}>Очистить</button>}
            <button className="logout-button" onClick={logOut}>Выйти</button>
          </div>
        </header>

        <div className="serpentine-plan">
          <div className="reference-layer" aria-label="Схема столов по референсу">
            <img src="/reference-tables.png" alt="" />
          </div>

          <div className="couple-seats" aria-label="Места молодожёнов">
            <button
              type="button"
              className="couple-seat couple-seat-yulia"
              title="Место №2 — Юля"
              onClick={() => openProfile("couple-yulia")}
            >
              {getPersonInitials(coupleGuests[0], profiles["couple-yulia"])}
            </button>
            <button
              type="button"
              className="couple-seat couple-seat-andrey"
              title="Место №1 — Андрей"
              onClick={() => openProfile("couple-andrey")}
            >
              {getPersonInitials(coupleGuests[1], profiles["couple-andrey"])}
            </button>
          </div>
          <span className="couple-table-label">Молодожёны</span>

          {seatLayout.map((seat) => {
            const guest = guests.find((item) => item.id === assignments[seat.id]);
            const guestProfile = guest
              ? profiles[guest.id] || createDefaultProfile(guest)
              : null;
            const guestName = guest
              ? [guestProfile.lastName, guestProfile.firstName].filter(Boolean).join(" ")
              : "";
            return (
              <button
                key={seat.id}
                className={`plan-seat ${guest ? "occupied" : ""} ${showAvailableSeats && !guest ? "available" : ""} ${!guest && !showAvailableSeats ? "hidden-empty" : ""} ${viewerSeatId === seat.id ? "my-seat" : ""} ${dragOverSeatId === seat.id ? "drop-target" : ""} ${draggingGuestId === guest?.id ? "dragging" : ""}`}
                style={{ left: `${seat.x}%`, top: `${seat.y}%`, "--seat-angle": `${seat.angle}deg` }}
                aria-hidden={!guest && !showAvailableSeats}
                tabIndex={!guest && !showAvailableSeats ? -1 : 0}
                onClick={() => {
                  if (isAdmin) placeGuest(seat.id);
                  else if (guest) openProfile(guest.id);
                }}
                draggable={isAdmin && Boolean(guest)}
                onDragStart={(event) => guest && startGuestDrag(event, guest.id)}
                onDragEnd={() => {
                  setDraggingGuestId(null);
                  setDragOverSeatId(null);
                }}
                onDragOver={(event) => {
                  if (!isAdmin) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragOverSeatId(seat.id);
                }}
                onDragLeave={() => {
                  if (dragOverSeatId === seat.id) setDragOverSeatId(null);
                }}
                onDrop={(event) => dropGuestOnSeat(event, seat.id)}
                aria-label={guest
                  ? `Место №${seat.number}, ${guestName}`
                  : `Свободное место №${seat.number}`}
                title={guest
                  ? `Место №${seat.number} — ${guestName}`
                  : `Свободное место №${seat.number}`}
              >
                {guest && (
                  <span className="seat-initials">
                    {getPersonInitials(guest, guestProfile)}
                  </span>
                )}
              </button>
            );
          })}

          <div className="plan-caption">
            <span>{seatedCount + 2} человек рассажено</span>
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
