import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import {
  getChatGPTUser,
  chatGPTSignInPath,
  chatGPTSignOutPath,
} from "@/app/chatgpt-auth";
import { adminUser, snapshot } from "@/lib/server";
import AdminEditor from "@/components/admin-editor";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Founder editor",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const user = await getChatGPTUser();
  if (!user)
    return (
      <section className="container admin-access">
        <LockKeyhole size={35} />
        <p className="eyebrow">THE FOUNDER WORKSPACE</p>
        <h1>A little behind the scenes.</h1>
        <p>
          Sign in with an authorised founder account to manage courses, publish
          lessons, and upload teaching materials.
        </p>
        <a className="button" href={chatGPTSignInPath("/admin")} target="_top">
          Sign in with ChatGPT →
        </a>
        <p className="admin-login-note">
          {process.env.NODE_ENV !== "production"
            ? "Local preview: sign-in uses a development account. Hosted sign-in will use your configured founder accounts."
            : "Students can explore all public lessons without an account."}
        </p>
      </section>
    );
  if (!(await adminUser()))
    return (
      <section className="container admin-access">
        <LockKeyhole size={35} />
        <h1>This workspace is private.</h1>
        <p>
          Your account is signed in, but it isn’t authorised to edit Quazar
          Labs. Use one of the configured founder accounts.
        </p>
        <a
          className="button button-secondary"
          href={chatGPTSignOutPath("/admin")}
          target="_top"
        >
          Sign out
        </a>
      </section>
    );
  return (
    <AdminEditor
      initial={await snapshot()}
      displayName={user.displayName}
      signOutPath={chatGPTSignOutPath("/")}
    />
  );
}
