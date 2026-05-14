export default function DemoBanner() {
  return (
    <div className="absolute left-1/2 z-50 -translate-x-1/2 rounded-b-2xl bg-amber-400 px-6 py-2 shadow-md">
      <div className="flex items-center gap-3 text-sm font-medium text-amber-900">
        <span>You&apos;re viewing a live demo - explore freely.</span>
        <a
          href="https://instructr.uk/sign-in"
          className="rounded-md bg-amber-900 px-3 py-1 text-xs font-semibold text-amber-50 transition-opacity hover:opacity-80"
        >
          Sign in →
        </a>
      </div>
    </div>
  );
}
