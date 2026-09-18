"use client";

import { Check, LoaderCircle, MapPin, Search } from "lucide-react";
import { useState } from "react";

type PlaceResult = {
  placeId: string;
  name: string;
  address: string;
  reviewUrl: string;
};

function setInputValue(id: string, value: string) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;

  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export function GoogleReviewLinkGenerator({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("");

  async function generate() {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setError("Enter the business name and city, or paste its Google Maps link.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setSelected("");

    try {
      const response = await fetch("/api/google-review-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: normalized }),
      });
      const payload = (await response.json()) as { results?: PlaceResult[]; error?: string };
      if (!response.ok) throw new Error(payload.error || "Unable to generate the review link.");

      const places = payload.results || [];
      setResults(places);
      if (!places.length) setError("No matching Google business was found. Add the city or a more specific address.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate the review link.");
    } finally {
      setLoading(false);
    }
  }

  function selectPlace(place: PlaceResult) {
    setInputValue("destination_url", place.reviewUrl);
    const businessInput = document.getElementById("business_name") as HTMLInputElement | null;
    if (businessInput && !businessInput.value.trim() && place.placeId !== "direct-link") {
      setInputValue("business_name", place.name);
    }
    setSelected(place.placeId);
  }

  return (
    <div className="review-generator">
      <div className="review-generator-head">
        <div>
          <strong>Google Review Link Generator</strong>
          <span>Search by business name and city, or paste a Google Maps link.</span>
        </div>
      </div>
      <div className="review-generator-controls">
        <input
          className="input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void generate();
            }
          }}
          placeholder="Example: Bhavnagari Gathiya Rath, Ahmedabad"
          aria-label="Business name, address, or Google Maps link"
        />
        <button className="button button-dark" type="button" onClick={() => void generate()} disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={16} /> : <Search size={16} />}
          {loading ? "Searching" : "Generate link"}
        </button>
      </div>
      {error ? <div className="review-generator-error" role="alert">{error}</div> : null}
      {results.length ? (
        <div className="review-results" aria-live="polite">
          {results.map((place) => (
            <div className="review-result" key={`${place.placeId}-${place.reviewUrl}`}>
              <MapPin size={18} />
              <div><strong>{place.name}</strong><span>{place.address}</span></div>
              <button className="button button-soft button-small" type="button" onClick={() => selectPlace(place)}>
                {selected === place.placeId ? <><Check size={15} /> Added</> : "Use this link"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
