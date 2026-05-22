// UI Components - Premium Design System

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300',
    new: 'badge--new',
    preparing: 'badge--preparing',
    ready: 'badge--ready',
    closed: 'badge--closed',
    primary: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    accent: 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
  };
  
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', elevated = false, onClick }) => (
  <div 
    className={`card ${elevated ? 'card--elevated' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const variants = {
    primary: 'btn-primary',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    outline: 'px-4 py-2 rounded-lg font-medium border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-all'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button 
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ className = '', ...props }) => (
  <input className={`input ${className}`} {...props} />
);

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-shimmer rounded-lg bg-zinc-800 ${className}`} />
);

export default { Badge, Card, Button, Input, Skeleton };
