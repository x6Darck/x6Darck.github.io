import type { ReactNode } from 'react';

export function Laptop({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`laptop ${className}`}>
      <div className="laptop-lid"><span className="laptop-cam" /><div className="laptop-screen">{children}</div></div>
      <div className="laptop-base" />
    </div>
  );
}

export function DesktopWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="winframe">
      <div className="flex h-10 items-center justify-between border-b border-line px-4">
        <span className="mono text-[0.75rem] text-faint">{title}</span>
        <span className="flex gap-3 text-faint" aria-hidden="true"><i className="block h-[2px] w-3 self-center bg-current" /><i className="block h-3 w-3 border border-current" /><i className="block h-3 w-3 leading-[0.7]">×</i></span>
      </div>
      {children}
    </div>
  );
}
