export const formatRemainingTime = (target: string): string => {
  const targetDate = new Date(target);
  const now = new Date();
  let diff = targetDate.getTime() - now.getTime();

  if (Number.isNaN(diff)) {
    return "";
  }

  if (diff <= 0) {
    return "0 dk";
  }

  const SECOND = 1000;
  const MINUTE = 60 * SECOND;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  const days = Math.floor(diff / DAY);
  diff -= days * DAY;
  const hours = Math.floor(diff / HOUR);
  diff -= hours * HOUR;
  const minutes = Math.floor(diff / MINUTE);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}g`);
  if (hours > 0) parts.push(`${hours}sa`);
  if (minutes > 0) parts.push(`${minutes}dk`);

  if (parts.length === 0) {
    const seconds = Math.max(1, Math.floor(diff / SECOND));
    return `${seconds}sn`;
  }

  return parts.join(" ");
};

export const getClaimWindowStatus = (
  start: string,
  end: string,
): {
  label: string;
  variant: "info" | "success" | "warning";
  active: boolean;
} => {
  const now = new Date().getTime();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return {
      label: "Claim penceresi bilgisi bulunamadı.",
      variant: "warning",
      active: false,
    };
  }

  if (now >= endTime) {
    return {
      label: "Claim penceresi sona erdi.",
      variant: "warning",
      active: false,
    };
  }

  if (now < startTime) {
    return {
      label: `Claim penceresi ${formatRemainingTime(start)} sonra açılacak.`,
      variant: "info",
      active: false,
    };
  }

  return {
    label: `Claim penceresi açık! Kapanmasına ${formatRemainingTime(end)} kaldı.`,
    variant: "success",
    active: true,
  };
};

