/**
 * Custom hook to fetch and cache user credits.
 * Only updates state if the value changes.
 * Adds the API Key from localStorage as Authorization header.
 * @returns { [number | null, () => void] } [credits, refreshCredits]
 */
import { useState, useEffect, useRef, useCallback } from "react";

export function useUserCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const lastCredits = useRef<number | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      const apiKey = localStorage.getItem("nvmApiKey");
      const resp = await fetch("/api/credit", {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      });
      if (!resp.ok) throw new Error("Unauthorized or error fetching credits");
      const data = await resp.json();
      if (
        typeof data.credit === "number" &&
        data.credit !== lastCredits.current
      ) {
        setCredits(data.credit);
        lastCredits.current = data.credit;
      }
    } catch (e) {
      setCredits(null);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
    // Optionally, set up polling or event-based updates here
  }, [fetchCredits]);

  return [credits, fetchCredits] as const;
}
