const GOOGLE_REVIEW_HOSTS = [
  "google.com",
  "g.page",
  "maps.app.goo.gl",
  "goo.gl",
];

export function validateReviewUrl(value: string) {
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "https:") return "The review URL must start with https://";

    const allowed = GOOGLE_REVIEW_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    );

    if (!allowed) {
      return "Use a Google Review, Google Maps, g.page, or maps.app.goo.gl link.";
    }

    return null;
  } catch {
    return "Enter a valid Google Review URL.";
  }
}
