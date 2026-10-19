import type { Metadata } from "next";
import { LockKeyhole, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "@/components/link";
import { Eyebrow } from "@/components/site";
import { env } from "cloudflare:workers";

export const metadata: Metadata = {
  title: "Founder Sign In | Quazar Labs",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ return_to?: string; error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: Props) {
  const q = await searchParams;
  const returnTo = q.return_to || "/admin";
  const hasError = q.error === "incorrect_password";

  const passwordRequired = Boolean(
    (typeof env !== "undefined" &&
      (env as Record<string, string | undefined>).ADMIN_PASSWORD) ||
      process.env.ADMIN_PASSWORD,
  );

  return (
    <section className="container admin-access">
      <LockKeyhole size={35} />
      <Eyebrow>THE FOUNDER WORKSPACE</Eyebrow>
      <h1>Founder Sign In</h1>
      <p>
        Sign in to manage courses, publish video lectures, reorder tracks, and
        upload lesson materials.
      </p>

      {hasError && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          <AlertCircle size={16} />
          <span>Incorrect password. Please try again.</span>
        </div>
      )}

      <form
        action="/api/auth/login"
        method="POST"
        style={{
          maxWidth: "380px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          textAlign: "left",
        }}
      >
        <input type="hidden" name="return_to" value={returnTo} />

        {passwordRequired ? (
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your admin password"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "#fff",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#f3f4f6",
              padding: "12px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#4b5563",
              lineHeight: 1.6,
            }}
          >
            No <code>ADMIN_PASSWORD</code> is set in environment variables. Click
            below to enter founder mode.
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Founder Name (Optional)
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Eshan or Chirag"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#fff",
            }}
          />
        </div>

        <button
          type="submit"
          className="button"
          style={{
            marginTop: "10px",
            justifyContent: "center",
            width: "100%",
            cursor: "pointer",
          }}
        >
          Access Founder Workspace →
        </button>
      </form>

      <div style={{ marginTop: "25px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#6b7280",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to public website
        </Link>
      </div>

      <p className="admin-login-note" style={{ marginTop: "30px" }}>
        To set or change the password, configure the <code>ADMIN_PASSWORD</code>{" "}
        variable in your Render environment variables or <code>.dev.vars</code>.
      </p>
    </section>
  );
}
