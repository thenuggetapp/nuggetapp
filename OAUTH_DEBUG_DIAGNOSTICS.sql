-- =====================================================================
-- OAuth Login Issue - Comprehensive Database Diagnostics
-- Run this in Supabase SQL Editor and share all outputs
-- =====================================================================

-- 1. Check the handle_new_user() trigger function
SELECT 
    'TRIGGER FUNCTION' as check_type,
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Check if trigger is attached
SELECT 
    'TRIGGER ATTACHMENT' as check_type,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgtype,
    tgenabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 3. Check RLS status on user_profiles
SELECT 
    'RLS STATUS' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles' AND schemaname = 'public';

-- 4. List all RLS policies on user_profiles
SELECT 
    'RLS POLICIES' as check_type,
    policyname as policy_name,
    cmd as command_type,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'user_profiles' AND schemaname = 'public'
ORDER BY policyname;

-- 5. Check for locks on user_profiles table
SELECT 
    'CURRENT LOCKS' as check_type,
    locktype,
    relation::regclass as table_name,
    mode,
    granted,
    pid,
    pg_blocking_pids(pid) as blocking_pids
FROM pg_locks 
WHERE relation = 'user_profiles'::regclass;

-- 6. Check recent user_profiles entries (last 5)
SELECT 
    'RECENT PROFILES' as check_type,
    id,
    email,
    role,
    created_at,
    updated_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Check if there are any slow queries currently running
SELECT 
    'SLOW QUERIES' as check_type,
    pid,
    now() - query_start as duration,
    state,
    left(query, 100) as query_preview
FROM pg_stat_activity 
WHERE state != 'idle' 
AND query NOT LIKE '%pg_stat_activity%'
AND now() - query_start > interval '1 second'
ORDER BY duration DESC;

-- 8. Check for any other triggers on auth.users
SELECT 
    'AUTH TRIGGERS' as check_type,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- 9. Check indexes on user_profiles
SELECT 
    'INDEXES' as check_type,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_profiles' AND schemaname = 'public';

-- 10. Check if there are foreign key constraints causing issues
SELECT 
    'FOREIGN KEYS' as check_type,
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
OR confrelid = 'user_profiles'::regclass;


