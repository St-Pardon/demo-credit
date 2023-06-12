import bcrypt from 'bcrypt';

/**
 * Function to encrypt a password
 * @param {string} password - The password to encrypt
 * @returns {string} hashed password
 */
export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * Function to compare a password with its hash
 * @param {string} password - The plaintext password to compare
 * @param {string} hashedPassword - The hashed password to compare
 * @returns {boolean} boolen
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
