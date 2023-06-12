/**
 * Generates a 10 digits random number for account numbers
 * @returns {number} random
 */
function generateAccountNumbers(): number {
  const numbers = new Set<number>();
  const currentYear: number = new Date().getFullYear();

  while (numbers.size < 6) {
    const randomNumber: number = Math.floor(Math.random() * 10);

    numbers.add(randomNumber);
  }

  return parseInt(`${currentYear}${Array.from(numbers).join('')}`);
}

export default generateAccountNumbers;
