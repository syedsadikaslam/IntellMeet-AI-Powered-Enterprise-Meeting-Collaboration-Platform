import { motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function PageWrap({ children, className = "" }) {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-20 lg:px-8 ${className}`}
    >
      {children}
    </motion.section>
  )
}

export function PageHero({ kicker, title, description, centered = false }) {
  return (
    <div className={`mb-12 sm:mb-20 max-w-4xl ${centered ? 'mx-auto text-center' : ''}`}>
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 inline-flex rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-sky-400 shadow-sm backdrop-blur-md"
      >
        {kicker}
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.1]"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 sm:mt-6 text-base leading-relaxed text-slate-400 sm:text-xl"
      >
        {description}
      </motion.p>
    </div>
  )
}

export function CardGrid({ children, columns = 3 }) {
  const gridCols = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  }
  
  return (
    <section className={`grid gap-8 ${gridCols[columns] || 'md:grid-cols-3'}`}>
      {children}
    </section>
  )
}

export function InfoCard({ title, children, icon: Icon, delay = 0 }) {
  return (
    <motion.article 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl transition-all hover:border-sky-500/30 hover:bg-white/[0.07]"
    >
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      {Icon && (
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
          <Icon size={24} />
        </div>
      )}
      
      <h2 className="relative mb-4 text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">{title}</h2>
      <div className="relative space-y-4 text-base leading-relaxed text-slate-400">{children}</div>
    </motion.article>
  )
}

export function Checklist({ items }) {
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-slate-300">
          <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-sm leading-tight">{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function PriceCard({ tier, price, description, features, highlighted = false, cta = "Get Started", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`relative flex flex-col rounded-3xl p-6 sm:p-8 transition-all ${
        highlighted 
          ? 'bg-white/10 ring-2 ring-sky-500 shadow-[0_0_50px_-12px_rgba(14,165,233,0.3)]' 
          : 'bg-white/5 border border-white/10 hover:border-white/20'
      }`}
    >
      {highlighted && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white">{tier}</h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>
      
      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-4xl font-black text-white">{price}</span>
        {price !== 'Custom' && <span className="text-slate-400">/mo</span>}
      </div>
      
      <div className="mb-10 flex-1">
        <Checklist items={features} />
      </div>
      
      <button className={`w-full rounded-2xl py-4 text-sm font-bold transition-all ${
        highlighted 
          ? 'bg-sky-500 text-white hover:bg-sky-400 hover:scale-[1.02] shadow-lg shadow-sky-500/20' 
          : 'bg-white/10 text-white hover:bg-white/15'
      }`}>
        {cta}
      </button>
    </motion.div>
  )
}

export function FeatureRow({ title, description, image, reversed = false, features = [] }) {
  return (
    <div className={`flex flex-col gap-10 sm:gap-12 py-10 sm:py-20 lg:flex-row lg:items-center ${reversed ? 'lg:flex-row-reverse' : ''}`}>
      <div className="flex-1 lg:order-last">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative aspect-video overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-transparent mix-blend-overlay" />
          {image ? (
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-900/50 backdrop-blur-sm">
               <span className="text-slate-500 font-mono text-xs uppercase tracking-widest text-center px-4">Platform Interface Preview</span>
            </div>
          )}
        </motion.div>
      </div>

      <div className="flex-1 lg:order-first">
        <h2 className="mb-4 text-2xl font-black text-white sm:text-4xl lg:text-5xl leading-tight">{title}</h2>
        <p className="mb-6 text-base text-slate-400 leading-relaxed sm:text-lg">{description}</p>
        {features.length > 0 && <Checklist items={features} />}
      </div>
    </div>
  )
}

export function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b border-white/10 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">{question}</span>
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-slate-500"
        >
            <ChevronDown size={20} />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="mt-4 text-slate-400 leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  )
}

