import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, CheckCircle2, Keyboard, Sun, Smartphone, Sparkles, Mail, Heart } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.3, ease: 'easeOut', staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 }
};

export default function AccessibilityPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl pb-20 mx-auto"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">
          <Eye className="w-4 h-4" /> Universal Design & Access
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">Accessibility Statement</h1>
        <p className="text-[var(--muted-foreground)] text-xs sm:text-sm mt-1 leading-relaxed">
          Effective Date: August 2026 • Calyxo Health Technologies Private Limited • Bengaluru, Karnataka 560001, India
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-10 rounded-3xl border border-[var(--card-border)] shadow-2xl space-y-8 text-[var(--foreground)] text-xs sm:text-sm leading-relaxed">
        
        {/* Commitment Statement */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
          Calyxo is dedicated to creating an inclusive, empowering fitness and athletic health experience for everyone. We continuously design, engineer, and audit our web and mobile applications to ensure usability across diverse abilities, assistive technologies, and devices.
        </div>

        {/* 1. Core Principles */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 1. Inclusive Design Principles
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Our interfaces follow universal design principles aimed at removing barriers for athletes and users with visual, motor, auditory, cognitive, or situational constraints.
          </p>
        </section>

        {/* 2. Implemented Accessibility Features */}
        <section className="space-y-4">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> 2. Implemented Accessibility Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--card-border)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> High Contrast & Theming
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Light and Dark modes are engineered with verified color contrast ratios exceeding 7:1 for primary text and 4.5:1 for interactive elements to ensure clear readability.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--card-border)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" /> Keyboard Navigation
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Interactive dialogs, navigation drawers, form controls, and search panels support full keyboard navigation with visible focus indicators.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--card-border)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" /> Touch Target Sizing
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Mobile buttons, workout logging controls, and navigation elements adhere to minimum 44x44px touch targets to accommodate varying motor dexterity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--card-border)] space-y-2">
              <h4 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Assistive Technology & ARIA
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Semantic HTML5 landmarks (`&lt;main&gt;`, `&lt;nav&gt;`, `&lt;section&gt;`) and descriptive `aria-label` attributes provide context to screen readers on Web, iOS VoiceOver, and Android TalkBack.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Motion and Visual Sensitivity */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Heart className="w-4 h-4" /> 3. Motion & Cognitive Considerations
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Our animation systems respect operating system `prefers-reduced-motion` settings. Dynamic workout timers provide multi-modal auditory, visual, and haptic feedback rather than relying on color alone.
          </p>
        </section>

        {/* 4. Known Limitations & Ongoing Efforts */}
        <section className="space-y-3">
          <h3 className="text-base font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Eye className="w-4 h-4" /> 4. Continuous Improvement & Known Limitations
          </h3>
          <p className="text-[var(--muted-foreground)]">
            While we strive for comprehensive accessibility, certain complex real-time charts (e.g., dynamic 3D health models and granular canvas charts) may offer simplified tabular text alternatives. We are actively refining screen-reader descriptions for real-time biological telemetry.
          </p>
        </section>

        {/* 5. Feedback & Support */}
        <section className="space-y-3 p-5 rounded-2xl bg-[var(--surface-subtle)] border border-[var(--card-border)]">
          <h3 className="text-base font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" /> 5. Feedback & Assistance
          </h3>
          <p className="text-[var(--muted-foreground)]">
            If you encounter any difficulty accessing content, navigating features, or using assistive technologies with Calyxo, please let us know. We prioritize accessibility bug reports and actively incorporate user feedback into our release cycle.
          </p>
          <div className="pt-2">
            <a 
              href="mailto:support@calyxo.app?subject=Accessibility%20Feedback"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" /> Email Accessibility Team (support@calyxo.app)
            </a>
          </div>
        </section>

      </motion.div>
    </motion.div>
  );
}
