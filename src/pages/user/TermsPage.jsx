import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Heart, Activity, Sparkles, Shield, Mail } from 'lucide-react';

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

export default function TermsPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl pb-16"
    >
      <div>
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-1">
          <Scale className="w-4 h-4" /> Statutory User Agreement
        </div>
        <h1 className="text-3xl font-black text-[var(--foreground)]">Terms of Service</h1>
        <p className="text-[var(--muted-foreground)] text-sm mt-1">
          Governed under the Indian Contract Act 1872 & International Consumer Standards • Last Revised: 2026
        </p>
      </div>

      <motion.div variants={itemVariants} className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-[var(--card-border)] shadow-lg space-y-6 text-[var(--foreground)] text-xs leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> 1. Acceptance of Terms & Legal Capacity
          </h3>
          <p className="text-[var(--muted-foreground)]">
            By creating an account, downloading, accessing, or using Calyxo, you enter into a legally binding contract with Calyxo Health Technologies under the <strong>Indian Contract Act, 1872</strong>. You represent that you are at least 18 years old (or at least 13 with parental consent) and legally capable of entering into binding contracts.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> 2. Comprehensive Medical & Health Disclaimer (STATUTORY NOTICE)
          </h3>
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 space-y-2">
            <p className="font-bold text-destructive text-[11px] leading-relaxed">
              CALYXO IS NOT A MEDICAL DEVICE, MEDICAL PRACTITIONER, CLINICAL PROVIDER, OR EMERGENCY SERVICE.
            </p>
            <p className="text-[var(--muted-foreground)] text-[11px] leading-relaxed">
              All fitness routines, caloric computations, macronutrient targets, rest interval countdowns, and AI-generated wellness insights are provided strictly for general athletic conditioning, recreational fitness tracking, and educational purposes. Calyxo does not provide medical diagnosis, treatment, prescription, or clinical monitoring.
            </p>
            <p className="text-[var(--muted-foreground)] text-[11px] leading-relaxed">
              <strong>Mandatory Consultation:</strong> You must consult a licensed medical physician or certified healthcare professional before initiating any new workout split, strenuous weight training program, or caloric deficit. If at any time you experience dizziness, shortness of breath, chest pain, or physical discomfort during exercise, STOP IMMEDIATELY and seek professional emergency medical care.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 3. Voluntary Assumption of Risk & Total Liability Release
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Athletic conditioning and physical exercise inherently involve risks of injury (including, without limitation, muscle strains, ligament tears, fractures, cardiovascular stress, or adverse dietary reactions). To the maximum extent permitted by applicable law, you knowingly, freely, and voluntarily assume all known and unknown risks associated with your training, and release Calyxo, its directors, developers, and affiliated trainers from any and all liability, claims, or damages arising out of your use of the application.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> 4. Subscriptions, In-App Purchases & Payments
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Certain advanced capabilities (Calyxo High, AI Twin programs, annual passes) are billed on a recurring subscription basis. Payments are processed securely via authorized payment aggregators (Razorpay / Apple In-App Purchases) in compliance with Reserve Bank of India (RBI) tokenization guidelines and Apple Store Commerce rules. You may cancel recurring renewals at any time prior to the billing cycle directly through your Account Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> 5. Intellectual Property & Acceptable Use
          </h3>
          <p className="text-[var(--muted-foreground)]">
            All code, UI designs, 3D visualizations, workout algorithms, trademarks, and logos are the exclusive intellectual property of Calyxo. You agree not to reverse-engineer, decompile, scrape, copy, or disrupt Calyxo's systems, APIs, or trainer directories.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Scale className="w-4 h-4" /> 6. Dispute Resolution, Governing Law & Jurisdiction
          </h3>
          <p className="text-[var(--muted-foreground)]">
            These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of India</strong>. Any dispute, claim, or controversy arising out of these Terms shall be resolved by binding arbitration under the <strong>Arbitration and Conciliation Act, 1996</strong> in Bengaluru, Karnataka, India. The courts in <strong>Bengaluru, Karnataka</strong> shall have exclusive jurisdiction.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 7. Legal Contact
          </h3>
          <p className="text-[var(--muted-foreground)]">
            For legal inquiries, notices, or support, contact our compliance team at <a href="mailto:support@calyxo.com" className="text-emerald-400 font-bold underline">support@calyxo.com</a>.
          </p>
        </section>
      </motion.div>
    </motion.div>
  );
}
