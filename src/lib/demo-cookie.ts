/** Set when "Try demo" is active so middleware allows app routes without Supabase session. */
export const DEMO_COOKIE_NAME = "hidayah_demo";

export function setDemoCookieClient(on: boolean): void {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  if (on) {
    document.cookie = `${DEMO_COOKIE_NAME}=1; path=/; max-age=86400; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
}
