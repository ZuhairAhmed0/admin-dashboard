export interface IHashProvider {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashedText: string): Promise<boolean>;
}
export const I_HASH_PROVIDER = 'IHashProvider';
