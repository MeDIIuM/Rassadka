import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataDirectory = path.join(process.cwd(), "data");
const statePath = path.join(dataDirectory, "seating-state.json");
let writeQueue = Promise.resolve();

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate"
};

function json(body, status = 200) {
  return Response.json(body, { status, headers: noStoreHeaders });
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(body) {
  if (
    !isRecord(body) ||
    !isRecord(body.assignments) ||
    !isRecord(body.profiles) ||
    typeof body.dataVersion !== "string"
  ) {
    return null;
  }

  const serialized = JSON.stringify({
    assignments: body.assignments,
    profiles: body.profiles
  });
  if (serialized.length > 2_000_000) return null;

  return {
    dataVersion: body.dataVersion,
    assignments: body.assignments,
    profiles: body.profiles
  };
}

async function readState() {
  try {
    const raw = await fs.readFile(statePath, "utf8");
    const state = JSON.parse(raw);
    if (
      !isRecord(state) ||
      state.schemaVersion !== 1 ||
      !Number.isInteger(state.revision) ||
      !isRecord(state.assignments) ||
      !isRecord(state.profiles)
    ) {
      throw new Error("Invalid shared seating state");
    }
    return state;
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function enqueueWrite(task) {
  const result = writeQueue.then(task, task);
  writeQueue = result.catch(() => {});
  return result;
}

export async function GET() {
  try {
    const state = await readState();
    return json(state ? { initialized: true, ...state } : { initialized: false });
  } catch (error) {
    console.error("Unable to read shared seating state", error);
    return json({ error: "Не удалось прочитать общую рассадку" }, 500);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Некорректный JSON" }, 400);
  }

  const payload = validatePayload(body);
  if (!payload || !["initialize", "replace"].includes(body.mode)) {
    return json({ error: "Некорректные данные рассадки" }, 400);
  }

  return enqueueWrite(async () => {
    try {
      await fs.mkdir(dataDirectory, { recursive: true });

      if (body.mode === "initialize") {
        if (!Object.keys(payload.assignments).length) {
          return json({ error: "Пустая рассадка не может инициализировать сервер" }, 400);
        }

        const now = new Date().toISOString();
        const initialState = {
          schemaVersion: 1,
          dataVersion: payload.dataVersion,
          revision: 1,
          initializedAt: now,
          updatedAt: now,
          assignments: payload.assignments,
          profiles: payload.profiles
        };

        try {
          await fs.writeFile(statePath, `${JSON.stringify(initialState, null, 2)}\n`, {
            encoding: "utf8",
            flag: "wx"
          });
          return json({ initialized: true, ...initialState });
        } catch (error) {
          if (error?.code !== "EEXIST") throw error;
          const current = await readState();
          return json({ initialized: true, ...current, conflict: true }, 409);
        }
      }

      const current = await readState();
      if (!current) {
        return json({ initialized: false, conflict: true }, 409);
      }
      if (body.expectedRevision !== current.revision) {
        return json({ initialized: true, ...current, conflict: true }, 409);
      }

      const nextState = {
        ...current,
        dataVersion: payload.dataVersion,
        revision: current.revision + 1,
        updatedAt: new Date().toISOString(),
        assignments: payload.assignments,
        profiles: payload.profiles
      };
      await fs.writeFile(statePath, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
      return json({ initialized: true, ...nextState });
    } catch (error) {
      console.error("Unable to save shared seating state", error);
      return json({ error: "Не удалось сохранить общую рассадку" }, 500);
    }
  });
}
