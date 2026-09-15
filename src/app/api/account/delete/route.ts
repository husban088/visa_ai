import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const accessToken = authHeader.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const admin = getSupabaseAdmin();

  if (!url || !anonKey || !admin) {
    return NextResponse.json(
      { error: "Account deletion isn't set up on this deployment yet." },
      { status: 500 }
    );
  }

  // Verify the token and find out who's asking — never trust a client-sent id.
  const asUser = createClient(url, anonKey);
  const { data: userData, error: userError } = await asUser.auth.getUser(accessToken);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }
  const userId = userData.user.id;

  // Remove their application data first, then the auth account itself.
  const { error: deleteRowsError } = await admin.from("applications").delete().eq("user_id", userId);
  if (deleteRowsError) {
    return NextResponse.json({ error: deleteRowsError.message }, { status: 500 });
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
  if (deleteUserError) {
    return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
