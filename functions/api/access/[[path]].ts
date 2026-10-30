const appId = "app_copybook";
const cookieName = "copybook_access";
const idPattern = /^[a-z0-9][a-z0-9_-]{0,95}$/;
const tokenPattern = /^[a-f0-9]{64}$/;

function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: {
    "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store",
    "Vary": "Cookie", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", ...extra,
  } });
}
function failure(status: number, message: string) { return json({ error: { message } }, status); }
function session(request: Request) {
  const value = request.headers.get("Cookie")?.split(";").map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || "";
  return tokenPattern.test(value) ? value : "";
}

export const onRequest: PagesFunction<Cloudflare.Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/access\//, "");
  if (!env.LICENSE_CENTER) return failure(503, "授权服务暂未连接，请稍后重试。");
  try {
    if (path === "unlock" && request.method === "POST") {
      if (request.headers.get("Origin") !== url.origin || !request.headers.get("Content-Type")?.startsWith("application/json")) return failure(403, "请在本站输入激活码。");
      // Bound the actual stream; Content-Length alone is not a reliable limit.
      const reader = request.body?.getReader();
      if (!reader) return failure(400, "请输入激活码。");
      let size = 0; const chunks: Uint8Array[] = [];
      while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2048) { await reader.cancel(); return failure(413, "请求内容过长。"); } chunks.push(value); }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let body: { resource_id?: unknown; code?: unknown };
      try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return failure(400, "请输入有效激活码。"); }
      if (!body || typeof body.resource_id !== "string" || !idPattern.test(body.resource_id) || typeof body.code !== "string" || body.code.length > 128 || body.code.trim().length < 8) return failure(400, "请输入有效激活码。");
      const upstream = await env.LICENSE_CENTER.fetch("https://license.internal/api/v1/anonymous/activate", {
        method: "POST", headers: { "Content-Type": "application/json", "CF-Connecting-IP": request.headers.get("CF-Connecting-IP") || "unknown" },
        body: JSON.stringify({ app_id: appId, resource_id: body.resource_id, license_code: body.code, session_token: session(request) }),
      });
      const data = await upstream.json() as { session_token?: string; session_expires_at?: string; error?: { message?: string } };
      if (!upstream.ok) return failure(upstream.status, data.error?.message || "激活码验证失败，请重试。");
      if (!data.session_token || !tokenPattern.test(data.session_token) || !data.session_expires_at) return failure(503, "授权服务响应异常，请重试。");
      const expires = new Date(data.session_expires_at).getTime();
      if (!Number.isFinite(expires) || expires <= Date.now()) return failure(503, "授权服务响应异常，请重试。");
      const maxAge = Math.min(2592000, Math.max(1, Math.floor((expires - Date.now()) / 1000)));
      const secure = url.protocol === "https:" ? "; Secure" : "";
      return json({ success: true, resource_id: body.resource_id }, 200, { "Set-Cookie": `${cookieName}=${data.session_token}; Path=/api/access/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}` });
    }
    const match = path.match(/^resources\/([a-z0-9][a-z0-9_-]{0,95})$/);
    if (match && request.method === "GET") {
      const token = session(request);
      if (!token) return failure(401, "请输入本资源的激活码。");
      const upstream = await env.LICENSE_CENTER.fetch(`https://license.internal/api/v1/anonymous/resources/${match[1]}?app_id=${appId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!upstream.headers.get("Content-Type")?.includes("application/json")) return failure(503, "授权服务暂不可用，请重试。");
      return new Response(upstream.body, { status: upstream.status, headers: json(null).headers });
    }
    return failure(404, "接口不存在。");
  } catch { return failure(503, "授权服务暂不可用，请稍后重试。"); }
};
