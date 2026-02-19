"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import {
  UserRole,
  UserProfile as UserProfileType,
  Subscription,
  LocalHeroAssignment,
} from "@/lib/types/roles";
import { getRolePermissions, RolePermissions } from "@/lib/permissions";
import { safeLocalStorage, logStorageEnvironment } from "@/lib/storage-utils";

export type { UserRole };

export interface UserProfile extends UserProfileType {
  // Removed subscriptions and assignedCities - these are now lazy-loaded
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  permissions: RolePermissions;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: any; data?: { user: any; session: any } }>;
  signUpAsOwner: (
    email: string,
    password: string,
    fullName: string,
    businessName: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<RolePermissions>(
    getRolePermissions(null, [])
  );
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const loadingUserIdRef = useRef<string | null>(null); // Track which user ID is currently loading
  const router = useRouter();

  const loadUserProfile = async (userId: string, sessionUser?: User) => {
    // Prevent duplicate loads - check if this exact user ID is already being loaded
    if (loadingUserIdRef.current === userId) {
      console.log(
        "[AuthContext] ⏭️ Profile load already in progress for user:",
        userId,
        "- skipping duplicate"
      );
      return { skipped: true };
    }

    // If profile already loaded for this user, skip
    if (userProfile && userProfile.id === userId) {
      console.log(
        "[AuthContext] ✅ Profile already loaded for this user, skipping..."
      );
      return { skipped: true };
    }

    try {
      console.log("[AuthContext] 📋 Loading profile for user:", userId);
      console.log("[AuthContext] Timestamp:", new Date().toISOString());
      loadingUserIdRef.current = userId; // Mark this user ID as loading
      setIsLoadingProfile(true);

      // Try to load from cache first for instant display (using safe storage)
      try {
        const cachedProfile = safeLocalStorage.getItem(`user_profile_${userId}`);
        if (cachedProfile) {
          const parsed = JSON.parse(cachedProfile);
          const cacheAge = Date.now() - (parsed.cachedAt || 0);
          // Use cache if less than 10 minutes old
          if (cacheAge < 10 * 60 * 1000) {
            console.log(
              "[AuthContext] 💾 Using cached profile (age:",
              Math.round(cacheAge / 1000),
              "seconds)"
            );
            setUserProfile(parsed.profile);
            setPermissions(getRolePermissions(parsed.profile.role, []));
            // If cache is less than 5 minutes old, skip the database query entirely
            if (cacheAge < 5 * 60 * 1000) {
              console.log(
                "[AuthContext] ⚡ Cache is fresh (<5min), skipping database query"
              );
              return { skipped: true };
            }
            console.log(
              "[AuthContext] 🔄 Cache exists but refreshing in background"
            );
          } else {
            console.log("[AuthContext] 🗑️ Cache expired, loading fresh data");
          }
        }
      } catch (cacheError) {
        console.warn("[AuthContext] ⚠️ Error reading cache:", cacheError);
      }

      // Query with timeout tracking and detailed debugging
      const profileQueryStart = Date.now();
      console.log("\n" + "=".repeat(80));
      console.log("[AuthContext] 🔍 STARTING LEAN PROFILE QUERY (No Joins)");
      console.log("=".repeat(80));
      console.log("[AuthContext] User ID:", userId);
      console.log("[AuthContext] Timestamp:", new Date().toISOString());
      console.log(
        "[AuthContext] Supabase URL:",
        process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      console.log(
        "[AuthContext] Has Anon Key:",
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      console.log("=".repeat(80));

      // Add detailed performance tracking
      const perfMarks = {
        queryCreated: 0,
        queryStarted: 0,
        queryCompleted: 0,
        totalDuration: 0,
      };

      // Create the query
      const queryCreateStart = Date.now();
      console.log("[AuthContext] 📝 Creating optimized Supabase query...");
      console.log(
        "[AuthContext] 🚀 Fetching lean profile (no joins for fast OAuth)"
      );

      const queryPromise = (async () => {
        perfMarks.queryCreated = Date.now() - queryCreateStart;
        console.log(
          `[AuthContext] ✅ Query created (${perfMarks.queryCreated}ms)`
        );
        console.log(
          "[AuthContext] 🚀 Executing lean profile query (no joins)..."
        );

        const queryExecStart = Date.now();
        perfMarks.queryStarted = Date.now() - profileQueryStart;

        try {
          // OPTIMIZED: Fetch ONLY profile fields - no joins to avoid circular RLS
          // Subscriptions and assignments are now lazy-loaded when needed

          console.log(
            "[AuthContext] 🔍 DETAILED DEBUG - About to query user_profiles"
          );
          console.log("[AuthContext] 🔍 User ID:", userId);
          console.log("[AuthContext] 🔍 Supabase client ready:", !!supabase);

          // Check if session is set in Supabase client
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          console.log("[AuthContext] 🔍 Current session exists:", !!currentSession);
          console.log("[AuthContext] 🔍 Session user ID:", currentSession?.user?.id);
          console.log("[AuthContext] 🔍 Session matches query:", currentSession?.user?.id === userId);

          const result = await supabase
            .from("user_profiles")
            .select(
              "id, email, full_name, avatar_url, role, preferences, created_at, updated_at"
            )
            .eq("id", userId)
            .maybeSingle();

          console.log("[AuthContext] 🔍 Query returned!");

          perfMarks.queryCompleted = Date.now() - queryExecStart;
          console.log(
            `[AuthContext] ✅ Lean profile query executed (${perfMarks.queryCompleted}ms)`
          );
          console.log("[AuthContext] 📊 Query response status:", result.status);
          console.log("[AuthContext] 📊 Has data:", !!result.data);
          console.log("[AuthContext] 📊 Has error:", !!result.error);

          return result;
        } catch (queryError: any) {
          perfMarks.queryCompleted = Date.now() - queryExecStart;
          console.error(
            `[AuthContext] ❌ Query threw error after ${perfMarks.queryCompleted}ms:`,
            queryError
          );
          throw queryError;
        }
      })();

      // Performance warning timers (non-blocking)
      setTimeout(() => {
        if (perfMarks.queryCompleted === 0) {
          console.warn(
            "[AuthContext] ⚠️ Query taking longer than 3 seconds..."
          );
          console.warn("[AuthContext] Current state:", perfMarks);
        }
      }, 3000);

      setTimeout(() => {
        if (perfMarks.queryCompleted === 0) {
          console.warn(
            "[AuthContext] ⚠️ Query taking longer than 10 seconds - possible network issue"
          );
          console.warn("[AuthContext] Current state:", perfMarks);
        }
      }, 10000);

      let profileData, profileError;
      try {
        console.log(
          "[AuthContext] ⏳ Waiting for query with 15-second timeout..."
        );

        // Race the query against a 15-second timeout (increased for iframe environments)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Query timeout after 15 seconds")),
            15000
          );
        });

        const result = (await Promise.race([
          queryPromise,
          timeoutPromise,
        ])) as any;
        profileData = result.data;
        profileError = result.error;

        perfMarks.totalDuration = Date.now() - profileQueryStart;
        console.log("[AuthContext] ✅ Query completed successfully");

        if (perfMarks.totalDuration > 3000) {
          console.warn(
            "[AuthContext] ⚠️ Query took",
            perfMarks.totalDuration,
            "ms - this is slower than expected but completed successfully"
          );
        }
      } catch (queryError: any) {
        perfMarks.totalDuration = Date.now() - profileQueryStart;
        console.error("\n" + "!".repeat(80));
        console.error("[AuthContext] ❌ QUERY ERROR/TIMEOUT DETAILS");
        console.error("!".repeat(80));
        console.error("[AuthContext] Error:", queryError.message);
        console.error(
          "[AuthContext] Total wait time:",
          perfMarks.totalDuration,
          "ms"
        );
        console.error("[AuthContext] Performance breakdown:", perfMarks);
        console.error("[AuthContext] User ID:", userId);
        console.error("!".repeat(80) );

        // If we have cached data, continue using it even if refresh fails
        if (userProfile && userProfile.id === userId) {
          console.warn(
            "[AuthContext] ⚠️ Query failed but using existing cached profile"
          );
          return { skipped: true };
        }

        // If timeout, throw the error - fallback will be handled by caller
        // Don't try to call supabase.auth.getUser() here as it will also hang during OAuth
        console.warn(
          "[AuthContext] ⏰ TIMEOUT - Throwing error for caller to handle with session data"
        );
        throw queryError;
      }

      perfMarks.totalDuration = Date.now() - profileQueryStart;

      console.log("\n" + "=".repeat(80));
      console.log("[AuthContext] ✅ PROFILE QUERY COMPLETED");
      console.log("=".repeat(80));
      console.log(
        "[AuthContext] Total duration:",
        perfMarks.totalDuration,
        "ms"
      );
      console.log("[AuthContext] Performance breakdown:", {
        queryCreation: perfMarks.queryCreated + "ms",
        queryStart: perfMarks.queryStarted + "ms",
        queryExecution: perfMarks.queryCompleted + "ms",
        total: perfMarks.totalDuration + "ms",
      });
      console.log("[AuthContext] Performance analysis:", {
        isHealthy: perfMarks.totalDuration < 1000,
        isSlow:
          perfMarks.totalDuration >= 1000 && perfMarks.totalDuration < 3000,
        isVerySlow: perfMarks.totalDuration >= 3000,
        expectedTime: "<100ms",
        actualTime: perfMarks.totalDuration + "ms",
        slowdownFactor: Math.round(perfMarks.totalDuration / 100) + "x",
      });
      console.log("[AuthContext] Profile query result:", {
        hasData: !!profileData,
        dataKeys: profileData ? Object.keys(profileData) : [],
        role: profileData?.role,
        email: profileData?.email,
        full_name: profileData?.full_name,
        id: profileData?.id,
        hasError: !!profileError,
        errorMessage: profileError?.message,
      });

      if (profileData) {
        console.log("[AuthContext] 📄 Profile fields:", {
          id: profileData.id,
          email: profileData.email,
          role: profileData.role,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url ? "(present)" : "(null)",
          created_at: profileData.created_at,
          updated_at: profileData.updated_at,
        });
      }
      console.log("=".repeat(80) + "\n");

      if (profileError) {
        console.error("\n" + "!".repeat(80));
        console.error("[AuthContext] ❌ PROFILE QUERY ERROR");
        console.error("!".repeat(80));
        console.error("[AuthContext] Error object:", profileError);
        console.error("[AuthContext] Error details:", {
          message: profileError.message,
          code: profileError.code,
          hint: profileError.hint,
          details: profileError.details,
        });
        console.error(
          "[AuthContext] Query duration before error:",
          perfMarks.totalDuration,
          "ms"
        );
        console.error("!".repeat(80) + "\n");
        throw profileError;
      }

      if (!profileData) {
        console.warn(
          "[AuthContext] ⚠️ No profile data found for user:",
          userId
        );
        console.warn(
          "[AuthContext] User may not have a profile row in user_profiles table"
        );
        console.warn(
          "[AuthContext] Attempting to create profile from auth metadata..."
        );

        // Try to get user from auth and create profile
        try {
          // Use passed sessionUser if available, otherwise try to get from auth
          let authUser = sessionUser;

          if (!authUser) {
            console.log("[AuthContext] No session user provided, querying auth...");
            const {
              data: { user },
            } = await supabase.auth.getUser();
            authUser = user || undefined;
          } else {
            console.log("[AuthContext] Using provided session user data");
          }

          console.log(
            "[AuthContext] 🔍 Full auth user object:",
            JSON.stringify(authUser, null, 2)
          );
          console.log(
            "[AuthContext] Auth user metadata:",
            authUser?.user_metadata
          );
          console.log(
            "[AuthContext] Auth user email:",
            authUser?.email
          );
          console.log(
            "[AuthContext] Auth user id:",
            authUser?.id
          );

          if (authUser) {
            // Extract role from app_metadata or user_metadata, default to customer
            const userRole = (authUser.app_metadata?.role ||
                            authUser.user_metadata?.role ||
                            "customer") as UserRole;

            // Create profile data
            const newProfileData = {
              id: authUser.id,
              email: authUser.email || "",
              full_name:
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email?.split("@")[0] ||
                "User",
              role: userRole,
              avatar_url:
                authUser.user_metadata?.avatar_url ||
                authUser.user_metadata?.picture ||
                null,
              preferences: {},
            };

            console.log(
              "[AuthContext] 📝 Prepared profile data:",
              newProfileData
            );
            console.log(
              "[AuthContext] 📝 Attempting to insert into database..."
            );

            // Try to insert the profile into the database
            const { data: insertData, error: insertError } = await supabase
              .from("user_profiles")
              .insert(newProfileData)
              .select()
              .single();

            if (insertError) {
              console.error(
                "[AuthContext] ❌ Failed to create profile in database:"
              );
              console.error("[AuthContext] Error code:", insertError.code);
              console.error("[AuthContext] Error message:", insertError.message);
              console.error("[AuthContext] Error details:", insertError.details);
              console.error("[AuthContext] Error hint:", insertError.hint);
              console.warn(
                "[AuthContext] ⚠️ Using in-memory fallback profile only"
              );
            } else {
              console.log(
                "[AuthContext] ✅ Profile created successfully in database"
              );
              console.log("[AuthContext] Inserted data:", insertData);
            }

            // Use the profile data (whether DB insert succeeded or not)
            const fallbackProfile: UserProfile = {
              ...newProfileData,
              created_at: authUser.created_at || new Date().toISOString(),
              updated_at: authUser.created_at || new Date().toISOString(),
            };

            console.warn(
              `[AuthContext] ✅ Using fallback profile with ${fallbackProfile.role} role`
            );
            setUserProfile(fallbackProfile);
            setPermissions(getRolePermissions(fallbackProfile.role, []));

            // Cache the profile (using safe storage)
            try {
              safeLocalStorage.setItem(
                `user_profile_${userId}`,
                JSON.stringify({
                  profile: fallbackProfile,
                  cachedAt: Date.now(),
                })
              );
            } catch (cacheError) {
              console.warn("[AuthContext] ⚠️ Error caching profile:", cacheError);
            }

            return { skipped: false };
          }
        } catch (fallbackError) {
          console.error(
            "[AuthContext] ❌ Fallback also failed:",
            fallbackError
          );
          throw fallbackError;
        }

        throw new Error("Failed to create profile: no auth user available");
      }

      console.log(
        "[AuthContext] ✅ Profile loaded - Role:",
        profileData.role,
        "Email:",
        profileData.email
      );

      // Profile is now lean - no subscriptions or assignments
      // These will be lazy-loaded when needed
      console.log(
        "[AuthContext] ⚡ PERFORMANCE: Lean profile loaded (subscriptions/assignments will lazy-load)"
      );

      const profile: UserProfile = {
        ...profileData,
      };

      setUserProfile(profile);
      // Initialize permissions with empty subscriptions - most permissions are role-based
      setPermissions(getRolePermissions(profile.role, []));

      // Cache the profile for faster subsequent loads (using safe storage)
      try {
        safeLocalStorage.setItem(
          `user_profile_${userId}`,
          JSON.stringify({
            profile,
            cachedAt: Date.now(),
          })
        );
        console.log("[AuthContext] 💾 Profile cached successfully");
      } catch (cacheError) {
        console.warn("[AuthContext] ⚠️ Error caching profile:", cacheError);
      }

      console.log("[AuthContext] ✅ Profile state updated successfully");
      console.log("[AuthContext] 🎭 ROLE ASSIGNED:", profile.role);
      console.log("[AuthContext] 👤 USER EMAIL:", profile.email);
      console.log("[AuthContext] 🔑 USER ID:", profile.id);
      console.log(
        "[AuthContext] Permissions granted:",
        Object.keys(getRolePermissions(profile.role, [])).filter(
          (k) => (getRolePermissions(profile.role, []) as any)[k]
        )
      );
      return { skipped: false };
    } catch (error: any) {
      console.error(
        "[AuthContext] ❌ Fatal error loading user profile:",
        error
      );
      console.error("[AuthContext] Error type:", error?.constructor?.name);
      console.error("[AuthContext] Error message:", error?.message);
      throw error;
    } finally {
      loadingUserIdRef.current = null; // Clear the loading user ID
      setIsLoadingProfile(false);
      console.log("[AuthContext] 🏁 Profile loading completed");
    }
  };

  useEffect(() => {
    let mounted = true;
    let safetyTimeout: NodeJS.Timeout | null = null;

    const initializeAuth = async () => {
      const initStartTime = Date.now();
      try {
        console.log("\n" + "🚀".repeat(40));
        console.log("[AuthContext] 🚀 INITIALIZING AUTHENTICATION");
        console.log("🚀".repeat(40));
        console.log("[AuthContext] Timestamp:", new Date().toISOString());
        console.log(
          "[AuthContext] Browser:",
          typeof window !== "undefined" ? "Client" : "Server"
        );
        console.log("[AuthContext] Supabase configured:", !!supabase);
        
        // Log storage environment for debugging iframe issues
        if (typeof window !== "undefined") {
          logStorageEnvironment();
        }
        
        console.log("=".repeat(80) );

        // 🚪 Check for logout parameter - if present, force logout and skip session check
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has("logout")) {
            console.log("\n" + "🚪".repeat(40));
            console.log("[AuthContext] 🚪 LOGOUT PARAMETER DETECTED");
            console.log("🚪".repeat(40));
            console.log("[AuthContext] Forcing complete logout...");

            // Manually clear all Supabase cookies
            try {
              const cookies = document.cookie.split(";");
              cookies.forEach((cookie) => {
                const eqPos = cookie.indexOf("=");
                const name =
                  eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                // Clear any Supabase-related cookies
                if (
                  name.includes("sb-") ||
                  name.includes("supabase") ||
                  name.includes("auth")
                ) {
                  // Delete cookie by setting it to expire in the past
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
                  console.log(`[AuthContext] 🗑️ Deleted cookie: ${name}`);
                }
              });
            } catch (cookieError) {
              console.error(
                "[AuthContext] Error clearing cookies:",
                cookieError
              );
            }

            // Clear only USER-SPECIFIC SWR cache (keep public data like restaurants)
            try {
              const userSpecificPatterns = [
                "/api/user-data/bookmarks",
                "/api/user-data/likes",
                "/api/subscriptions",
                "/api/local-hero",
                "/api/admin",
                "/api/owner",
                "user_profile_",
              ];

              mutate(
                (key) => {
                  if (typeof key === "string") {
                    return userSpecificPatterns.some((pattern) =>
                      key.includes(pattern)
                    );
                  }
                  return false;
                },
                undefined,
                { revalidate: false }
              );
            } catch (cacheError) {
              console.error("[AuthContext] Error clearing cache:", cacheError);
            }

            // Force logout state
            setUser(null);
            setUserProfile(null);
            setPermissions(getRolePermissions(null, []));
            setLoading(false);

            // Remove logout parameter from URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, "", newUrl);

            console.log("[AuthContext] ✅ Forced logout complete");
            console.log("🚪".repeat(40) + "\n");
            return; // Skip session check
          }
        }

        // Safety timeout - if initialization takes too long, force loading=false
        safetyTimeout = setTimeout(() => {
          const timeElapsed = Date.now() - initStartTime;
          console.error("\n" + "⚠️".repeat(40));
          console.error("[AuthContext] ⚠️ SAFETY TIMEOUT TRIGGERED");
          console.error("⚠️".repeat(40));
          console.error("[AuthContext] Time elapsed:", timeElapsed, "ms");
          console.error("[AuthContext] Expected: <10000ms");
          console.error(
            "[AuthContext] Current state - user:",
            user ? "exists" : "null",
            "profile:",
            userProfile ? "exists" : "null"
          );
          console.error("⚠️".repeat(40) + "\n");
          if (mounted) {
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        console.log("[AuthContext] 🔐 Getting session from Supabase...");
        const sessionStartTime = Date.now();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        const sessionDuration = Date.now() - sessionStartTime;
        console.log(
          `[AuthContext] ✅ getSession() completed in ${sessionDuration}ms`
        );

        if (error) {
          console.error("\n" + "❌".repeat(40));
          console.error("[AuthContext] ❌ ERROR GETTING SESSION");
          console.error("❌".repeat(40));
          console.error("[AuthContext] Error:", error);
          console.error("[AuthContext] Error message:", error.message);
          console.error("❌".repeat(40) + "\n");
          if (safetyTimeout) clearTimeout(safetyTimeout);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log("\n" + "=".repeat(80));
        console.log("[AuthContext] ✅ SESSION RETRIEVED");
        console.log("=".repeat(80));
        console.log(
          "[AuthContext] Status:",
          session ? `✅ User logged in` : "⚪ No session"
        );
        if (session?.user) {
          console.log("[AuthContext] User email:", session.user.email);
          console.log("[AuthContext] User ID:", session.user.id);
          console.log("[AuthContext] Created at:", session.user.created_at);
          console.log(
            "[AuthContext] 📦 User metadata:",
            JSON.stringify(session.user.user_metadata, null, 2)
          );
          console.log(
            "[AuthContext] 📦 App metadata:",
            JSON.stringify(session.user.app_metadata, null, 2)
          );
        }
        console.log("=".repeat(80) + "\n");

        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            console.log("\n" + "🔄".repeat(40));
            console.log("[AuthContext] 🔄 LOADING USER PROFILE");
            console.log("🔄".repeat(40));
            console.log("[AuthContext] Email:", session.user.email);
            console.log("[AuthContext] User ID:", session.user.id);
            console.log("=".repeat(80) + "\n");

            const profileLoadStartTime = Date.now();
            try {
              await loadUserProfile(session.user.id);
              const profileLoadDuration = Date.now() - profileLoadStartTime;

              console.log("\n" + "✅".repeat(40));
              console.log("[AuthContext] ✅ PROFILE LOAD COMPLETED");
              console.log("✅".repeat(40));
              console.log("[AuthContext] Duration:", profileLoadDuration, "ms");
              console.log("[AuthContext] Expected: <1000ms");
              console.log(
                "[AuthContext] Status:",
                profileLoadDuration < 1000 ? "✅ Healthy" : "⚠️ Slow"
              );
              console.log("✅".repeat(40) + "\n");
            } catch (profileError) {
              console.error("[AuthContext] Error loading profile in initializeAuth:", profileError);
              // Create fallback from session data
              if (mounted && session?.user) {
                console.warn("[AuthContext] ⚠️ Creating fallback profile from session data in initializeAuth");
                const fallbackProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || "",
                  full_name:
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0] ||
                    "User",
                  role: (session.user.app_metadata?.role as UserRole) || "customer",
                  created_at: session.user.created_at || new Date().toISOString(),
                  avatar_url:
                    session.user.user_metadata?.avatar_url ||
                    session.user.user_metadata?.picture ||
                    null,
                  preferences: {},
                  updated_at: session.user.created_at || new Date().toISOString(),
                };
                setUserProfile(fallbackProfile);
                setPermissions(getRolePermissions(fallbackProfile.role, []));
              } else {
                setUserProfile(null);
                setPermissions(getRolePermissions(null, []));
              }
            }

            if (mounted) {
              console.log("[AuthContext] 🏁 Setting loading=false");
              setLoading(false);
            }
          } else {
            console.log("\n" + "⚪".repeat(40));
            console.log("[AuthContext] ⚪ NO SESSION FOUND");
            console.log("⚪".repeat(40));
            console.log("[AuthContext] User is not logged in");
            console.log("[AuthContext] Setting loading=false");
            console.log("⚪".repeat(40) + "\n");
            setLoading(false);
          }
        }

        if (safetyTimeout) clearTimeout(safetyTimeout);
      } catch (err) {
        console.error(
          "[AuthContext] ❌ Fatal error during auth initialization:",
          err
        );
        if (safetyTimeout) clearTimeout(safetyTimeout);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const stateChangeTime = Date.now();
      console.log("\n" + "🔔".repeat(40));
      console.log("[AuthContext] 🔔 AUTH STATE CHANGE EVENT");
      console.log("🔔".repeat(40));
      console.log("[AuthContext] Event type:", event);
      console.log("[AuthContext] Timestamp:", new Date().toISOString());
      console.log("[AuthContext] Has session:", !!session);
      console.log(
        "[AuthContext] Session user id:",
        session?.user?.id || "none"
      );      console.log(
        "[AuthContext] Session user email:",
        session?.user?.email || "none"
      );
      console.log("[AuthContext] Current state:", {
        hasUser: !!user,
        hasProfile: !!userProfile,
        isLoading: loading,
      });
      console.log("=".repeat(80) + "\n");

      // Handle SIGNED_OUT event explicitly
      if (event === "SIGNED_OUT") {
        console.log("\n" + "🚪".repeat(40));
        console.log("[AuthContext] 🚪 USER SIGNED OUT (event)");
        console.log("🚪".repeat(40));
        console.log("[AuthContext] Clearing all state and SWR cache");
        console.log("🚪".repeat(40) + "\n");

        // Clear only USER-SPECIFIC SWR cache (keep public data like restaurants)
        try {
          const userSpecificPatterns = [
            "/api/user-data/bookmarks",
            "/api/user-data/likes",
            "/api/subscriptions",
            "/api/local-hero",
            "/api/admin",
            "/api/owner",
            "user_profile_",
          ];

          mutate(
            (key) => {
              if (typeof key === "string") {
                return userSpecificPatterns.some((pattern) =>
                  key.includes(pattern)
                );
              }
              return false;
            },
            undefined,
            { revalidate: false }
          );
          console.log(
            "[AuthContext] ✅ User-specific SWR cache cleared (public data retained)"
          );
        } catch (cacheError) {
          console.error("[AuthContext] ⚠️ Error clearing cache:", cacheError);
        }

        setUser(null);
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
        setLoading(false);
        return;
      }

      // Handle TOKEN_REFRESHED event
      if (event === "TOKEN_REFRESHED") {
        console.log("[AuthContext] 🔄 TOKEN_REFRESHED event fired");
        console.log(
          "[AuthContext] Current state - user:",
          user ? "exists" : "null",
          "profile:",
          userProfile ? "exists" : "null",
          "loading:",
          loading
        );
        setUser(session?.user ?? null);

        // TOKEN_REFRESHED should NEVER reload the profile or change loading state
        // The user is already logged in, this is just a token refresh
        // Profile will be refreshed from cache if needed on next navigation
        console.log(
          "[AuthContext] ℹ️ Token refresh - keeping current profile and loading state"
        );
        console.log(
          "[AuthContext] ℹ️ Profile will refresh automatically from cache on next navigation"
        );
        // Don't change loading state or trigger profile reload
        return;
      }

      // Handle SIGNED_IN and INITIAL_SESSION events
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        console.log("[AuthContext] Auth state event:", event);
        setUser(session?.user ?? null);

        // For INITIAL_SESSION, profile is already being loaded in initializeAuth
        // So we skip loading here to avoid duplicate queries
        if (event === "INITIAL_SESSION") {
          console.log(
            "[AuthContext] ⏭️ INITIAL_SESSION - profile already loading in initializeAuth, skipping duplicate load"
          );
          // Don't set loading=false here, let initializeAuth handle it
          return;
        }

        // For SIGNED_IN event, check if this is actually a new user or just token refresh
        if (session?.user && mounted) {
          // First check if userProfile is already loaded in memory
          if (userProfile && userProfile.id === session.user.id) {
            console.log(
              "[AuthContext] ℹ️ SIGNED_IN event for existing user (likely token refresh), skipping reload"
            );
            console.log(
              "[AuthContext] ℹ️ User already authenticated with profile loaded in memory"
            );
            // Profile already loaded for this user, no need to reload
            // Don't change loading state
            return;
          }

          // Check if we have a valid cached profile for this user (using safe storage)
          try {
            const cachedProfile = safeLocalStorage.getItem(
              `user_profile_${session.user.id}`
            );
            if (cachedProfile) {
              const parsed = JSON.parse(cachedProfile);
              const cacheAge = Date.now() - (parsed.cachedAt || 0);

              // If cache is less than 10 minutes old, use it and skip reload
              if (
                cacheAge < 10 * 60 * 1000 &&
                parsed.profile?.id === session.user.id
              ) {
                console.log(
                  "[AuthContext] ℹ️ SIGNED_IN event - found valid cached profile (age:",
                  Math.round(cacheAge / 1000),
                  "seconds), using it"
                );
                setUserProfile(parsed.profile);
                setPermissions(getRolePermissions(parsed.profile.role, []));
                if (mounted) setLoading(false);
                console.log(
                  "[AuthContext] ℹ️ Profile loaded from cache, ready immediately"
                );
                return;
              } else {
                console.log(
                  "[AuthContext] ℹ️ Cached profile expired or invalid, will load fresh"
                );
              }
            }
          } catch (cacheError) {
            console.warn(
              "[AuthContext] ⚠️ Error checking cache on SIGNED_IN:",
              cacheError
            );
          }

          // This is a genuinely new user login OR no valid cache
          console.log("[AuthContext] 📋 Loading profile for NEW user login");
          console.log(
            "[AuthContext] 📋 Previous user:",
            userProfile?.id || "none"
          );
          console.log("[AuthContext] 📋 New user:", session.user.id);

          // Check if we're in an OAuth callback (URL has 'code' parameter)
          const isOAuthCallback =
            typeof window !== "undefined" &&
            window.location.search.includes("code=");

          if (isOAuthCallback) {
            // During OAuth callback, DON'T query database - it will hang!
            // Use session data directly for immediate login
            console.warn(
              "[AuthContext] 🔥 OAuth callback detected - using session data directly (no DB query)"
            );
            const fallbackProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || "",
              full_name:
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split("@")[0] ||
                "User",
              role: (session.user.app_metadata?.role as UserRole) || "customer",
              created_at: session.user.created_at || new Date().toISOString(),
              avatar_url:
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                null,
              preferences: {},
              updated_at: session.user.created_at || new Date().toISOString(),
            };
            setUserProfile(fallbackProfile);
            setPermissions(getRolePermissions(fallbackProfile.role, []));
            setLoading(false);

            // Schedule a background profile refresh after OAuth completes
            console.log(
              "[AuthContext] 📅 Scheduling background profile refresh in 1 second"
            );
            setTimeout(() => {
              if (mounted) {
                console.log(
                  "[AuthContext] 🔄 Background: Refreshing profile from database"
                );
                loadUserProfile(session.user.id, session.user).catch((err) => {
                  console.warn(
                    "[AuthContext] ⚠️ Background profile refresh failed (non-critical):",
                    err
                  );
                });
              }
            }, 1000);
          } else {
            // Normal login (not OAuth callback) - query database normally
            try {
              const result = await loadUserProfile(session.user.id, session.user);
              if (mounted) setLoading(false);
            } catch (err) {
              console.error("[AuthContext] Error loading profile:", err);

              // If profile load fails (timeout/error), create fallback from session data
              if (mounted && session?.user) {
                console.warn(
                  "[AuthContext] ⚠️ Creating fallback profile from session data"
                );
                const fallbackProfile: UserProfile = {
                  id: session.user.id,
                  email: session.user.email || "",
                  full_name:
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0] ||
                    "User",
                  role:
                    (session.user.app_metadata?.role as UserRole) || "customer",
                  created_at:
                    session.user.created_at || new Date().toISOString(),
                  avatar_url:
                    session.user.user_metadata?.avatar_url ||
                    session.user.user_metadata?.picture ||
                    null,
                  preferences: {},
                  updated_at:
                    session.user.created_at || new Date().toISOString(),
                };
                setUserProfile(fallbackProfile);
                setPermissions(getRolePermissions(fallbackProfile.role, []));
                setLoading(false);
              } else {
                if(!userProfile && mounted) {
                  setUserProfile(null);
                  setPermissions(getRolePermissions(null, []));
                  setLoading(false);
                }
              }
            }
          }
        } else {
          // Null session means no user is authenticated - always clear profile to prevent session leakage
          setUserProfile(null);
          setPermissions(getRolePermissions(null, []));
          if (mounted) setLoading(false);
        }
        return;
      }

      // Handle other auth events (if any)
      setUser(session?.user ?? null);
      if (!session?.user) {
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
        if (mounted) setLoading(false);
      }
    });

    return () => {
      console.log("[AuthContext] Cleanup - unmounting");
      if (safetyTimeout) clearTimeout(safetyTimeout);
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    try {
      console.log("[AuthContext] 🔐 Starting Google OAuth flow...");

      // Use Supabase's built-in OAuth for simplicity
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : "https://nuggetrecovery.vercel.app/login";

      console.log("[AuthContext] Redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("[AuthContext] ❌ OAuth error:", error);
        return { error };
      }

      console.log("[AuthContext] ✅ OAuth initiated, redirecting to Google...");
      // The browser will redirect, no need to do anything else
      return { error: null };
    } catch (err: any) {
      console.error("[AuthContext] ❌ Fatal OAuth error:", err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log("[AuthContext] 📧 Starting signup with email:", email);

      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/signup`
          : undefined;

      console.log("[AuthContext] 📧 Signup redirect URL:", redirectUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || "",
          },
        },
      });

      if (error) {
        console.error("[AuthContext] ❌ Supabase signup error:", error);
        return { error, data: undefined };
      }

      console.log("[AuthContext] ✅ Signup response:", {
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userId: data?.user?.id,
        email: data?.user?.email,
        identitiesCount: data?.user?.identities?.length,
      });

      // Generate verification token and send email via Resend
      if (data?.user) {
        console.log("[AuthContext] 📧 User created, generating verification token");
        console.log("[AuthContext] 📧 User ID:", data.user.id);
        console.log("[AuthContext] 📧 User email:", data.user.email);

        try {
          const origin = typeof window !== "undefined"
            ? window.location.origin
            : "https://thenugget.app";

          // Generate verification token (non-blocking - signup succeeds even if this fails)
          console.log("[AuthContext] 🔑 Attempting to generate verification token...");
          try {
            const tokenResponse = await fetch("/api/auth/generate-verification-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: data.user.id,
                email: data.user.email,
              }),
            });

            const tokenResult = await tokenResponse.json();

            if (!tokenResponse.ok) {
              console.error("[AuthContext] ⚠️ Failed to generate token (non-blocking):", tokenResult);
              console.error("[AuthContext] ⚠️ Signup will proceed without verification email");
            } else {
              console.log("[AuthContext] ✅ Verification token generated");
              const verificationLink = `${origin}/verify-email?token=${tokenResult.token}`;
              console.log("[AuthContext] 📧 Verification link:", verificationLink.substring(0, 50) + "...");

              // Send verification email via Resend
              console.log("[AuthContext] 📧 Sending verification email via Resend...");
              const emailResponse = await fetch("/api/auth/send-email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "signup",
                  email: data.user.email,
                  link: verificationLink,
                  userName: fullName,
                }),
              });

              const emailResult = await emailResponse.json();

              if (!emailResponse.ok) {
                console.error("[AuthContext] ⚠️ Failed to send verification email (non-blocking):", emailResult);
                console.error("[AuthContext] ⚠️ Signup will proceed without verification email");
              } else {
                console.log("[AuthContext] ✅ Verification email sent successfully via Resend!");
              }
            }
          } catch (emailErr) {
            console.error("[AuthContext] ⚠️ Error in verification flow (non-blocking):", emailErr);
            console.error("[AuthContext] ⚠️ Signup will proceed without verification email");
          }

        } catch (emailErr) {
          console.error("[AuthContext] ⚠️ Outer verification error (non-blocking):", emailErr);
          console.error("[AuthContext] ⚠️ Signup will proceed without verification email");
        }
      }

      return { error: null, data };
    } catch (err: any) {
      console.error("[AuthContext] ❌ Signup failed:", err);

      if (
        err.message?.includes("ERR_NAME_NOT_RESOLVED") ||
        err.message?.includes("Failed to fetch")
      ) {
        return {
          error: {
            message:
              "Cannot connect to authentication service. Please check your Supabase credentials in the .env file.",
            name: "ConnectionError",
            status: 0,
          } as any,
          data: undefined,
        };
      }

      return {
        error: {
          message: err.message || "An unexpected error occurred during signup",
          name: "UnknownError",
          status: 500,
        } as any,
        data: undefined,
      };
    }
  };

  const signUpAsOwner = async (
    email: string,
    password: string,
    fullName: string,
    businessName: string
  ) => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/owner/register`
        : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          business_name: businessName,
        },
      },
    });

    if (error) return { error };

    if (data.user) {
      await supabase
        .from("user_profiles")
        .update({ role: "owner" })
        .eq("id", data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    try {
      console.log("[AuthContext] 🚪 Signing out...");

      // 🗑️ CRITICAL: Clear USER-SPECIFIC SWR cache (keep public data like restaurants)
      console.log("[AuthContext] 🗑️ Clearing user-specific SWR cache...");
      try {
        // Clear only user-specific cache patterns to preserve public data
        const userSpecificPatterns = [
          "/api/user-data/bookmarks",
          "/api/user-data/likes",
          "/api/subscriptions",
          "/api/local-hero",
          "/api/admin",
          "/api/owner",
          "user_profile_",
        ];

        mutate(
          (key) => {
            if (typeof key === "string") {
              return userSpecificPatterns.some((pattern) =>
                key.includes(pattern)
              );
            }
            return false;
          },
          undefined,
          { revalidate: false }
        );
        console.log(
          "[AuthContext] ✅ User-specific SWR cache cleared (public data retained)"
        );
      } catch (cacheError) {
        console.error("[AuthContext] ⚠️ Error clearing SWR cache:", cacheError);
        // Continue anyway - signout should still work
      }

      // Check if there's an active session before trying to sign out
      // If session is already missing, skip Supabase signOut and just clear local state
      console.log("[AuthContext] ⏳ Checking session before signout...");
      const { data: sessionData, error: sessionCheckError } =
        await supabase.auth.getSession();

      if (sessionCheckError || !sessionData?.session) {
        console.log(
          "[AuthContext] ℹ️ No active session found, skipping Supabase signOut"
        );
        console.log(
          "[AuthContext] ℹ️ Proceeding with local state cleanup only"
        );
      } else {
        // Session exists - proceed with signOut
        console.log("[AuthContext] ⏳ Signing out from Supabase...");
        let { error } = await supabase.auth.signOut({ scope: "global" });

        if (error) {
          // If error is "Auth session missing", session was already cleared - that's fine
          if (
            error.message?.includes("session missing") ||
            error.message?.includes("Auth session missing")
          ) {
            console.log(
              "[AuthContext] ℹ️ Session already cleared (this is fine)"
            );
          } else {
            console.warn(
              "[AuthContext] ⚠️ Global signout failed, trying local scope:",
              error.message
            );
            // Fallback to local scope if global fails
            const localResult = await supabase.auth.signOut({ scope: "local" });
            const localError = localResult.error;

            if (localError) {
              // If local also fails with session missing, that's fine
              if (
                localError.message?.includes("session missing") ||
                localError.message?.includes("Auth session missing")
              ) {
                console.log(
                  "[AuthContext] ℹ️ Session already cleared (local fallback)"
                );
              } else {
                console.warn(
                  "[AuthContext] ⚠️ Local signout also failed:",
                  localError.message
                );
              }
            } else {
              console.log(
                "[AuthContext] ✅ Successfully signed out from Supabase (local fallback)"
              );
            }
          }
        } else {
          console.log(
            "[AuthContext] ✅ Successfully signed out from Supabase (global)"
          );
        }
      }

      // Manually clear all Supabase cookies (even if API signOut failed)
      if (typeof window !== "undefined") {
        console.log("[AuthContext] 🗑️ Manually clearing Supabase cookies...");
        try {
          const cookies = document.cookie.split(";");
          let clearedCount = 0;
          cookies.forEach((cookie) => {
            const eqPos = cookie.indexOf("=");
            const name =
              eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            // Clear any Supabase-related cookies
            if (
              name.includes("sb-") ||
              name.includes("supabase") ||
              name.includes("auth")
            ) {
              // Delete cookie by setting it to expire in the past
              const domain = window.location.hostname;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
              clearedCount++;
            }
          });
          console.log(
            `[AuthContext] ✅ Manually cleared ${clearedCount} cookies`
          );
        } catch (cookieError) {
          console.error(
            "[AuthContext] ⚠️ Error manually clearing cookies:",
            cookieError
          );
        }
      }

      // Wait a moment to ensure signout completes
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Clear local state after Supabase signout
      console.log("[AuthContext] 🧹 Clearing local state...");
      setUser(null);
      setUserProfile(null);
      setPermissions(getRolePermissions(null, []));
      setLoading(false);

      // Additional cleanup: Clear ALL storage aggressively (using safe storage)
      if (typeof window !== "undefined") {
        try {
          // Clear ALL Supabase-related items from storage
          const clearStorageItems = (getItem: (key: string) => string | null, removeItem: (key: string) => void) => {
            let clearedCount = 0;
            const keysToCheck = [
              'user_profile_',
              'sb-',
              'supabase',
              'auth',
              'session',
              'token'
            ];
            
            // Try to clear known keys (since we can't enumerate all keys in memory storage)
            for (let i = 0; i < 100; i++) {
              keysToCheck.forEach(prefix => {
                const possibleKey = `${prefix}${i}`;
                try {
                  if (getItem(possibleKey)) {
                    removeItem(possibleKey);
                    clearedCount++;
                  }
                } catch (e) {
                  // Ignore errors
                }
              });
            }
            
            // Try native localStorage/sessionStorage if available
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                const keys = Object.keys(window.localStorage);
                keys.forEach((key) => {
                  if (
                    key.includes("supabase") ||
                    key.includes("sb-") ||
                    key.includes("user_profile_") ||
                    key.includes("auth") ||
                    key.includes("session") ||
                    key.includes("token") ||
                    key.startsWith("supabase.")
                  ) {
                    removeItem(key);
                    clearedCount++;
                  }
                });
              }
            } catch (e) {
              // localStorage not available, already using memory storage
            }
            
            return clearedCount;
          };

          const localCount = clearStorageItems(
            safeLocalStorage.getItem.bind(safeLocalStorage),
            safeLocalStorage.removeItem.bind(safeLocalStorage)
          );

          console.log(
            `[AuthContext] ✅ Cleared ${localCount} storage items`
          );

          // Also try to clear all cookies related to Supabase/auth
          // Note: We can't directly delete cookies, but the redirect will handle it
          console.log(
            "[AuthContext] ✅ Storage cleared, cookies will be cleared on redirect"
          );
        } catch (storageError) {
          console.error(
            "[AuthContext] ⚠️ Error clearing storage:",
            storageError
          );
        }
      }

      console.log("[AuthContext] 🏠 Redirecting to home...");

      // Use window.location.replace for a hard redirect (no history entry)
      // This ensures a completely fresh page load with no cached data
      if (typeof window !== "undefined") {
        // Longer delay to ensure all cleanup completes
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Force a complete hard reload - clear everything and start fresh
        // Using replace with timestamp ensures no cached data is used
        const redirectUrl = "/?logout=" + Date.now() + "&_=" + Math.random();
        console.log(
          "[AuthContext] 🔄 Performing hard redirect to:",
          redirectUrl
        );

        // Clear any remaining state right before redirect
        setUser(null);
        setUserProfile(null);
        setPermissions(getRolePermissions(null, []));
        setLoading(false);

        // Use replace to prevent back button from going to logged-in state
        window.location.replace(redirectUrl);

        // Force a hard reload if replace doesn't work (fallback)
        setTimeout(() => {
          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
        }, 100);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("[AuthContext] ❌ Fatal error signing out:", error);

      // Still try to clear everything
      try {
        const userSpecificPatterns = [
          "/api/user-data/bookmarks",
          "/api/user-data/likes",
          "/api/subscriptions",
          "/api/local-hero",
          "/api/admin",
          "/api/owner",
          "user_profile_",
        ];

        mutate(
          (key) => {
            if (typeof key === "string") {
              return userSpecificPatterns.some((pattern) =>
                key.includes(pattern)
              );
            }
            return false;
          },
          undefined,
          { revalidate: false }
        );
        console.log(
          "[AuthContext] ✅ User-specific SWR cache cleared (error recovery)"
        );
      } catch (cacheError) {
        console.error("[AuthContext] Error clearing cache:", cacheError);
      }

      // Clear local state
      setUser(null);
      setUserProfile(null);
      setPermissions(getRolePermissions(null, []));
      setLoading(false);

      // Force redirect even on error
      if (typeof window !== "undefined") {
        window.location.replace("/?logout=" + Date.now());
      } else {
        router.push("/");
        router.refresh();
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Removed getAssignedCities, hasCustomerPro, hasOwnerPro
  // These are now handled by separate lazy-loading hooks

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        permissions,
        signIn,
        signInWithGoogle,
        signUp,
        signUpAsOwner,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
