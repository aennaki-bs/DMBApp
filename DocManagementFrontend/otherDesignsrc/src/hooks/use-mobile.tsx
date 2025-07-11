import { useEffect, useState, useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

// Function to check if we're in mobile mode
const checkIsMobile = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.innerWidth < MOBILE_BREAKPOINT;
  } catch {
    return false;
  }
};

export function useIsMobile(): boolean {
  // Use a safer initialization approach
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Only check on client side
    if (typeof window === "undefined") return false;
    return checkIsMobile();
  });

  const handleResize = useCallback(() => {
    const mobile = checkIsMobile();
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window === "undefined") return;

    // Set initial value
    setIsMobile(checkIsMobile());

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return isMobile;
}

// Export a non-hook version for emergency fallback
export const getIsMobile = (): boolean => {
  return checkIsMobile();
};
