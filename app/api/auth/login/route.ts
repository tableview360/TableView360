import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password, lang } = await req.json();
  const safeLang = lang === "es" ? "es" : "en";
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Invalid login credentials" },
      { status: 401 }
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role =
    profile?.role ??
    data.user.user_metadata?.role ??
    data.user.app_metadata?.role ??
    "client";

  const localizedHome = safeLang === "es" ? "/es" : "/";
  const localizedDashboard = safeLang === "es" ? "/es/dashboard" : "/dashboard";
  const redirectTo =
    role === "restaurant" || role === "admin"
      ? localizedDashboard
      : localizedHome;

  return NextResponse.json({
    user: data.user,
    role,
    redirectTo,
  });
}