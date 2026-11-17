import { supabase } from '@/services/supabase'

/**
 * Calls a Supabase Edge Function, turning the two failure modes every caller
 * shares — Supabase not configured, and an invoke error — into thrown Errors.
 *
 * `failureMessage` is user-facing: these messages reach the UI (the assistant's
 * error banner, the grocery import mutation), so each caller supplies its own
 * rather than getting a generic one.
 */
export const invokeEdgeFunction = async <T>(
  name: string,
  body: Record<string, unknown>,
  failureMessage: string,
): Promise<T | null> => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }

  const { data, error } = await supabase.functions.invoke<T>(name, { body })

  if (error) {
    throw new Error(`${failureMessage}: ${error.message}`)
  }

  return data
}
