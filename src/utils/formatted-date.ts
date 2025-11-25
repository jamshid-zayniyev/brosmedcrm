export const formattedDate = (created_at?: string) => {
  if (!created_at) {
    return "";
  }
  const date = new Date(created_at);

  const formatted = new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return formatted;
};
