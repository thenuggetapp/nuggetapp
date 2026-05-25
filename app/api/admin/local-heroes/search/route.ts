import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    if (query.length < 2) {
      return NextResponse.json({ data: [], error: null });
    }

    const escapedQuery = escapeIlikePattern(query);

    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email, full_name")
      .eq("role", "local_hero")
      .or(
        `email.ilike.%${escapedQuery}%,full_name.ilike.%${escapedQuery}%`
      )
      .order("full_name", { ascending: true })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ data: data || [], error: null });
  } catch (error: any) {
    console.error("Local hero search error:", error);
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }
}
