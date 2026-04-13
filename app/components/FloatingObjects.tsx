"use client";

export default function FloatingObjects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div 
        className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full blur-[100px] opacity-10 animate-drift-slow"
        style={{ background: "var(--color-primary)" }}
      />
      <div 
        className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full blur-[120px] opacity-[0.08] animate-drift-delay"
        style={{ background: "var(--color-bg-elevated)" }}
      />
      <div 
        className="absolute top-[50%] right-[30%] w-48 h-48 rounded-full blur-[80px] opacity-5 animate-drift-slow"
        style={{ background: "var(--color-text-primary)" }}
      />
    </div>
  );
}
