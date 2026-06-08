import { createFinding } from "../gate-status.mjs";
import { ErrorCode } from "../error-codes.mjs";
import { collectReferences, getDocumentsByRole, parseHttpUrl } from "./reference-utils.mjs";

const mediaReferenceKeys = new Set([
  "mediaId",
  "mediaIds",
  "mediaRef",
  "mediaRefs",
  "mediaAssetId",
  "mediaAssetIds",
  "imageId",
  "imageMediaId",
  "logoMediaId",
  "backgroundMediaId",
  "heroMediaId"
]);

export function validateMediaReferences(parsedDocuments) {
  const findings = [];
  const site = parsedDocuments.get("site.json")?.data;
  const media = parsedDocuments.get("media-assets.json")?.data;
  const pages = getDocumentsByRole(parsedDocuments, "page");
  const assets = Array.isArray(media?.assets) ? media.assets : [];
  const mediaIds = new Map();
  const referencedIds = new Set();

  assets.forEach((asset, index) => {
    const pointer = `/assets/${index}`;
    if (!asset?.mediaId) {
      return;
    }

    if (mediaIds.has(asset.mediaId)) {
      findings.push(mediaFinding({
        code: ErrorCode.MEDIA_ID_DUPLICATE,
        file: "media-assets.json",
        jsonPointer: `${pointer}/mediaId`,
        message: `media-assets.json repeats mediaId ${asset.mediaId}.`,
        ownerExplanation: "Each media asset needs a unique ID so page references resolve to one asset.",
        nextAction: "Give each asset a unique mediaId."
      }));
    }
    mediaIds.set(asset.mediaId, asset);

    if (!/^[a-z0-9][a-z0-9-]{2,120}$/.test(asset.mediaId)) {
      findings.push(mediaFinding({
        code: ErrorCode.MEDIA_ID_UNSTABLE,
        file: "media-assets.json",
        jsonPointer: `${pointer}/mediaId`,
        message: `mediaId ${asset.mediaId} is not stable enough for import references.`,
        ownerExplanation: "Media IDs should be lowercase, durable, and safe to use in page blocks.",
        nextAction: "Use a lowercase mediaId with letters, numbers, and hyphens only."
      }));
    }

    if (asset.fileName && !isSafeFileName(asset.fileName)) {
      findings.push(mediaFinding({
        code: ErrorCode.MEDIA_FILENAME_UNSAFE,
        file: "media-assets.json",
        jsonPointer: `${pointer}/fileName`,
        message: `media-assets.json has an unsafe fileName for ${asset.mediaId}.`,
        ownerExplanation: "Media file names must not contain paths, protected config names, or traversal segments.",
        nextAction: "Use a simple file name such as hero-rink.webp."
      }));
    }

    if (asset.publicUrl && site?.mediaDomain) {
      const parsedUrl = parseHttpUrl(asset.publicUrl);
      if (parsedUrl && parsedUrl.hostname.toLowerCase() !== site.mediaDomain.toLowerCase()) {
        findings.push(mediaFinding({
          code: ErrorCode.MEDIA_DOMAIN_MISMATCH,
          file: "media-assets.json",
          jsonPointer: `${pointer}/publicUrl`,
          message: `media asset ${asset.mediaId} does not use the declared media domain.`,
          ownerExplanation: "Production media URLs should use the media domain declared in site.json.",
          nextAction: `Change the media URL host to ${site.mediaDomain} or update site.json after review.`
        }));
      }
    }
  });

  for (const page of pages) {
    for (const reference of collectReferences(page, mediaReferenceKeys)) {
      referencedIds.add(reference.ref);
      if (!mediaIds.has(reference.ref)) {
        findings.push(mediaFinding({
          code: ErrorCode.UNKNOWN_MEDIA_REFERENCE,
          file: page.relativePath,
          jsonPointer: reference.pointer,
          field: reference.field,
          message: `${page.relativePath}${reference.pointer} references unknown mediaId ${reference.ref}.`,
          ownerExplanation: "A page block references a media asset that is not listed in media-assets.json.",
          nextAction: "Add the media asset to media-assets.json or update the page block to use an existing mediaId."
        }));
      }
    }
  }

  for (const mediaId of mediaIds.keys()) {
    if (!referencedIds.has(mediaId)) {
      findings.push(
        createFinding({
          severity: "warning",
          code: ErrorCode.UNUSED_MEDIA_ASSET,
          file: "media-assets.json",
          field: "mediaId",
          message: `media asset ${mediaId} is declared but not referenced by a page.`,
          ownerExplanation: "This media asset is available in the package but no page currently uses it.",
          operatorDetail: "Unused media is a warning in Phase 2A-2 and can be promoted to failure with strict policy later.",
          nextAction: "Remove the unused asset or reference it from a page block.",
          gateId: "media-references",
          blocksGate: false
        })
      );
    }
  }

  return findings;
}

function mediaFinding({ code, file, jsonPointer = null, field = null, message, ownerExplanation, nextAction }) {
  return createFinding({
    severity: "error",
    code,
    file,
    jsonPointer,
    field,
    message,
    ownerExplanation,
    operatorDetail: "Media checks run offline against media-assets.json and pages/*.json.",
    nextAction,
    gateId: "media-references"
  });
}

function isSafeFileName(fileName) {
  if (/[\\/]/.test(fileName) || fileName.includes("..") || /^[A-Za-z]:/.test(fileName)) {
    return false;
  }
  if (/\.(env|ps1|cmd|bat)$/i.test(fileName)) {
    return false;
  }
  if (/appsettings\.development\.json|local\.settings\.json|secret/i.test(fileName)) {
    return false;
  }
  return /^[A-Za-z0-9._-]+$/.test(fileName);
}
