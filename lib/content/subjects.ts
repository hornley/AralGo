import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

export type SubjectRow = {
  id: number;
  name: string;
  display_name: string;
  icon: string;
  sort_order: number;
};

type SupabaseClient =
  | ReturnType<typeof createBrowserClient>
  | ReturnType<typeof createServerClient>;

export async function listSubjects(
  supabase: SupabaseClient,
): Promise<SubjectRow[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}
