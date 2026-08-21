"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Stop the browser from remembering scroll position on refresh
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Scroll to top on every navigation
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}