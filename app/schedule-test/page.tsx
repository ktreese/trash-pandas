"use client";

import Script from "next/script";

export default function ScheduleTestPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] p-8">
      <h1 className="text-white text-2xl font-bold mb-6">GameChanger Schedule Widget Test</h1>
      <div id="gc-schedule-widget-ywpo" />
      <Script
        src="https://widgets.gc.com/static/js/sdk.v1.js"
        strategy="afterInteractive"
        onLoad={() => {
          (window as any).GC.team.schedule.init({
            target: "#gc-schedule-widget-ywpo",
            widgetId: "c31a698d-f96e-48ff-befb-2350100e9455",
            maxVerticalGamesVisible: 4,
          });
        }}
      />
    </div>
  );
}
