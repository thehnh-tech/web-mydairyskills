"use client";
import { useEffect, useState } from "react";

// Browser online detector. Reads `navigator.onLine` and listens to
// online/offline events. Treat as a hint, not a guarantee — `navigator.onLine`
// only knows about the OS-level network state, not whether your server is
// reachable. Pair with `try/catch` around fetches.
export function useOnline(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "onLine" in navigator) {
      setOnline(navigator.onLine);
    }
    function up() { setOnline(true); }
    function down() { setOnline(false); }
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return online;
}
