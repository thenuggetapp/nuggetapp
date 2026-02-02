export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="bg-white sticky top-0 z-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-2">
            <img
              src="https://cdn.prod.website-files.com/65c4e3031d72984c18dbb698/65e621c26e369137d198cadf_Black%20logo%20-%20no%20background-p-500.png"
              alt="Nugget"
              className="h-16"
            />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-slate-900 hover:text-slate-600 font-medium">Home</a>
            <a href="/about" className="text-slate-900 hover:text-slate-600 font-medium">About</a>
            <a href="/partner" className="text-slate-900 hover:text-slate-600 font-medium">Partner</a>
            <a href="/faq" className="text-slate-900 hover:text-slate-600 font-medium">FAQ</a>
            <a href="/login" className="text-slate-900 hover:text-slate-600 font-medium">Sign In</a>
            <a href="/signup" className="bg-[#8dbf65] hover:bg-[#7aad52] text-white px-4 py-2 rounded-md font-medium">Sign Up</a>
          </nav>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: December 15, 2025</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
                At Nugget, we take your privacy seriously. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our restaurant discovery platform. By using Nugget, you agree to the practices described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.1 Account Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you create an account, we collect:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Email address (required)</li>
                <li>Password (encrypted and stored securely)</li>
                <li>Full name (optional, but shown publicly if you post reviews)</li>
                <li>Profile picture (via Google OAuth or direct upload)</li>
                <li>User role (customer, restaurant owner, local hero, or admin)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.2 Usage and Behavioral Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect information about how you use our platform:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Saved searches:</strong> Search queries, filters (cuisine type, dietary preferences, price level, amenities), and precise location coordinates (latitude/longitude) of where you searched</li>
                <li><strong>Favorites:</strong> Which restaurants you bookmark</li>
                <li><strong>Reviews and ratings:</strong> Your written reviews, star ratings, and visit dates (this information is public)</li>
                <li><strong>Restaurant interactions:</strong> Aggregate counts of page views, phone clicks, website clicks, and direction requests</li>
                <li>Dietary preferences and cuisine interests stored in your profile</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.3 Location Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect location data in the following ways:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Saved search locations:</strong> When you save a search, we store the precise GPS coordinates (latitude/longitude) of the search area</li>
                <li><strong>IP-based location (requires consent):</strong> We use your IP address to determine your approximate location (nearest city) to show relevant local restaurants. This only happens if you accept functional cookies. Your IP address is never stored; we only cache the detected city name locally in your browser.</li>
                <li><strong>Browser geolocation (with permission):</strong> When you click "Use current location," your browser will ask for permission to share your precise GPS coordinates. This is only used to find restaurants near you and is never stored.</li>
                <li><strong>City/region:</strong> Used for restaurant discovery and local hero assignments</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.4 Payment Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you subscribe to a paid plan, we collect:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Stripe customer ID (used to manage your subscription)</li>
                <li>Stripe subscription ID</li>
                <li>Subscription plan type and status</li>
                <li>Billing period dates</li>
                <li><strong>Important:</strong> We do NOT store your credit card numbers or payment card details. All payment processing is handled securely by Stripe.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.5 Communications and Submissions</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Contact form submissions:</strong> Name, email, phone number (optional), subject, and message</li>
                <li><strong>Restaurant suggestions:</strong> Restaurant details you submit including name, cuisine, address, phone, website, and your reasoning</li>
                <li><strong>City requests:</strong> Cities you request us to add and your reasoning</li>
                <li><strong>Local hero applications:</strong> Your experience, motivation, preferred cities, and social media handles</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.6 Restaurant Owner Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you register as a restaurant owner, we collect:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Business information (restaurant names, addresses, descriptions)</li>
                <li>Ownership verification details</li>
                <li>Analytics preferences</li>
                <li>Marketing campaign settings</li>
                <li>Coupon and promotion details</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">1.7 Technical Information</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device type</li>
                <li>Operating system</li>
                <li>Session duration and timestamps</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">2.1 Service Delivery</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Create and manage your account</li>
                <li>Process authentication and maintain secure sessions</li>
                <li>Display personalized restaurant recommendations based on your preferences and search history</li>
                <li>Save your favorite restaurants and search queries</li>
                <li>Enable you to post reviews and ratings</li>
                <li>Facilitate restaurant discovery using location-based searches</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">2.2 Payment and Subscription Management</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Process subscription payments through Stripe</li>
                <li>Manage billing cycles and renewal dates</li>
                <li>Handle subscription upgrades, downgrades, and cancellations</li>
                <li>Maintain payment records for tax and legal compliance</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">2.3 Analytics and Improvement</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Track restaurant page views, phone clicks, website clicks, and direction requests (aggregated data only)</li>
                <li>Analyze usage patterns to improve platform features</li>
                <li>Understand which cuisines and features are most popular</li>
                <li>Optimize search algorithms and recommendation systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">2.4 Communications</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Send transactional emails (password resets, subscription confirmations, account notifications)</li>
                <li>Send marketing communications only if you opt-in during signup or in your account settings</li>
                <li>Respond to your contact form inquiries and support requests</li>
                <li>Notify you about changes to our services or policies</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">2.5 Safety and Security</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Detect and prevent fraudulent activity</li>
                <li>Monitor for security threats and suspicious behavior</li>
                <li>Enforce our Terms of Service</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Third-Party Services and Data Sharing</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>We do not sell your personal information to third parties.</strong> However, we share certain information with trusted service providers to operate our platform:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">3.1 Google Services</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                We use Google for authentication and restaurant data:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Google OAuth:</strong> When you sign in with Google, we receive your Google ID, email address, full name, and profile picture. Your Google login credentials are never stored on our servers.</li>
                <li><strong>Google Places API:</strong> We send your search queries, location coordinates, and search preferences to Google to retrieve restaurant information including names, addresses, phone numbers, opening hours, photos, ratings, and Google Maps URLs.</li>
                <li><strong>Data shared:</strong> Search queries, precise location coordinates (latitude/longitude), restaurant names for lookup</li>
                <li><strong>Privacy policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#8dbf65] hover:text-[#7aad52] underline">Google Privacy Policy</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">3.2 Stripe Payment Processing</h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                All payment processing is handled by Stripe:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Data shared with Stripe:</strong> Your email address, user ID (as metadata), subscription plan type, billing period dates</li>
                <li><strong>What Stripe collects:</strong> Payment card details (stored only by Stripe, never by us), billing addresses, transaction history</li>
                <li><strong>Why we use Stripe:</strong> To securely process subscription payments and manage billing</li>
                <li><strong>Privacy policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#8dbf65] hover:text-[#7aad52] underline">Stripe Privacy Policy</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">3.3 Mapbox Mapping Services</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Data shared with Mapbox:</strong> Location coordinates, search queries for geocoding, map viewport information</li>
                <li><strong>Why we use Mapbox:</strong> To display interactive maps, convert addresses to coordinates, and show restaurant locations</li>
                <li><strong>Privacy policy:</strong> <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#8dbf65] hover:text-[#7aad52] underline">Mapbox Privacy Policy</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">3.4 Restaurant Partners</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Aggregate analytics:</strong> Restaurant owners who subscribe to our platform can view aggregated analytics about their listings (total views, clicks, engagement) but cannot see individual user identities</li>
                <li><strong>No personal data shared:</strong> We do not share your email address, name, or contact information with restaurant owners</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">3.5 Other Users (Public Information)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Public reviews:</strong> When you post a restaurant review, your name (if provided), rating, review text, and visit date are visible to all users, including those not logged in</li>
                <li><strong>Private information:</strong> Your email address, saved searches, favorites, and contact form submissions are never public</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">3.6 Legal Requirements</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may disclose your information if required by law, court order, or to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Comply with legal processes</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect the rights, property, or safety of Nugget, our users, or the public</li>
                <li>Prevent fraud or security threats</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Public vs. Private Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                It's important to understand which information is public and which is private:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Public Information (visible to everyone)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Restaurant reviews you write (including your name, rating, review text, and visit date)</li>
                <li>Restaurant ratings and likes you submit</li>
                <li>Your profile name (only if you post public reviews)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Private Information (only visible to you and admins)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Email address</li>
                <li>Saved searches and search history</li>
                <li>Favorited restaurants</li>
                <li>Dietary preferences and cuisine interests</li>
                <li>Contact form submissions</li>
                <li>Subscription and payment details</li>
                <li>Local hero or restaurant owner applications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Active accounts:</strong> Your account data is retained while your account is active</li>
                <li><strong>Reviews and ratings:</strong> Retained indefinitely to maintain the integrity of our restaurant ratings system. Reviews remain visible even if you delete your account (attributed to "Former User")</li>
                <li><strong>Subscription data:</strong> Retained for 7 years after cancellation for tax, accounting, and legal compliance purposes</li>
                <li><strong>Saved searches and favorites:</strong> Deleted when you remove them or delete your account</li>
                <li><strong>Contact form submissions:</strong> Retained for 2 years for customer service purposes</li>
                <li><strong>Analytics data:</strong> Aggregated analytics retained indefinitely; individual tracking data deleted after 2 years</li>
                <li><strong>Deleted accounts:</strong> Personal data permanently deleted within 30 days of account deletion (except as noted above)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Cookies and Session Management</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use authentication tokens and browser storage to maintain your session:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">What We Use</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Authentication tokens:</strong> JWT (JSON Web Tokens) stored as HTTP-only cookies to keep you logged in securely</li>
                <li><strong>Session cookies:</strong> Essential cookies that expire when you close your browser</li>
                <li><strong>Local storage:</strong> Browser storage for user preferences and cached data</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">What We Don't Use</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Third-party advertising cookies</li>
                <li>Cross-site tracking cookies</li>
                <li>Marketing or analytics cookies from external services</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>Important:</strong> If you disable cookies in your browser, you will not be able to log in or use many features of our platform, as authentication requires cookie storage.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Data Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement comprehensive security measures to protect your personal information:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Security Measures</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Encryption in transit:</strong> All data transmitted between your browser and our servers uses HTTPS/TLS encryption</li>
                <li><strong>Encryption at rest:</strong> Your data is encrypted when stored in our database</li>
                <li><strong>Password protection:</strong> Passwords are hashed using industry-standard algorithms and never stored in plain text</li>
                <li><strong>Row-level security:</strong> Database-level access controls ensure users can only access their own data</li>
                <li><strong>OAuth security:</strong> Google sign-in reduces password exposure and leverages Google's security infrastructure</li>
                <li><strong>Payment security:</strong> PCI DSS-compliant payment processing through Stripe; we never handle credit card numbers</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Limitations</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                While we implement strong security measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security, but we continuously monitor and improve our security practices.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Security Breach Notification</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a data breach that affects your personal information, we will:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Notify affected users via email within 72 hours of discovering the breach</li>
                <li>Describe the nature of the breach and what information was compromised</li>
                <li>Explain the steps we're taking to address the breach and prevent future incidents</li>
                <li>Provide guidance on how you can protect yourself</li>
                <li>Comply with all applicable data breach notification laws</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Your Rights and Choices</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You have several rights regarding your personal information:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">8.1 Access and Update</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>View your data:</strong> Access your profile, saved searches, favorites, and reviews at any time by logging into your account</li>
                <li><strong>Update your information:</strong> Edit your profile name, email, preferences, and other account details in your account settings</li>
                <li><strong>Correct inaccuracies:</strong> Contact us to correct any inaccurate information we hold about you</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">8.2 Delete and Remove</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Delete saved searches:</strong> Remove individual saved searches from your account</li>
                <li><strong>Remove favorites:</strong> Unfavorite restaurants at any time</li>
                <li><strong>Delete reviews:</strong> Remove or edit your restaurant reviews</li>
                <li><strong>Delete account:</strong> Request full account deletion by contacting us. Your personal data will be deleted within 30 days (note: public reviews may be retained as "Former User" to maintain rating integrity)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">8.3 Marketing Communications</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Opt-out of marketing emails:</strong> Click the "Unsubscribe" link at the bottom of any marketing email</li>
                <li><strong>Update preferences:</strong> Manage your communication preferences in your account settings</li>
                <li><strong>Transactional emails:</strong> You cannot opt out of transactional emails (password resets, subscription confirmations) as these are necessary for the service</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">8.4 Data Portability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can request a copy of your data in a machine-readable format by contacting us. We will provide:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Your profile information</li>
                <li>All saved searches and favorites</li>
                <li>All reviews and ratings you've submitted</li>
                <li>Subscription history</li>
                <li>Contact form submissions</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">8.5 Subscription Management</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Cancel anytime:</strong> Cancel your subscription at any time from your subscription page</li>
                <li><strong>Downgrade:</strong> Switch from a paid plan to the free tier</li>
                <li><strong>Refunds:</strong> Subject to our refund policy (contact support for details)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. User Roles and Access</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our platform has different user roles with varying access levels:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Customer (Default)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Search for and discover restaurants</li>
                <li>Save searches and favorite restaurants</li>
                <li>Post reviews and ratings</li>
                <li>View their own data only</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Restaurant Owner</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Manage multiple restaurant listings</li>
                <li>View analytics for their restaurants (aggregate data only, not individual user information)</li>
                <li>Create and manage coupons and promotions</li>
                <li>Upload photos and update restaurant details</li>
                <li>Run marketing campaigns</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Local Hero (Community Curator)</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Edit and create restaurant listings in assigned cities</li>
                <li>Review and approve restaurant suggestions</li>
                <li>Curate local restaurant content</li>
                <li>Access to Local Hero dashboard with performance metrics</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Administrator</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Access to all user data for platform management and support</li>
                <li>Review contact form submissions and user applications</li>
                <li>Manage user roles and permissions</li>
                <li>Platform-wide analytics and monitoring</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-4 mt-4">
                <strong>Important:</strong> Restaurant owners can only see aggregated analytics (total views, clicks) and cannot identify individual users who viewed their listings. Your identity remains private.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Analytics and Tracking</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We track certain metrics to improve our platform and help restaurant owners understand their visibility:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">What We Track</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Restaurant page views:</strong> How many times a restaurant profile is viewed</li>
                <li><strong>Click tracking:</strong> Phone number clicks, website clicks, direction requests (aggregated counts only)</li>
                <li><strong>Search patterns:</strong> Popular cuisines, price ranges, and amenities (anonymized)</li>
                <li><strong>Feature usage:</strong> Which platform features are most used to guide improvements</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">What We Don't Track</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Third-party analytics tools (no Google Analytics, no Facebook Pixel)</li>
                <li>Cross-site tracking or advertising pixels</li>
                <li>Detailed browsing behavior outside of our platform</li>
                <li>Individual user journeys shared with restaurant owners</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. User-Generated Content</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you post reviews, ratings, or other content on our platform:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Content Ownership</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>You retain ownership:</strong> You own the content you create</li>
                <li><strong>License to us:</strong> By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, distribute, and modify your content for the purpose of operating our platform</li>
                <li><strong>Public visibility:</strong> Reviews and ratings are public and may be indexed by search engines</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Content Moderation</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>We reserve the right to remove content that violates our Terms of Service</li>
                <li>Content that is offensive, defamatory, or violates others' rights may be removed</li>
                <li>We may moderate reviews to ensure authenticity and quality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. We do not verify age during signup, and parents should monitor their children's internet use.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                If we discover that we have collected personal information from a child under 13, we will delete that information immediately. If you believe we have collected information from a child under 13, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. Our servers and service providers may be located in different jurisdictions. By using our platform, you consent to the transfer of your information to these locations.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Transfer Safeguards</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                For transfers of personal data from the European Economic Area (EEA) and the United Kingdom to countries outside these regions, we implement appropriate safeguards to protect your information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Standard Contractual Clauses (SCCs):</strong> We use Standard Contractual Clauses adopted by the European Commission for transfers of personal data to third countries that do not provide an adequate level of data protection</li>
                <li><strong>UK International Data Transfer Agreement/Addendum:</strong> For transfers from the UK, we supplement the SCCs with the UK Addendum to the EU Commission's Standard Contractual Clauses, as required by UK data protection law</li>
                <li><strong>Service Provider Agreements:</strong> Our third-party service providers (Google, Stripe, Mapbox) have implemented appropriate technical and organizational measures, and where required, have entered into SCCs or rely on adequacy decisions</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>Adequacy Decisions:</strong> Where data is transferred to countries recognized by the European Commission or UK government as providing adequate protection (such as through an adequacy decision), we rely on that recognition as the legal basis for transfer.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                You may request a copy of the safeguards we have in place by contacting us through our contact page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. California Privacy Rights (CCPA/CPRA)</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA):
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Sale and Sharing of Personal Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>We do not sell or share your personal information.</strong> Specifically:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>No sale:</strong> We do not sell personal information to third parties for monetary or other valuable consideration</li>
                <li><strong>No sharing for cross-context behavioral advertising:</strong> We do not share personal information with third parties for cross-context behavioral advertising purposes</li>
                <li><strong>No third-party advertising networks:</strong> We do not use advertising cookies, tracking pixels, or integrate with ad networks that would constitute "sharing" under CPRA</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Sensitive Personal Information</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We collect the following categories of sensitive personal information:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Precise geolocation data:</strong> GPS coordinates when you save searches or use location-based features</li>
                <li><strong>Account login credentials:</strong> Your password (encrypted)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>Use of Sensitive Personal Information:</strong> We use sensitive personal information only for purposes that are necessary to provide the services you requested and for other permitted business purposes under CPRA, including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Performing services requested by you (restaurant searches based on your location)</li>
                <li>Ensuring security and integrity of our systems</li>
                <li>Short-term, transient use (displaying search results)</li>
                <li>Verifying and maintaining service quality</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                Because we use sensitive personal information only for these permitted purposes, you do not have a right to limit its use under CPRA Section 1798.121.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Your California Privacy Rights</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Right to know:</strong> Request details about the personal information we collect, use, disclose, and sell/share (including categories and specific pieces of information)</li>
                <li><strong>Right to delete:</strong> Request deletion of your personal information, subject to certain exceptions</li>
                <li><strong>Right to correct:</strong> Request correction of inaccurate personal information we maintain about you</li>
                <li><strong>Right to opt-out of sale/sharing:</strong> While we do not sell or share personal information, you have the right to opt out if our practices change</li>
                <li><strong>Right to limit use of sensitive personal information:</strong> We use sensitive information only for permitted purposes, so this right does not apply</li>
                <li><strong>Right to non-discrimination:</strong> We will not discriminate against you for exercising your CCPA/CPRA rights</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Retention Periods</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain personal information for the periods described in Section 5 (Data Retention) of this policy. For California residents, we provide specific retention details:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Account data:</strong> Retained while account is active</li>
                <li><strong>Precise geolocation:</strong> Retained in saved searches until you delete them or your account</li>
                <li><strong>Transaction data:</strong> 7 years for tax compliance</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Exercising Your Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise these rights, please contact us through our contact page or email us. We will respond within 45 days (extendable by an additional 45 days if necessary). You may designate an authorized agent to make requests on your behalf by providing written authorization.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. European Privacy Rights (GDPR and UK GDPR)</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are located in the European Economic Area (EEA) or UK, you have additional rights under the General Data Protection Regulation (GDPR) and the UK GDPR:
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Legal Basis for Processing</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We process your personal data based on the following legal grounds:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Contract:</strong> To provide services you've requested (account creation, subscription management, restaurant discovery features)</li>
                <li><strong>Consent:</strong> For marketing communications and optional features such as precise location tracking (you can withdraw consent anytime)</li>
                <li><strong>Legitimate interests:</strong> To improve our services, prevent fraud, ensure platform security, and conduct analytics to enhance user experience</li>
                <li><strong>Legal obligation:</strong> To comply with applicable laws and regulations, including tax and financial record-keeping requirements</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Your GDPR Rights</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Right of access:</strong> Obtain a copy of your personal data we hold about you</li>
                <li><strong>Right to rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to erasure:</strong> Request deletion of your data ("right to be forgotten"), subject to certain legal exceptions</li>
                <li><strong>Right to restrict processing:</strong> Limit how we use your data in certain circumstances</li>
                <li><strong>Right to data portability:</strong> Receive your data in a structured, commonly used, machine-readable format</li>
                <li><strong>Right to object:</strong> Object to processing based on legitimate interests or for direct marketing purposes</li>
                <li><strong>Right to withdraw consent:</strong> Withdraw consent for data processing at any time (this does not affect the lawfulness of processing before withdrawal)</li>
                <li><strong>Right not to be subject to automated decision-making:</strong> We do not use automated decision-making or profiling that produces legal or similarly significant effects</li>
                <li><strong>Right to lodge a complaint:</strong> File a complaint with your local data protection authority (supervisory authority)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Data Protection Authorities</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are located in the EEA or UK and believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local supervisory authority:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>UK residents:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#8dbf65] hover:text-[#7aad52] underline">ico.org.uk</a></li>
                <li><strong>EEA residents:</strong> Contact your national data protection authority - find yours at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-[#8dbf65] hover:text-[#7aad52] underline">EDPB Member List</a></li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">UK Representative</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If Nugget does not have an establishment in the United Kingdom, we will appoint a UK Representative in accordance with Article 27 of the UK GDPR. If a UK Representative has been appointed, their contact details will be provided here. Until such time, please direct all UK GDPR inquiries to our contact page.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">EEA Representative</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If Nugget does not have an establishment in the European Economic Area, we will appoint an EEA Representative in accordance with Article 27 of the GDPR. If an EEA Representative has been appointed, their contact details will be provided here. Until such time, please direct all GDPR inquiries to our contact page.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">Exercising Your Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise these rights, please contact us through our contact page with "GDPR Request" or "UK GDPR Request" in the subject line. We will respond within one month of receiving your request. In complex cases, we may extend this period by two additional months, in which case we will notify you of the extension and the reasons for the delay.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">16. Changes to This Privacy Policy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make significant changes, we will:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li>Update the "Last updated" date at the top of this policy</li>
                <li>Post the new policy on this page</li>
                <li>Notify you via email if the changes materially affect your rights</li>
                <li>Provide a summary of key changes when appropriate</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                We encourage you to review this Privacy Policy periodically. Your continued use of our platform after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">17. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2 mb-4">
                <li><strong>Contact form:</strong> <a href="/contact" className="text-[#8dbf65] hover:text-[#7aad52] underline">Visit our contact page</a></li>
                <li><strong>Data protection inquiries:</strong> For GDPR or CCPA requests, please specify this in your message</li>
                <li><strong>Security concerns:</strong> If you discover a security vulnerability, please report it immediately</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                We aim to respond to all inquiries within 7 business days, and within 30 days for formal data subject requests.
              </p>
            </section>

            <section className="mb-8 border-t border-slate-200 pt-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                By using Nugget, you acknowledge that you have read and understood this Privacy Policy and agree to its terms. If you do not agree with this policy, please do not use our platform.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
