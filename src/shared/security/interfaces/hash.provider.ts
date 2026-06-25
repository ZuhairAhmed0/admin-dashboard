export interface IHashProvider {
  hash(plasnText: string): Promise<string>;
  compare(plasnText: string, hashedText: string): Promise<boolean>;
}
export const I_HASH_PROVIDER = 'IHashProvider';
