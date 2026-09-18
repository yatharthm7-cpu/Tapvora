import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsLinks?: { writeAReviewUri?: string };
};

type GeneratorResult = {
  placeId: string;
  name: string;
  address: string;
  reviewUrl: string;
};

const GOOGLE_HOSTS = ["google.com", "share.google", "g.page", "maps.app.goo.gl", "goo.gl"];

function isGoogleHost(hostname: string) {
  return GOOGLE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

function directReviewUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !isGoogleHost(url.hostname)) return null;

    const isWriteReview =
      url.pathname.includes("/local/writereview") ||
      url.pathname.endsWith("/review") ||
      url.href.includes("!12e1");

    return isWriteReview ? url.toString() : null;
  } catch {
    return null;
  }
}

function extractPlaceId(url: URL) {
  const fromQuery =
    url.searchParams.get("query_place_id") ||
    url.searchParams.get("place_id") ||
    url.searchParams.get("placeid");

  if (fromQuery) return fromQuery;

  const decoded = decodeURIComponent(url.toString());
  return decoded.match(/(?:query_place_id|place_id|placeid)=([A-Za-z0-9_-]+)/)?.[1] || null;
}

function extractSearchText(url: URL) {
  const query = url.searchParams.get("query");
  if (query) return query;

  const placePath = decodeURIComponent(url.pathname).match(/\/maps\/place\/([^/]+)/i)?.[1];
  return placePath?.replace(/\+/g, " ") || null;
}

async function followGoogleRedirects(startUrl: URL) {
  let current = startUrl;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      headers: { "User-Agent": "Tapvora review link generator" },
    });

    const location = response.headers.get("location");
    if (!location || response.status < 300 || response.status >= 400) {
      if (current.hostname.endsWith("google.com") && current.pathname === "/share.google") {
        const html = await response.text();
        const sharedSearch = html.match(/\/search\?q=([^&"\\]+)/)?.[1];
        if (sharedSearch) {
          return new URL(`https://www.google.com/maps/search/?api=1&query=${sharedSearch}`);
        }
      } else {
        await response.body?.cancel();
      }
      return current;
    }

    await response.body?.cancel();

    const next = new URL(location, current);
    if (next.protocol !== "https:" || !isGoogleHost(next.hostname)) {
      throw new Error("The Maps link redirected outside Google.");
    }
    current = next;
  }

  return current;
}

function normalizePlace(place: GooglePlace): GeneratorResult | null {
  if (!place.id) return null;

  return {
    placeId: place.id,
    name: place.displayName?.text || "Google business",
    address: place.formattedAddress || "Address unavailable",
    reviewUrl:
      place.googleMapsLinks?.writeAReviewUri ||
      `https://search.google.com/local/writereview?placeid=${encodeURIComponent(place.id)}`,
  };
}

async function getPlaceById(placeId: string, apiKey: string) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    cache: "no-store",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,googleMapsLinks.writeAReviewUri",
    },
  });

  if (!response.ok) throw new Error(`Google Places returned ${response.status}.`);
  return normalizePlace((await response.json()) as GooglePlace);
}

async function searchPlaces(textQuery: string, apiKey: string) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsLinks.writeAReviewUri",
    },
    body: JSON.stringify({ textQuery, pageSize: 5 }),
  });

  if (!response.ok) throw new Error(`Google Places returned ${response.status}.`);
  const payload = (await response.json()) as { places?: GooglePlace[] };
  return (payload.places || []).map(normalizePlace).filter((place): place is GeneratorResult => Boolean(place));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return errorResponse("Sign in to use the generator.", 401);

  const { data: admin } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (!admin) return errorResponse("Administrator access is required.", 403);

  const body = (await request.json().catch(() => null)) as { query?: unknown } | null;
  const rawQuery = typeof body?.query === "string" ? body.query.trim() : "";
  if (rawQuery.length < 2 || rawQuery.length > 300) {
    return errorResponse("Enter a business name, address, or Google Maps link.", 400);
  }

  const existingReviewUrl = directReviewUrl(rawQuery);
  if (existingReviewUrl) {
    return Response.json({
      results: [{ placeId: "direct-link", name: "Pasted Google Review link", address: "Ready to use", reviewUrl: existingReviewUrl }],
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!apiKey) return errorResponse("Add GOOGLE_MAPS_API_KEY in Vercel to enable business search.", 503);

  try {
    let textQuery = rawQuery;
    let placeId: string | null = null;

    try {
      const parsed = new URL(rawQuery);
      if (parsed.protocol !== "https:" || !isGoogleHost(parsed.hostname)) {
        return errorResponse("Paste a Google Maps link or enter the business name and location.", 400);
      }

      const resolved = await followGoogleRedirects(parsed);
      placeId = extractPlaceId(resolved);
      textQuery = extractSearchText(resolved) || "";
    } catch (error) {
      if (rawQuery.startsWith("http://") || rawQuery.startsWith("https://")) throw error;
    }

    if (placeId) {
      const place = await getPlaceById(placeId, apiKey);
      return Response.json({ results: place ? [place] : [] });
    }

    if (!textQuery) {
      return errorResponse("That Maps link does not contain enough business information. Search using the business name and city instead.", 400);
    }

    return Response.json({ results: await searchPlaces(textQuery, apiKey) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google Places search failed.";
    return errorResponse(message, 502);
  }
}
