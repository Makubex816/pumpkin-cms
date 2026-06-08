import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { defaultForbiddenRoutes, getAnswerForms, normalizeRoute, slugFromRoute } from "./answers-validator.mjs";

export async function buildPackagePreview({ answers, files, outputDirectory, validate, supportPacket }) {
  const absoluteOutputDirectory = path.resolve(outputDirectory);
  const fileSummaries = [];

  for (const file of files) {
    const absolutePath = path.join(absoluteOutputDirectory, file.relativePath);
    const existing = await stat(absolutePath).catch(() => null);
    let action = "create";

    if (existing?.isFile()) {
      const existingContent = await readFile(absolutePath, "utf8").catch(() => null);
      action = existingContent === file.content ? "unchanged" : "overwrite";
    } else if (existing) {
      action = "replace-non-file";
    }

    fileSummaries.push({
      relativePath: file.relativePath,
      action,
      exists: Boolean(existing)
    });
  }

  const approvedRoutes = answers.routing.approvedRoutes.map((route) => normalizeRoute(route));
  const forbiddenRoutes = [...new Set([...(answers.routing.forbiddenRoutes ?? []), ...defaultForbiddenRoutes].map((route) => normalizeRoute(route)))];
  const forms = getAnswerForms(answers);

  return {
    outputDirectory: absoluteOutputDirectory,
    files: fileSummaries,
    counts: {
      create: fileSummaries.filter((file) => file.action === "create").length,
      overwrite: fileSummaries.filter((file) => file.action === "overwrite").length,
      unchanged: fileSummaries.filter((file) => file.action === "unchanged").length,
      replaceNonFile: fileSummaries.filter((file) => file.action === "replace-non-file").length
    },
    routes: {
      approved: approvedRoutes,
      forbidden: forbiddenRoutes,
      trailingSlashPolicy: answers.routing.trailingSlashPolicy
    },
    pages: answers.pages.map((page) => ({
      slug: page.slug ?? slugFromRoute(page.route),
      route: normalizeRoute(page.route),
      file: `pages/${page.slug ?? slugFromRoute(page.route)}.json`,
      mediaRefs: page.mediaRefs ?? [],
      formRef: page.formRef ?? null
    })),
    mediaRefs: answers.media.map((asset) => ({
      mediaId: asset.mediaId,
      fileName: asset.fileName,
      publicHost: safeHost(asset.publicUrl)
    })),
    formRefs: forms.map((form) => ({
      formId: form.formId,
      deliveryMode: form.deliveryMode ?? "no-email",
      leadRecipientRef: form.leadRecipientRef ?? null,
      recipientGroup: form.recipientGroup ?? form.leadRecipientRef ?? null
    })),
    validator: {
      willRun: Boolean(validate || supportPacket),
      supportPacket: Boolean(supportPacket),
      command: validate || supportPacket
        ? `node ../validator-implementation/src/cli.mjs --package ${absoluteOutputDirectory} --out ${absoluteOutputDirectory}${supportPacket ? " --support-packet" : ""}`
        : "not requested"
    },
    diffMode: "summary-only",
    fullDiffImplemented: false
  };
}

function safeHost(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}
