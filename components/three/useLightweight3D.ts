"use client";

import { useEffect, useState } from "react";

type NavigatorWithPerformanceHints = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
  deviceMemory?: number;
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
      const constrainedHardware =
        (hints.hardwareConcurrency > 0 && hints.hardwareConcurrency <= 4) ||
        (typeof hints.deviceMemory === "number" && hints.deviceMemory <= 4);

      setLightweight(Boolean(media.matches || constrainedConnection || constrainedHardware));
    };

    selectMode();
    media.addEventListener("change", selectMode);

    return () => media.removeEventListener("change", selectMode);
  }, [maxWidth]);

  return lightweight;
}
