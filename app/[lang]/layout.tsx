import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/footer";
import { langCodes, defaultLang, type LangCode } from "@/lib/i18n";
import { createSupabaseServer } from "@/lib/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TableView360",
  description: "Discover restaurants in 360°",
};

export function generateStaticParams() {
  return langCodes.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;

  const lang: LangCode = langCodes.includes(rawLang as LangCode)
    ? (rawLang as LangCode)
    : defaultLang;

  const supabase = await createSupabaseServer(); // ✅ await aquí

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = null;
  let username: string | null = null;
  let avatarUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, username, full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    role = profile?.role ?? null;
    username = profile?.username || profile?.full_name || null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col bg-slate-900 text-white">
        <Header
          initialUser={user}
          role={role}
          lang={lang}
          username={username}
          avatarUrl={avatarUrl}
        />

        <main className="flex-1">{children}</main>

        <Footer lang={lang} />
      </body>
    </html>
  );
}