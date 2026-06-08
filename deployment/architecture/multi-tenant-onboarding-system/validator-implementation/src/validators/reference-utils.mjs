export function getDocumentsByRole(parsedDocuments, role) {
  return [...parsedDocuments.values()].filter((document) => document.role === role);
}

export function walkValues(value, visitor, pointer = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkValues(item, visitor, `${pointer}/${index}`));
    return;
  }

  if (value && typeof value === "object") {
    visitor(value, pointer || "/");
    for (const [key, child] of Object.entries(value)) {
      walkValues(child, visitor, `${pointer}/${escapePointer(key)}`);
    }
    return;
  }

  visitor(value, pointer || "/");
}

export function walkStringValues(document, visitor) {
  walkValues(document.data, (value, pointer) => {
    if (typeof value === "string") {
      visitor(value, pointer, pointerField(pointer));
    }
  });
}

export function collectReferences(document, referenceKeys) {
  const references = [];

  walkValues(document.data, (value, pointer) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      if (!referenceKeys.has(key)) {
        continue;
      }

      const childPointer = `${pointer === "/" ? "" : pointer}/${escapePointer(key)}`;
      if (typeof child === "string" && child.trim()) {
        references.push({ ref: child.trim(), pointer: childPointer, field: key });
      } else if (Array.isArray(child)) {
        child.forEach((item, index) => {
          if (typeof item === "string" && item.trim()) {
            references.push({ ref: item.trim(), pointer: `${childPointer}/${index}`, field: key });
          }
        });
      }
    }
  });

  return references;
}

export function normalizeRoutePath(route) {
  if (route === "/") {
    return "/";
  }
  if (typeof route !== "string") {
    return null;
  }
  const withLeadingSlash = route.startsWith("/") ? route : `/${route}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function canonicalHostForSite(site) {
  if (!site) {
    return null;
  }
  return site.canonicalHost === "www" ? site.wwwDomain : site.primaryDomain;
}

export function parseHttpUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isProductionReady({ manifest, tenant, seo }) {
  return manifest?.validation?.status === "pass" || tenant?.status === "import-package-valid" || seo?.defaultRobots === "index,follow";
}

export function pointerField(pointer) {
  const parts = String(pointer).split("/").filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  return unescapePointer(parts.at(-1));
}

export function escapePointer(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}

export function unescapePointer(value) {
  return String(value).replaceAll("~1", "/").replaceAll("~0", "~");
}
