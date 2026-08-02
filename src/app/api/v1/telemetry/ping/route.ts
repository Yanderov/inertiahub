import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TELEMETRY_FILE = path.join(DATA_DIR, "telemetry.json");

interface TelemetryData {
  uniqueUsers: Record<string, { firstSeen: string; lastSeen: string; executions: number; game: string }>;
  totalInjections: number;
  byGame: Record<string, number>;
  byExecutor: Record<string, number>;
  lastUpdated: string;
}

function ensureDataFile(): TelemetryData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(TELEMETRY_FILE)) {
    const initial: TelemetryData = {
      uniqueUsers: {},
      totalInjections: 0,
      byGame: { MM2: 0, Pressure: 0, Demonology: 0, Loader: 0 },
      byExecutor: { Potassium: 0, Volt: 0, Velocity: 0, Other: 0 },
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    const raw = fs.readFileSync(TELEMETRY_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      uniqueUsers: {},
      totalInjections: 0,
      byGame: { MM2: 0, Pressure: 0, Demonology: 0, Loader: 0 },
      byExecutor: { Potassium: 0, Volt: 0, Velocity: 0, Other: 0 },
      lastUpdated: new Date().toISOString(),
    };
  }
}

function saveTelemetry(data: TelemetryData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TELEMETRY_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to write telemetry data:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, game = "Universal", executor = "Unknown" } = body;

    // Validate Roblox User ID (must be non-empty or numeric string)
    const validUserId = String(userId || "").trim();
    if (!validUserId || validUserId === "0" || validUserId === "nil") {
      return NextResponse.json({ error: "Invalid Roblox User ID" }, { status: 400 });
    }

    const data = ensureDataFile();
    const now = new Date().toISOString();

    // 1. Deduplicate by Roblox Account User ID
    if (!data.uniqueUsers[validUserId]) {
      data.uniqueUsers[validUserId] = {
        firstSeen: now,
        lastSeen: now,
        executions: 1,
        game,
      };
    } else {
      data.uniqueUsers[validUserId].lastSeen = now;
      data.uniqueUsers[validUserId].executions += 1;
      data.uniqueUsers[validUserId].game = game;
    }

    // 2. Increment global injection count
    data.totalInjections += 1;

    // 3. Increment game category count
    const gameKey = ["MM2", "Pressure", "Demonology", "Loader"].find(
      (g) => g.toLowerCase() === String(game).toLowerCase()
    ) || "Universal";
    data.byGame[gameKey] = (data.byGame[gameKey] || 0) + 1;

    // 4. Increment executor category
    const execKey = ["Potassium", "Volt", "Velocity"].find(
      (e) => e.toLowerCase() === String(executor).toLowerCase()
    ) || "Other";
    data.byExecutor[execKey] = (data.byExecutor[execKey] || 0) + 1;

    data.lastUpdated = now;
    saveTelemetry(data);

    const uniqueCount = Object.keys(data.uniqueUsers).length;

    return NextResponse.json({
      success: true,
      stats: {
        uniqueUsers: uniqueCount,
        totalInjections: data.totalInjections,
        isNewUser: data.uniqueUsers[validUserId].executions === 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to record telemetry", details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = ensureDataFile();
    const uniqueCount = Object.keys(data.uniqueUsers).length;

    // Calculate active users in last 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const activeLast24h = Object.values(data.uniqueUsers).filter(
      (u) => new Date(u.lastSeen).getTime() > oneDayAgo
    ).length;

    return NextResponse.json({
      uniqueUsers: uniqueCount,
      totalInjections: data.totalInjections,
      activeLast24h,
      updatesCount: 14,
      byGame: data.byGame,
      byExecutor: data.byExecutor,
      lastUpdated: data.lastUpdated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to read telemetry", details: error.message }, { status: 500 });
  }
}
