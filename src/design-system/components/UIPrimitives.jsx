import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, ChevronRight, ChevronLeft, AlertCircle, X, Check } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const triggerHaptic = async (style = ImpactStyle.Light) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  } catch (e) {}
};

/**
 * Modern Athletic Button
 * Enforces thumb-friendly 44px+ min touch target and tactile press feedback.
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
  icon: Icon,
  type = 'button',
  ...props
}) {
  const handleClick = (e) => {
    if (disabled || loading) return;
    triggerHaptic(ImpactStyle.Medium);
    if (onClick) onClick(e);
  };

  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight rounded-2xl select-none transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer border';
  
  const sizeStyles = {
    sm: 'min-h-[40px] px-3.5 py-1.5 text-xs gap-1.5',
    md: 'min-h-[48px] px-5 py-2.5 text-sm gap-2',
    lg: 'min-h-[56px] px-7 py-3.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-accent text-accent-foreground border-accent shadow-sm hover:brightness-110 active:brightness-95',
    secondary: 'bg-surface-elevated text-foreground border-border hover:bg-surface-interactive',
    outline: 'bg-transparent text-foreground border-border hover:bg-surface/60',
    ghost: 'bg-transparent text-foreground border-transparent hover:bg-surface/50',
    danger: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 text-current" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

/**
 * 44px Minimum Touch Target Icon Button
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'ghost', // 'ghost' | 'surface' | 'accent'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  ...props
}) {
  const handleClick = (e) => {
    if (disabled) return;
    triggerHaptic(ImpactStyle.Light);
    if (onClick) onClick(e);
  };

  const sizeStyles = {
    sm: 'w-10 h-10',
    md: 'w-11 h-11',
    lg: 'w-13 h-13'
  };

  const variantStyles = {
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface/60 border border-transparent',
    surface: 'bg-surface text-foreground border border-card-border hover:bg-surface-elevated',
    accent: 'bg-accent text-accent-foreground border border-accent shadow-sm'
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 text-current" />}
    </button>
  );
}

/**
 * Premium Content Card
 */
export function Card({
  children,
  className = '',
  elevated = false,
  onClick,
  ...props
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl sm:rounded-3xl border border-card-border p-4 sm:p-5 transition-all ${
        elevated ? 'bg-surface-elevated shadow-card' : 'bg-surface shadow-sm'
      } ${isClickable ? 'cursor-pointer active:scale-[0.99] hover:border-card-border/80' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * High-Readability Metric Card
 */
export function MetricCard({
  label,
  value,
  unit = '',
  subtext = '',
  icon: Icon,
  trend = null, // { value: '+4.2%', positive: true }
  accentColor = 'text-accent',
  className = '',
  onClick
}) {
  return (
    <Card className={`flex flex-col justify-between ${className}`} onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-surface-elevated border border-card-border/60 text-muted-foreground">
            <Icon className="w-4 h-4 text-current" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`text-2xl sm:text-3xl font-black font-mono leading-none tracking-tight ${accentColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-bold text-muted-foreground font-mono">
            {unit}
          </span>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground font-medium">
          {subtext && <span>{subtext}</span>}
          {trend && (
            <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md ${
              trend.positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-destructive/15 text-destructive'
            }`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Animated Progress Bar
 */
export function ProgressBar({
  current = 0,
  max = 100,
  color = 'var(--accent, #CCFF00)',
  height = 'h-2',
  className = '',
  showLabel = false,
  label = ''
}) {
  const percentage = Math.min(100, Math.max(0, (current / Math.max(max, 1)) * 100));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-foreground">{label}</span>
          <span className="font-mono text-muted-foreground font-semibold">
            {current} / {max}
          </span>
        </div>
      )}
      <div className={`w-full ${height} bg-surface-elevated rounded-full overflow-hidden border border-card-border/50`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

/**
 * Filter Chip
 */
export function Chip({
  label,
  selected = false,
  onClick,
  icon: Icon,
  count = null,
  className = ''
}) {
  const handleClick = () => {
    triggerHaptic(ImpactStyle.Light);
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0 select-none border ${
        selected
          ? 'bg-accent text-accent-foreground border-accent shadow-sm'
          : 'bg-surface text-muted-foreground border-card-border hover:border-card-border/80 hover:text-foreground'
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 text-current" />}
      <span>{label}</span>
      {count !== null && (
        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
          selected ? 'bg-black/20 text-black' : 'bg-surface-elevated text-muted-foreground'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Segmented Control (iOS style switcher)
 */
export function SegmentedControl({
  options = [], // [{ id: 'all', label: 'All' }]
  value,
  onChange,
  className = ''
}) {
  return (
    <div className={`bg-surface border border-card-border p-1 rounded-2xl flex gap-1 overflow-x-auto scrollbar-none ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              triggerHaptic(ImpactStyle.Light);
              onChange(opt.id);
            }}
            className={`flex-1 min-h-[40px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center select-none border-none ${
              isSelected
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground bg-transparent'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Deliberate Empty State conforming to Section 55
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel = null,
  onAction = null,
  className = ''
}) {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-3xl bg-surface border border-dashed border-card-border flex flex-col items-center justify-center space-y-4 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h3 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Apple-style Navigation Header with optional large title and actions
 */
export function NavigationHeader({
  title,
  subtitle = '',
  onBack = null,
  rightAction = null,
  large = true,
  className = ''
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between min-h-[44px]">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 -ml-2 px-2 py-1 text-sm font-semibold text-accent hover:opacity-80 cursor-pointer bg-transparent border-none transition-opacity"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Back</span>
          </button>
        ) : <div />}

        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <h1 className={`${large ? 'text-2xl sm:text-3xl' : 'text-xl'} font-black text-foreground tracking-tight`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Section Header for grouped content
 */
export function SectionHeader({
  title,
  subtitle = '',
  actionLabel = '',
  onAction = null,
  className = ''
}) {
  return (
    <div className={`flex items-baseline justify-between mb-3 px-1 ${className}`}>
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground/80 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-xs font-bold text-accent hover:underline bg-transparent border-none cursor-pointer transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Apple Settings / Health style Grouped List Row
 */
export function ListRow({
  icon: Icon,
  iconColor = 'text-accent',
  iconBg = 'bg-accent/10',
  title,
  subtitle = '',
  trailing = null,
  onClick = null,
  showChevron = false,
  destructive = false,
  className = ''
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      className={`min-h-[52px] flex items-center justify-between py-3 px-4 transition-colors select-none ${
        isClickable ? 'cursor-pointer hover:bg-surface-interactive active:bg-surface-elevated' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className={`text-sm font-semibold truncate ${destructive ? 'text-destructive' : 'text-foreground'}`}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {trailing && <div className="text-xs text-muted-foreground font-medium">{trailing}</div>}
        {showChevron && <ChevronRight className="w-4 h-4 text-muted-foreground/60" />}
      </div>
    </div>
  );
}

/**
 * Inline Metric Display
 */
export function MetricRow({
  label,
  value,
  unit = '',
  trend = null,
  icon: Icon,
  className = ''
}) {
  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-subtle border border-card-border/60 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 font-mono">
        <span className="text-sm font-black text-foreground">{value}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
        {trend && (
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${trend.positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-destructive bg-destructive/10'}`}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Circular Progress Ring (Apple Activity inspired)
 */
export function ProgressRing({
  progress = 0,
  size = 56,
  strokeWidth = 5,
  color = 'var(--accent, #059669)',
  trackColor = 'rgba(255, 255, 255, 0.08)',
  children = null,
  className = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Apple-style Switch Toggle with Haptic feedback
 */
export function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label = '',
  description = '',
  className = ''
}) {
  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic(ImpactStyle.Light);
    if (onChange) onChange(!checked);
  };

  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${className}`}>
      {label && (
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
          checked ? 'bg-accent' : 'bg-surface-elevated'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

/**
 * Apple-style Loading State
 */
export function LoadingState({
  message = 'Loading...',
  className = ''
}) {
  return (
    <div className={`min-h-[220px] flex flex-col items-center justify-center space-y-3 p-8 text-center ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-accent" />
      <p className="text-xs font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Apple-style Error State
 */
export function ErrorState({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred. Please check connection and try again.',
  onRetry = null,
  className = ''
}) {
  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-3 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mx-auto">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * Mobile-First Spring Sheet Modal
 */
export function Sheet({
  isOpen = false,
  onClose,
  title = '',
  children,
  className = ''
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div 
        className={`relative w-full sm:max-w-lg bg-surface border border-card-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl z-10 ${className}`}
      >
        {/* Drag handle pill */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto sm:hidden mb-2" />

        <div className="flex items-center justify-between border-b border-card-border pb-3">
          <h3 className="text-base font-black text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface-elevated text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

/**
 * Modern Athletic Form Input
 */
export function Input({
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`w-full h-11 px-3.5 ${Icon ? 'pl-10' : ''} bg-surface-elevated text-foreground text-sm font-medium rounded-xl border border-card-border/80 focus:border-accent focus:outline-none transition-all placeholder:text-muted-foreground/60 ${error ? 'border-destructive focus:border-destructive' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
