import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";

export type TopicRow = {
  id: number;
  subject_id: number;
  name: string;
  grade_band: string;
  sort_order: number;
};

type SupabaseClient =
  | ReturnType<typeof createBrowserClient>
  | ReturnType<typeof createServerClient>;

export async function listTopicsBySubject(
  supabase: SupabaseClient,
  subjectId: number,
): Promise<TopicRow[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}
