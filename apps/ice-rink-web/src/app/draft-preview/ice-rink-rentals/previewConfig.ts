import { isStaticRenderMode } from '@/lib/render-mode';

export function isDraftPreviewEnabled() {
  if (isStaticRenderMode()) return false;
  if (process.env.PUMPKIN_DRAFT_PREVIEW_ENABLED === 'true') return true;
  if (process.env.NEXT_PUBLIC_PUMPKIN_DRAFT_PREVIEW_ENABLED === 'true') return true;

  return process.env.NODE_ENV !== 'production';
}

export function getPreviewApiBaseUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_PUMPKIN_API_URL ||
    process.env.PUMPKIN_API_URL ||
    'http://localhost:5064';

  try {
    const url = new URL(rawUrl);
    url.username = '';
    url.password = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return 'http://localhost:5064';
  }
}
