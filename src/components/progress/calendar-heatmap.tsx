export function CalendarHeatmap({ walkDates }: { walkDates: string[] }) {
  // Show last 8 weeks (56 days)
  const today = new Date();
  const startDate = new Date(today.getTime() - 56 * 86400000);

  const walkDateSet = new Set(walkDates);
  const days = [];

  for (let i = 0; i < 56; i++) {
    const date = new Date(startDate.getTime() + i * 86400000);
    const dateStr = date.toDateString();
    const hasWalk = walkDateSet.has(dateStr);

    days.push({
      date: dateStr,
      hasWalk,
      dayOfWeek: date.getDay(),
    });
  }

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-white/45 sm:text-left">
        Last 8 weeks
      </p>
      <div className="flex justify-center sm:justify-start">
        <div
          className="inline-grid grid-cols-8 gap-0.5 rounded-xl border border-white/8 bg-white/5 p-2"
          role="img"
          aria-label="Walking activity for the last eight weeks"
        >
          {days.map((day, index) => (
            <div
              key={index}
              className={`size-3.5 rounded-sm transition-colors sm:size-4 ${
                day.hasWalk ? "bg-green-500/80" : "bg-white/10"
              }`}
              title={day.date}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
