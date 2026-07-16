"use client";

import { useEffect, useState } from "react";

/**
 * Renders the current date. Computed after mount to avoid server/client
 * hydration mismatch on the timestamp.
 */
export function CurrentDate() {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <span suppressHydrationWarning className="tabular-nums">
      {date || " "}
    </span>
  );
}
