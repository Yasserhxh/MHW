import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_minmax(440px,560px)]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_42%),linear-gradient(160deg,#082f35_0%,#0f172a_52%,#020617_100%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between px-12 py-14">
            <div className="max-w-md">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-teal-100/90">
                Moroccan Household Wallet
              </div>
              <h1 className="mt-8 text-4xl font-semibold leading-tight text-white">
                Calm control for daily spending, shared costs, and household routines.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Built for real homes, not finance teams. Track what matters fast, stay on top of bills,
                and keep shared money transparent without dashboard noise.
              </p>
            </div>

            <div className="grid max-w-xl gap-4 text-sm text-slate-200">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="text-xs uppercase tracking-[0.2em] text-teal-100/80">At a glance</div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-3xl font-semibold text-white">MAD 2,110</span>
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-200">
                    Remaining this month
                  </span>
                </div>
                <p className="mt-2 text-slate-300">Upcoming bills, shared balances, and reminders stay visible in one calm workspace.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Shared expenses made easier for roommates and families.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Realtime reminders and notifications without overwhelming the screen.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbfb_0%,#eef5f5_100%)] px-5 py-10 sm:px-8">
          <div className="w-full max-w-xl">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}
