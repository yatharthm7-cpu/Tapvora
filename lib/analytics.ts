import { isSupabaseConfigured } from "./config";
import { createClient } from "./supabase/server";

export type DailyOpen = {
  date: string;
  label: string;
  count: number;
};

export type DashboardAnalytics = {
  today: number;
  lastSevenDays: number;
  daily: DailyOpen[];
  eventTrackingReady: boolean;
};

function localDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    return {
      date: localDateKey(date),
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }).format(date),
      count: 0,
    };
  });

  if (!isSupabaseConfigured()) {
    return { today: 0, lastSevenDays: 0, daily: days, eventTrackingReady: false };
  }

  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 7);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("redirect_events")
    .select("opened_at")
    .gte("opened_at", start.toISOString())
    .order("opened_at", { ascending: true });

  if (error) {
    return { today: 0, lastSevenDays: 0, daily: days, eventTrackingReady: false };
  }

  const counts = new Map(days.map((day) => [day.date, 0]));
  for (const event of data || []) {
    const key = localDateKey(new Date(event.opened_at));
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }

  const daily = days.map((day) => ({ ...day, count: counts.get(day.date) || 0 }));
  return {
    today: daily.at(-1)?.count || 0,
    lastSevenDays: daily.reduce((sum, day) => sum + day.count, 0),
    daily,
    eventTrackingReady: true,
  };
}
