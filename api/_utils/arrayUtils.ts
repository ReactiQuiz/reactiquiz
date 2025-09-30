const shuffleArray = <T>(array: T[] | undefined): T[] => {
  if (!array || !Array.isArray(array)) return [];
  const shuffled = [...(array as T[])];
  let currentIndex = shuffled.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  return shuffled;
};

export { shuffleArray };
