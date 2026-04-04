export { supabase } from '../lib/supabase';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
