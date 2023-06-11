import bcrypt from 'bcrypt';

/**
 * Function to encrypt a password
 * @param password 
 * @returns hashed password
 */
export async function encryptPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * Function to compare a password with its hash
 * @param password 
 * @param hashedPassword
 * @returns boolen 
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}
