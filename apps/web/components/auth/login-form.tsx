"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginRequest } from "@/lib/api/client";
import {
  DEFAULT_API_BASE_URL,
  getClientApiBaseUrl,
  isValidApiBaseUrl,
  persistClientApiBaseUrl,
  resetClientApiBaseUrl
} from "@/lib/api/endpoint";
import { getPrimaryRole, getRoleHomePath } from "@/lib/auth/roles";
import { persistSession } from "@/lib/auth/session";

const schema = z.object({
  username: z.string().min(3, "Username wajib diisi."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  apiBaseUrl: z
    .string()
    .min(1, "API endpoint wajib diisi.")
    .refine(isValidApiBaseUrl, "Masukkan URL API yang valid, contoh: http://IP-VPS:3000/api/v1")
});

type LoginFormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      apiBaseUrl: DEFAULT_API_BASE_URL
    }
  });

  useEffect(() => {
    form.setValue("apiBaseUrl", getClientApiBaseUrl(), { shouldValidate: true });
  }, [form]);

  function useSavedEndpoint() {
    const current = getClientApiBaseUrl();
    form.setValue("apiBaseUrl", current, { shouldValidate: true });
  }

  function useDefaultEndpoint() {
    resetClientApiBaseUrl();
    form.setValue("apiBaseUrl", DEFAULT_API_BASE_URL, { shouldValidate: true });
  }

  async function onSubmit(values: LoginFormValues) {
    form.clearErrors("root");

    try {
      persistClientApiBaseUrl(values.apiBaseUrl);
      const session = await loginRequest(values.username, values.password);
      persistSession(session);
      const primaryRole = getPrimaryRole(session.user.roleCodes);
      router.replace(redirect || (primaryRole ? getRoleHomePath(primaryRole) : "/login"));
    } catch {
      form.setError("root", {
        message: "Login gagal. Pastikan username dan password benar."
      });
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onSubmit={form.handleSubmit(onSubmit)}
      className="glass-panel w-full max-w-md rounded-[32px] p-6 shadow-panel md:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
        Masuk ke Sistem
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight">Absensi sekolah yang rapi dan real-time.</h1>
      <p className="mt-3 text-sm text-slate-600">
        Satu login untuk guru, BK, kesiswaan, admin, dan orang tua.
      </p>

      <div className="mt-6 rounded-[22px] border border-line bg-white/60 p-4">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            API Endpoint
          </span>
          <input
            {...form.register("apiBaseUrl")}
            className="w-full rounded-[16px] border border-line bg-canvas px-4 py-3 text-sm outline-none"
            placeholder="http://IP-VPS:3000/api/v1"
          />
          {form.formState.errors.apiBaseUrl ? (
            <p className="text-sm text-[var(--color-danger)]">
              {form.formState.errors.apiBaseUrl.message}
            </p>
          ) : (
            <p className="text-xs leading-relaxed text-slate-500">
              Untuk VPS, isi dengan alamat API yang bisa diakses browser, misalnya
              {" "}http://domain-anda:3000/api/v1.
            </p>
          )}
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={useSavedEndpoint}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            Pakai tersimpan
          </button>
          <button
            type="button"
            onClick={useDefaultEndpoint}
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            Reset default
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Username</span>
          <input
            {...form.register("username")}
            className="w-full rounded-[20px] border border-line bg-canvas px-4 py-3 outline-none"
            placeholder="Masukkan username"
          />
          {form.formState.errors.username ? (
            <p className="text-sm text-[var(--color-danger)]">{form.formState.errors.username.message}</p>
          ) : null}
        </label>
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Password</span>
          <input
            type="password"
            {...form.register("password")}
            className="w-full rounded-[20px] border border-line bg-canvas px-4 py-3 outline-none"
            placeholder="Masukkan password"
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-[var(--color-danger)]">{form.formState.errors.password.message}</p>
          ) : null}
        </label>
      </div>

      {form.formState.errors.root ? (
        <p className="mt-4 rounded-[18px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {form.formState.errors.root.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="mt-6 w-full rounded-full bg-[var(--color-accent)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-70"
      >
        {form.formState.isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </motion.form>
  );
}
