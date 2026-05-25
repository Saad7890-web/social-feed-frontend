export function formatRelativeTime(input: string) {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(seconds);

  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });

  if (absSeconds < 60) {
    return formatter.format(seconds, "second");
  }

  if (absSeconds < 3600) {
    return formatter.format(Math.round(seconds / 60), "minute");
  }

  if (absSeconds < 86_400) {
    return formatter.format(Math.round(seconds / 3600), "hour");
  }

  if (absSeconds < 2_592_000) {
    return formatter.format(Math.round(seconds / 86_400), "day");
  }

  if (absSeconds < 31_536_000) {
    return formatter.format(Math.round(seconds / 2_592_000), "month");
  }

  return formatter.format(Math.round(seconds / 31_536_000), "year");
}
