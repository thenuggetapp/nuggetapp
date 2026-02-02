#!/bin/bash

echo "🚀 Deploying Stripe Checkout Edge Function..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "📝 Checking Supabase login status..."
if ! supabase projects list &> /dev/null
then
    echo "❌ Not logged in to Supabase"
    echo "Please run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Link project if not already linked
echo "🔗 Checking project link..."
if [ ! -f ".supabase/project-ref" ]; then
    echo "⚠️  Project not linked. Linking now..."
    supabase link --project-ref bothvdppmqybygdfoqag
fi

echo "✅ Project linked"
echo ""

# Check if secrets are set
echo "🔐 Checking if Stripe secrets are configured..."
echo ""
echo "Please ensure these secrets are set in Supabase Dashboard:"
echo "  - STRIPE_SECRET_KEY"
echo "  - STRIPE_CUSTOMER_PRO_PRICE_ID"
echo "  - STRIPE_OWNER_PRO_PRICE_ID"
echo ""
read -p "Have you set these secrets? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "Please set the secrets first:"
    echo "  Option 1: Supabase Dashboard → Edge Functions → Secrets"
    echo "  Option 2: Run these commands:"
    echo "    supabase secrets set STRIPE_SECRET_KEY=sk_test_..."
    echo "    supabase secrets set STRIPE_CUSTOMER_PRO_PRICE_ID=price_..."
    echo "    supabase secrets set STRIPE_OWNER_PRO_PRICE_ID=price_..."
    exit 1
fi

echo ""
echo "📦 Deploying stripe-checkout function..."
supabase functions deploy stripe-checkout --no-verify-jwt

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Function deployed successfully!"
    echo ""
    echo "🎉 Your Stripe integration is now live!"
    echo ""
    echo "Test it by:"
    echo "  1. Go to /subscription page"
    echo "  2. Click 'Upgrade to Pro'"
    echo "  3. You should be redirected to Stripe Checkout"
    echo ""
else
    echo ""
    echo "❌ Deployment failed. Please check the error above."
    exit 1
fi

