const fallbackSiteUrl = "http://localhost:3000";

function withProtocol(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    process.env.VERCEL_URL;

  if (!configuredUrl) {
    return fallbackSiteUrl;
  }

  try {
    const parsedUrl = new URL(withProtocol(configuredUrl));
    return parsedUrl.origin;
  } catch {
    return fallbackSiteUrl;
  }
}
