export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600 mb-8">Last updated: October 21, 2025</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                By accessing and using Nugget Markets Restaurant Discovery Platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Use License</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Permission is granted to temporarily access the materials on Nugget Markets Restaurant Discovery Platform for personal, non-commercial transitory viewing only.
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>You may not modify or copy the materials</li>
                <li>You may not use the materials for any commercial purpose</li>
                <li>You may not attempt to decompile or reverse engineer any software</li>
                <li>You may not remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Restaurant Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We strive to provide accurate and up-to-date restaurant information. However, we do not guarantee the accuracy, completeness, or timeliness of any information displayed on the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. User Content</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Users may post reviews, comments, and other content. You retain ownership of your content, but grant us a license to use, modify, and display it on our platform.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree not to post content that is offensive, defamatory, or violates any laws or third-party rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Nugget Markets Restaurant Discovery Platform shall not be held liable for any damages arising from the use or inability to use the materials on our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Modifications</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may revise these terms of service at any time without notice. By using this platform, you agree to be bound by the current version of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have any questions about these Terms, please contact us through our contact page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
