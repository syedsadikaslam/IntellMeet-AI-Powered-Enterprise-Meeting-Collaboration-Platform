import { PageHero, PageWrap, PriceCard, FAQItem } from './PagePrimitives'

function PricingPage() {
  return (
    <PageWrap>
      <PageHero
        centered
        kicker="Pricing Plans"
        title="Predictable pricing for high-performance teams."
        description="Choose the plan that fits your organization's scale. From small teams to global enterprises, we have you covered."
      />

      <div className="grid gap-8 md:grid-cols-3">
        <PriceCard
          tier="Starter"
          price="$19"
          description="Essential AI meeting intelligence for individuals and small teams."
          features={[
            "Unlimited meetings (up to 40 mins)",
            "10 AI Meeting Summaries / mo",
            "Real-time transcription",
            "Basic action item extraction",
            "7 days of recording storage",
            "Standard email support"
          ]}
          delay={0.1}
        />
        
        <PriceCard
          highlighted
          tier="Professional"
          price="$49"
          description="Advanced collaboration tools for fast-growing organizations."
          features={[
            "Unlimited meeting duration",
            "Unlimited AI Meeting Summaries",
            "Advanced action item & owner extraction",
            "CRM & Project management integrations",
            "30 days of recording storage",
            "Priority 24/7 support",
            "Custom branding for meeting rooms"
          ]}
          delay={0.2}
          cta="Start Free Trial"
        />
        
        <PriceCard
          tier="Enterprise"
          price="Custom"
          description="Maximum security, governance, and scale for large organizations."
          features={[
            "Everything in Professional",
            "Dedicated AI model training",
            "SOC2 Type II & HIPAA compliance",
            "Enterprise-grade SSO (SAML/OIDC)",
            "Unlimited recording storage",
            "Dedicated Success Manager",
            "On-premise deployment options"
          ]}
          delay={0.3}
          cta="Contact Sales"
        />
      </div>

      <div className="mt-20 sm:mt-40">
        <div className="mb-10 sm:mb-16">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">Everything you need to know about our plans and features.</p>
        </div>
        
        <div className="max-w-3xl">
          <FAQItem 
            question="How do AI credits work?" 
            answer="AI credits are used for transcription and summary generation. Each minute of meeting uses 1 credit. Professional and Enterprise plans include unlimited credits, while the Starter plan has a monthly cap." 
          />
          <FAQItem 
            question="Can we switch plans at any time?" 
            answer="Yes, you can upgrade or downgrade your plan at any time from your billing dashboard. If you upgrade, the change will be effective immediately. If you downgrade, it will take effect at the end of your current billing cycle." 
          />
          <FAQItem 
            question="Is our meeting data secure?" 
            answer="Absolutely. All meetings are encrypted in transit and at rest. We do not use your private meeting data to train our public models. Enterprise clients can opt for dedicated, isolated instances." 
          />
          <FAQItem 
            question="Do you offer discounts for non-profits?" 
            answer="Yes, we offer a 50% discount for registered non-profit organizations and educational institutions. Please contact our support team to apply the discount to your account." 
          />
        </div>
      </div>

      <div className="mt-20 sm:mt-32 rounded-3xl bg-sky-500 p-8 sm:p-12 text-center text-white lg:p-20 shadow-2xl shadow-sky-500/20">
        <h2 className="text-2xl font-black sm:text-4xl lg:text-5xl">Building something big?</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-sky-100">
          Get in touch for a custom quote tailored to your organization's specific requirements and scale.
        </p>
        <button className="mt-8 sm:mt-10 rounded-full bg-white px-8 py-3 sm:px-10 sm:py-4 font-bold text-sky-600 hover:bg-sky-50 transition-all shadow-lg">
          Talk to an Expert
        </button>
      </div>
    </PageWrap>
  )
}

export default PricingPage

