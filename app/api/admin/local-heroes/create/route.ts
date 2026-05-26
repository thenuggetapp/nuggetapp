import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isDuplicateUserError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists") ||
    lower.includes("email address has already been registered")
  );
}

async function findAuthUserByEmail(
  adminClient: ReturnType<typeof createSupabaseClient>,
  email: string
) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );
    if (match) return match;

    if (data.users.length < 1000) break;
    page += 1;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const cityPreference =
      typeof body.cityPreference === "string"
        ? body.cityPreference.trim()
        : "";

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let userId: string | null = null;
    let usersCreated = 0;

    const { data: existingProfile } = await adminClient
      .from("user_profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      const existingAuthUser = await findAuthUserByEmail(adminClient, email);
      if (existingAuthUser) {
        userId = existingAuthUser.id;
      }
    }

    if (!userId) {
      const { data: createdUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
          },
        });

      if (createError) {
        if (isDuplicateUserError(createError.message)) {
          const existingAuthUser = await findAuthUserByEmail(adminClient, email);
          if (!existingAuthUser) {
            throw new Error(
              "User already exists but could not be resolved by email"
            );
          }
          userId = existingAuthUser.id;
        } else {
          throw createError;
        }
      } else if (createdUser.user) {
        userId = createdUser.user.id;
        usersCreated = 1;
      } else {
        throw new Error("User creation failed - no user returned");
      }
    }

    let profilesInserted = 0;
    let profilesUpdated = 0;

    const { data: profileById } = await adminClient
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profileById) {
      const { error: profileInsertError, count: profileInsertCount } =
        await adminClient
          .from("user_profiles")
          .insert({
            id: userId,
            email,
            full_name: fullName,
            role: "local_hero",
          })
          .select("id", { count: "exact" });

      if (profileInsertError) throw profileInsertError;
      profilesInserted = profileInsertCount ?? 1;
    } else {
      const { error: profileUpdateError, count: profileUpdateCount } =
        await adminClient
          .from("user_profiles")
          .update({
            role: "local_hero",
            full_name: fullName,
            email,
          })
          .eq("id", userId)
          .select("id", { count: "exact" });

      if (profileUpdateError) throw profileUpdateError;
      profilesUpdated = profileUpdateCount ?? 0;
    }

    await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role: "local_hero" },
    });

    const escapedEmail = email.replace(/"/g, '""');
    const { error: applicationError, count: applicationsApproved } =
      await adminClient
        .from("local_hero_applications")
        .update({
          user_id: userId,
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id,
        })
        .eq("status", "pending")
        .or(`user_id.eq.${userId},email.ilike."${escapedEmail}"`)
        .select("id", { count: "exact" });

    if (applicationError) throw applicationError;

    let assignmentsInserted = 0;

    if (cityPreference) {
      const { error: assignmentError, count: assignmentCount } =
        await adminClient
          .from("local_hero_assignments")
          .upsert(
            {
              user_id: userId,
              city_name: cityPreference,
              assigned_by: session.user.id,
              is_active: true,
            },
            { onConflict: "user_id,city_name" }
          )
          .select("id", { count: "exact" });

      if (assignmentError) throw assignmentError;
      assignmentsInserted = assignmentCount ?? 1;
    }

    return NextResponse.json({
      data: {
        userId,
        steps: {
          userCreation: { rowsImpacted: usersCreated },
          userProfile: {
            rowsInserted: profilesInserted,
            rowsUpdated: profilesUpdated,
          },
          applicationApproval: { rowsImpacted: applicationsApproved ?? 0 },
          cityAssignment: { rowsImpacted: assignmentsInserted },
        },
      },
      error: null,
    });
  } catch (error: any) {
    console.error("Admin create local hero error:", error);
    return NextResponse.json(
      { data: null, error: error.message || "Failed to create Local Hero" },
      { status: 500 }
    );
  }
}
