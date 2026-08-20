import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Mail } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 }
};

export default function SupportPage() {
  const faqs = [
    { q: "How do I connect with my personal trainer?", a: "Navigate to the 'My Coach' tab in the navigation menu. Enter your trainer's invite code or browse available trainer profiles to send a connection request. Once accepted, your coach can assign custom workouts and nutrition guidelines." },
    { q: "What is the AI Health Twin?", a: "The AI Health Twin compiles your logged metrics, sleeping schedule, and daily calorie burns to compute a daily health recovery score (0-100%) and project weight predictions for the next 30 to 180 days." },
    { q: "How can I edit my daily calorie targets?", a: "Go to your 'Profile' page. Tap 'Adjust Biometrics' to update your weight, height, age, activity level, and goal (gains, maintenance, weight loss). The system will automatically recalculate your baseline targets." }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">Help & Support</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">Get answers to questions and contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-[var(--surface)] border border-[var(--card-border)] p-5 rounded-2xl">
              <h4 className="font-bold text-sm text-[var(--foreground)]">{faq.q}</h4>
              <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--card-border)] h-fit space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-black text-lg text-[var(--foreground)]">Still Need Help?</h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">Our athletic support team is available 24/7. Reach out directly and we will get back to you within 12 hours.</p>
          <a href="mailto:support@calyxo.com" className="block w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all">
            Contact Support
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
