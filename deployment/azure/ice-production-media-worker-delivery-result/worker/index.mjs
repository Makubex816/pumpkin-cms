const TARGET_HOST = "media.iceskatingrinkrentals.com";
const ALLOWED_PATH_PREFIX = "/ice-rink-rentals/assets/";
const ORIGIN_BASE_URL = "https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media";
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

function buildOriginHeaders(request) {
  const headers = new Headers();

  for (const name of ["accept", "accept-encoding", "if-none-match", "if-modified-since", "range"]) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

export default {
  async fetch(request) {
    const requestUrl = new URL(request.url);

    if (requestUrl.hostname !== TARGET_HOST || !requestUrl.pathname.startsWith(ALLOWED_PATH_PREFIX)) {
      return new Response("Not found", {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", {
        status: 405,
        headers: {
          "Allow": "GET, HEAD",
          "Cache-Control": "no-store",
        },
      });
    }

    const originUrl = new URL(`${ORIGIN_BASE_URL}${requestUrl.pathname}`);
    const originResponse = await fetch(originUrl.toString(), {
      method: request.method,
      headers: buildOriginHeaders(request),
      redirect: "manual",
      cf: {
        cacheEverything: true,
        cacheTtl: 31536000,
      },
    });

    const responseHeaders = new Headers(originResponse.headers);
    responseHeaders.set("Cache-Control", IMMUTABLE_CACHE_CONTROL);
    responseHeaders.delete("Set-Cookie");

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });
  },
};
