export const getPercentage = (value: number, total: number): number => {
  return Math.round((value / total) * 100);
};
