import { NextResponse } from "next/server";
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { validateWebsiteUrl } from "@/lib/validate-website-url";

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
  adminClient: SupabaseClient,
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

async function approvePendingApplications(
  adminClient: SupabaseClient,
  userId: string,
  email: string,
  reviewedBy: string
) {
  const approvalUpdate = {
    user_id: userId,
    status: "approved" as const,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  };

  const approvedIds = new Set<string>();

  const { data: approvedByEmail, error: emailError } = await adminClient
    .from("local_hero_applications")
    .update(approvalUpdate)
    .eq("status", "pending")
    .ilike("email", email)
    .select("id");

  if (emailError) throw emailError;
  approvedByEmail?.forEach((row) => approvedIds.add(row.id));

  const { data: approvedByUserId, error: userIdError } = await adminClient
    .from("local_hero_applications")
    .update(approvalUpdate)
    .eq("status", "pending")
    .eq("user_id", userId)
    .select("id");

  if (userIdError) throw userIdError;
  approvedByUserId?.forEach((row) => approvedIds.add(row.id));

  return approvedIds.size;
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
    const websiteRaw =
      typeof body.website === "string" ? body.website.trim() : "";

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    let sanitizedWebsite: string | null = null;
    if (websiteRaw) {
      const websiteValidation = validateWebsiteUrl(websiteRaw);
      if (!websiteValidation.valid) {
        return NextResponse.json(
          { error: websiteValidation.error || "Invalid website URL" },
          { status: 400 }
        );
      }
      sanitizedWebsite = websiteValidation.sanitized;
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
      const { data: insertedProfiles, error: profileInsertError } =
        await adminClient
          .from("user_profiles")
          .insert({
            id: userId,
            email,
            full_name: fullName,
            role: "local_hero",
            ...(sanitizedWebsite ? { website: sanitizedWebsite } : {}),
          })
          .select("id");

      if (profileInsertError) throw profileInsertError;
      profilesInserted = insertedProfiles?.length ?? 0;
    } else {
      const { data: updatedProfiles, error: profileUpdateError } =
        await adminClient
          .from("user_profiles")
          .update({
            role: "local_hero",
            full_name: fullName,
            email,
            ...(sanitizedWebsite ? { website: sanitizedWebsite } : {}),
          })
          .eq("id", userId)
          .select("id");

      if (profileUpdateError) throw profileUpdateError;
      profilesUpdated = updatedProfiles?.length ?? 0;
    }

    await adminClient.auth.admin.updateUserById(userId, {
      app_metadata: { role: "local_hero" },
    });

    const applicationsApproved = await approvePendingApplications(
      adminClient,
      userId,
      email,
      session.user.id
    );

    let assignmentsInserted = 0;

    if (cityPreference) {
      const { data: upsertedAssignments, error: assignmentError } =
        await adminClient
          .from("local_hero_assignments")
          .upsert(
            {
              user_id: userId,
              city_name: cityPreference,
              is_active: true,
            },
            { onConflict: "user_id,city_name" }
          )
          .select("id");

      if (assignmentError) throw assignmentError;
      assignmentsInserted = upsertedAssignments?.length ?? 0;
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
          applicationApproval: { rowsImpacted: applicationsApproved },
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
