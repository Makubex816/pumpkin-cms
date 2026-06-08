import { ErrorCode } from "./error-codes.mjs";

const errorExplanations = new Map(
  [
    explanation(ErrorCode.REQUIRED_FILE_MISSING, {
      title: "Required package file is missing",
      plainLanguage: "The package is missing a file the validator needs before it can review the tenant safely.",
      likelyCause: "A template file was deleted, renamed, or left out of the handoff folder.",
      howToFix: "Add the missing file from the approved import package template, then run the validator again.",
      whenToAskForHelp: "Ask an operator for help if you do not know which template file should be used.",
      reviewOwner: "Package owner or operator"
    }),
    explanation(ErrorCode.JSON_PARSE_ERROR, {
      title: "JSON formatting is broken",
      plainLanguage: "One of the files has a formatting typo, so the validator cannot read it.",
      likelyCause: "A comma, quote, bracket, or brace is missing or in the wrong place.",
      howToFix: "Fix the JSON syntax in the named file and run the validator again.",
      whenToAskForHelp: "Ask a developer or operator for help if the file looks correct but still will not parse.",
      reviewOwner: "Package owner with operator support"
    }),
    explanation(ErrorCode.JSON_EMPTY_FILE, {
      title: "JSON file is empty",
      plainLanguage: "A package file exists but has no usable content inside it.",
      likelyCause: "The file was created from a blank placeholder or an export was interrupted.",
      howToFix: "Replace it with the approved template file or add the required JSON content.",
      whenToAskForHelp: "Ask an operator for the latest template if you are not sure what belongs in the file.",
      reviewOwner: "Package owner or operator"
    }),
    explanation(ErrorCode.SCHEMA_VALIDATION_ERROR, {
      title: "File does not match the approved template",
      plainLanguage: "A value is missing, in the wrong format, or not allowed by the package template.",
      likelyCause: "A field was edited by hand, copied from another package, or added before the schema allowed it.",
      howToFix: "Update the named field so it matches the approved import package schema.",
      whenToAskForHelp: "Ask a developer if the field seems necessary but the schema rejects it.",
      reviewOwner: "Package owner with developer support"
    }),
    explanation(ErrorCode.TENANT_ID_MISMATCH, {
      title: "Tenant identity does not match",
      plainLanguage: "Two files disagree about which tenant this package belongs to.",
      likelyCause: "A file was copied from another tenant or edited with an old tenant ID.",
      howToFix: "Make the tenant ID match across manifest.json, tenant.json, site.json, and page files.",
      whenToAskForHelp: "Stop and ask for help if another tenant name appears in the package.",
      reviewOwner: "Operator"
    }),
    explanation(ErrorCode.SITE_KEY_MISMATCH, {
      title: "Site key does not match",
      plainLanguage: "Two files disagree about the site key for this package.",
      likelyCause: "A site file or page file was copied from a different tenant package.",
      howToFix: "Make the site key match the approved tenant and site records.",
      whenToAskForHelp: "Ask an operator if you are unsure which site key is correct.",
      reviewOwner: "Operator"
    }),
    explanation(ErrorCode.ROUTE_PAGE_MISSING, {
      title: "Approved page address has no page file",
      plainLanguage: "The route list approves a page address, but there is no matching page file.",
      likelyCause: "A page was listed for launch before its content file was added.",
      howToFix: "Add the missing page file or remove the route from the approved route list.",
      whenToAskForHelp: "Ask the content owner to confirm whether the page should launch.",
      reviewOwner: "Content owner or operator"
    }),
    explanation(ErrorCode.PAGE_ROUTE_NOT_APPROVED, {
      title: "Page address is not approved",
      plainLanguage: "A page file uses a URL that is not on the approved launch list.",
      likelyCause: "The page route was mistyped or the route list was not updated.",
      howToFix: "Add the route to approvedRoutes or change the page route to an approved address.",
      whenToAskForHelp: "Ask the content owner before adding any new launch route.",
      reviewOwner: "Content owner"
    }),
    explanation(ErrorCode.FORBIDDEN_ROUTE_PRESENT, {
      title: "Forbidden page address is present",
      plainLanguage: "A page, navigation item, redirect, or approved route points to an address that should stay offline.",
      likelyCause: "A draft, old, preview, or blocked route was accidentally included.",
      howToFix: "Remove the forbidden route or get explicit approval to change the route controls.",
      whenToAskForHelp: "Ask an operator if a forbidden route might be intentional.",
      reviewOwner: "Operator"
    }),
    explanation(ErrorCode.UNKNOWN_MEDIA_REFERENCE, {
      title: "Image or media reference is missing",
      plainLanguage: "A page points to a media item that is not listed in media-assets.json.",
      likelyCause: "The media ID was mistyped or the image was not added to the media manifest.",
      howToFix: "Add the missing media record or update the page to use an approved media ID.",
      whenToAskForHelp: "Ask the media owner if you cannot confirm the approved asset.",
      reviewOwner: "Media owner"
    }),
    explanation(ErrorCode.UNKNOWN_FORM_REFERENCE, {
      title: "Form reference is missing",
      plainLanguage: "A page points to a form that is not listed in forms.json.",
      likelyCause: "The form ID was mistyped or the form was not added to the form manifest.",
      howToFix: "Add the missing form record or update the page to use an approved form ID.",
      whenToAskForHelp: "Ask the form owner before changing where leads are collected.",
      reviewOwner: "Form owner or operator"
    }),
    explanation(ErrorCode.FORM_RECIPIENT_REFERENCE_REQUIRED, {
      title: "Lead recipient reference is missing",
      plainLanguage: "A form does not name the approved lead routing reference.",
      likelyCause: "The form was created before leadRecipientRef was added to the package schema.",
      howToFix: "Add leadRecipientRef, or keep a matching legacy recipientGroup, using a safe reference such as example-event-leads.",
      whenToAskForHelp: "Ask the form owner or operator if you do not know the approved lead routing reference.",
      reviewOwner: "Form owner or operator"
    }),
    explanation(ErrorCode.FORM_RECIPIENT_REFERENCE_INVALID, {
      title: "Lead recipient reference is unsafe",
      plainLanguage: "A form recipient reference looks like the wrong kind of value.",
      likelyCause: "An email address, token, URL, path, or copied secret-like value may have been used instead of a safe reference ID.",
      howToFix: "Use lowercase letters, numbers, and hyphens only, such as example-event-leads.",
      whenToAskForHelp: "Ask an operator or security reviewer if the value might be a credential.",
      reviewOwner: "Form owner or security reviewer"
    }),
    explanation(ErrorCode.FORM_RECIPIENT_REFERENCE_CONFLICT, {
      title: "Lead recipient references conflict",
      plainLanguage: "The new lead recipient reference and the legacy recipient group do not match.",
      likelyCause: "One field was updated while the compatibility field kept an older routing value.",
      howToFix: "Use the same safe value for leadRecipientRef and recipientGroup, or remove recipientGroup after legacy consumers no longer need it.",
      whenToAskForHelp: "Ask the form owner before changing lead routing.",
      reviewOwner: "Form owner or operator"
    }),
    explanation(ErrorCode.FORBIDDEN_LOCAL_URL, {
      title: "Local preview URL is present",
      plainLanguage: "The package contains a local computer or preview URL that should not go live.",
      likelyCause: "A localhost, 127.0.0.1, file path, or private network address was pasted during review.",
      howToFix: "Replace the value with the approved public URL or remove it from the package.",
      whenToAskForHelp: "Ask an operator if you do not know the public replacement URL.",
      reviewOwner: "Operator"
    }),
    explanation(ErrorCode.FORBIDDEN_STAGING_URL, {
      title: "Staging or preview URL is present",
      plainLanguage: "The package contains a staging, preview, or temporary URL that should not be used for launch.",
      likelyCause: "A staging link was copied from a review environment into production content.",
      howToFix: "Replace it with the approved production URL or remove the value.",
      whenToAskForHelp: "Ask an operator if the production URL is not known yet.",
      reviewOwner: "Operator"
    }),
    explanation(ErrorCode.FORBIDDEN_SECRET_LIKE_VALUE, {
      title: "Possible secret or credential is present",
      plainLanguage: "A value looks like a private token, password, key, or credential.",
      likelyCause: "A secret may have been pasted into a package file by mistake.",
      howToFix: "Remove the value immediately and rotate the credential if it may be real.",
      whenToAskForHelp: "Stop and ask for security or operator help. Do not paste the value into chat or email.",
      reviewOwner: "Security or operator"
    }),
    explanation(ErrorCode.SEO_NOINDEX_NOT_ALLOWED, {
      title: "Production page blocks search indexing",
      plainLanguage: "A production-ready page is still telling search engines not to index it.",
      likelyCause: "A staging review setting was left in place after content approval.",
      howToFix: "Change the page robots setting to the approved production value after owner review.",
      whenToAskForHelp: "Ask the SEO or content owner before changing crawl instructions.",
      reviewOwner: "SEO owner or content owner"
    }),
    explanation(ErrorCode.CANONICAL_ROUTE_MISMATCH, {
      title: "Canonical URL does not match the page route",
      plainLanguage: "A page's canonical URL points to a different address than the page itself.",
      likelyCause: "The canonical URL was copied from another page or kept from a draft route.",
      howToFix: "Update the canonical URL so its host and path match the approved page route.",
      whenToAskForHelp: "Ask the SEO owner if the canonical intentionally points elsewhere.",
      reviewOwner: "SEO owner"
    }),
    explanation(ErrorCode.SITEMAP_CANONICAL_MISMATCH, {
      title: "Sitemap URL does not match the canonical set",
      plainLanguage: "The sitemap list and canonical URL list disagree.",
      likelyCause: "A page was renamed, removed, or added without updating sitemap metadata.",
      howToFix: "Align sitemap URLs with the approved canonical URLs.",
      whenToAskForHelp: "Ask the SEO owner before removing or adding production URLs.",
      reviewOwner: "SEO owner"
    })
  ].map((item) => [item.code, item])
);

export function getErrorExplanation(code) {
  if (errorExplanations.has(code)) {
    return errorExplanations.get(code);
  }

  return {
    code,
    known: false,
    title: "No plain-language explanation is registered yet",
    plainLanguage: "The validator found an issue that does not yet have a support-friendly explanation.",
    likelyCause: "This code may be new, deferred, or missing from the explanation catalog.",
    howToFix: "Use the finding message and next action in the validation report, then add this code to the explanation catalog.",
    whenToAskForHelp: "Ask a developer or operator to interpret this code before approving import.",
    reviewOwner: "Developer or operator"
  };
}

export function listErrorExplanations() {
  return [...errorExplanations.values()].sort((left, right) => left.code.localeCompare(right.code));
}

export function attachErrorExplanations(findings) {
  return findings.map((finding) => ({
    ...finding,
    explanation: getErrorExplanation(finding.code)
  }));
}

function explanation(code, details) {
  return {
    code,
    known: true,
    ...details
  };
}
