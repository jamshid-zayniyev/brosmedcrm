export const handleStorage = ({
  key,
  value,
}: {
  key: string;
  value?: string | null;
}) => {
  if (value) {
    localStorage.setItem(key, value);
  }
  if (value === null) {
    localStorage.removeItem(key);
  }
  return localStorage.getItem(key);
};