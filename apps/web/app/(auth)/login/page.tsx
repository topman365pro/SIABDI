import { redirectIfAuthenticated } from "@/lib/auth/guards";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Sistem Absensi Sekolah
          </p>
          <h1 className="mt-4 max-w-3xl text-6xl font-semibold leading-[1.04]">
            Flat, cepat, dan disiplin untuk absensi per jam.
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-600">
            Satu workspace untuk operasional guru, BK, kesiswaan, admin, dan orang tua dengan status yang selalu
            sinkron.
          </p>
        </section>
        <div className="flex justify-center lg:justify-end">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
