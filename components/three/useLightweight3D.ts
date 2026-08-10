"use client";

import { useEffect, useState } from "react";

type NavigatorWithPerformanceHints = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
};

export function useLightweight3D(maxWidth = 760) {
  const [lightweight, setLightweight] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);

    const selectMode = () => {
      const hints = navigator as NavigatorWithPerformanceHints;
      const constrainedConnection =
        hints.connection?.saveData ||
        hints.connection?.effectiveType === "2g" ||
        hints.connection?.effectiveType === "slow-2g";

      // Privacy-focused browsers often report an artificially low core or memory
      // count. Treating those values as a hard limit made the deployed desktop
      // experience fall back to a static image even on capable machines.
      setLightweight(Boolean(media.matches || constrainedConnection));
    };

    selectMode();
    media.addEventListener("change", selectMode);

    return () => media.removeEventListener("change", selectMode);
  }, [maxWidth]);

  return lightweight;
}
