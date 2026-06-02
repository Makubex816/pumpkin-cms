'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Page, Theme } from 'pumpkin-ts-models';
import { PageRenderer } from '@/components/PageRenderer';

const PREVIEW_TOKEN_STORAGE_KEY = 'pumpkin_ice_homepage_preview_jwt';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'blocked' | 'error';

interface DraftPreviewClientProps {
  apiBaseUrl: string;
  fallbackTheme: Theme;
  pageSlug: string;
  tenantId: string;
}

interface MediaCheck {
  checkedUrl: string;
  ok: boolean;
  status: number | null;
}

export function DraftPreviewClient({
  apiBaseUrl,
  fallbackTheme,
  pageSlug,
  tenantId,
}: DraftPreviewClientProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [message, setMessage] = useState('Enter a local admin JWT to load the CMS draft.');
  const [page, setPage] = useState<Page | null>(null);
  const [theme, setTheme] = useState<Theme>(fallbackTheme);
  const [mediaCheck, setMediaCheck] = useState<MediaCheck | null>(null);

  const previewUrl = useMemo(
    () => `${apiBaseUrl}/api/admin/pages/${encodeURIComponent(tenantId)}/${encodeSlugPath(pageSlug)}`,
    [apiBaseUrl, pageSlug, tenantId]
  );
  const themeUrl = useMemo(
    () => `${apiBaseUrl}/api/admin/themes/${encodeURIComponent(tenantId)}/active`,
    [apiBaseUrl, tenantId]
  );

  useEffect(() => {
    const storedToken = window.sessionStorage.getItem(PREVIEW_TOKEN_STORAGE_KEY);
    if (storedToken) {
      setTokenInput(storedToken);
      void loadDraft(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!page) return;

    const mediaUrl = collectMediaUrls(page).find((url) =>
      url.startsWith('/media/ice-rink-rentals/')
    );
    if (!mediaUrl) {
      setMediaCheck(null);
      return;
    }

    let canceled = false;
    fetch(mediaUrl, { method: 'HEAD', cache: 'no-store' })
      .then((response) => {
        if (!canceled) {
          setMediaCheck({ checkedUrl: mediaUrl, ok: response.ok, status: response.status });
        }
      })
      .catch(() => {
        if (!canceled) {
          setMediaCheck({ checkedUrl: mediaUrl, ok: false, status: null });
        }
      });

    return () => {
      canceled = true;
    };
  }, [page]);

  async function loadDraft(token: string) {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setStatus('blocked');
      setMessage('A local admin JWT is required for draft preview.');
      return;
    }

    setStatus('loading');
    setMessage('Loading draft preview from the local Pumpkin API.');
    setPage(null);
    setMediaCheck(null);

    try {
      const headers = {
        Authorization: `Bearer ${trimmedToken}`,
        Accept: 'application/json',
      };

      const pageResponse = await fetch(previewUrl, {
        headers,
        cache: 'no-store',
      });

      if (!pageResponse.ok) {
        setStatus('blocked');
        setMessage(`Draft fetch blocked by API status ${pageResponse.status}.`);
        return;
      }

      const draftPage = (await pageResponse.json()) as unknown;
      if (!isCmsPage(draftPage)) {
        setStatus('error');
        setMessage('Draft fetch returned an unexpected page shape.');
        return;
      }

      const themeResponse = await fetch(themeUrl, {
        headers,
        cache: 'no-store',
      }).catch(() => null);
      if (themeResponse?.ok) {
        const activeTheme = (await themeResponse.json()) as unknown;
        if (isCmsTheme(activeTheme)) {
          setTheme(activeTheme);
        }
      } else {
        setTheme(fallbackTheme);
      }

      window.sessionStorage.setItem(PREVIEW_TOKEN_STORAGE_KEY, trimmedToken);
      setPage(draftPage);
      setStatus('ready');
      setMessage('Draft preview loaded. Public / remains published-only.');
    } catch {
      setStatus('error');
      setMessage('Draft preview request failed before a CMS response was received.');
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadDraft(tokenInput);
  }

  function clearToken() {
    window.sessionStorage.removeItem(PREVIEW_TOKEN_STORAGE_KEY);
    setTokenInput('');
    setPage(null);
    setStatus('idle');
    setMessage('Preview token cleared from this browser session.');
    setMediaCheck(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="sticky top-0 z-[100] border-b border-amber-300 bg-amber-100/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-amber-950 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold uppercase tracking-[0.12em]">Local draft preview</p>
            <p>
              Ice homepage draft only. Noindex, no static export, no CMS writes, and public /
              remains unchanged.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-amber-400 bg-white/70 px-3 py-1">
              {status}
            </span>
            {page ? (
              <span className="rounded-full border border-amber-400 bg-white/70 px-3 py-1">
                {page.workflow?.status || 'workflow unknown'} /{' '}
                {page.workflow?.reviewStatus || 'review unknown'}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-5">
        <form
          className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_auto_auto]"
          onSubmit={handleSubmit}
        >
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Admin JWT
            <input
              className="h-10 rounded-md border border-slate-300 px-3 font-mono text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
              type="password"
              autoComplete="off"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="Paste local admin JWT"
            />
          </label>
          <button
            className="h-10 self-end rounded-md bg-sky-700 px-4 text-sm font-bold text-white shadow-sm hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={status === 'loading'}
            type="submit"
          >
            {status === 'loading' ? 'Loading...' : 'Load draft'}
          </button>
          <button
            className="h-10 self-end rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
            onClick={clearToken}
            type="button"
          >
            Clear
          </button>
        </form>

        <div className="mt-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <p>{message}</p>
          {mediaCheck ? (
            <p className={mediaCheck.ok ? 'mt-1 text-emerald-700' : 'mt-1 text-red-700'}>
              Media check {mediaCheck.ok ? 'passed' : 'failed'} for {mediaCheck.checkedUrl}
              {mediaCheck.status ? ` with status ${mediaCheck.status}` : ''}.
            </p>
          ) : null}
        </div>
      </section>

      {page ? (
        <div className="bg-white">
          <PageRenderer
            page={page}
            blockStyles={theme.blockStyles}
            designSystem={theme.designSystem}
            renderMode="static"
            staticFormEndpoint=""
          />
        </div>
      ) : null}
    </main>
  );
}

function encodeSlugPath(slug: string): string {
  return slug
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function isCmsPage(value: unknown): value is Page {
  if (!value || typeof value !== 'object') return false;
  const page = value as Partial<Page>;
  return Array.isArray(page.ContentData?.ContentBlocks);
}

function isCmsTheme(value: unknown): value is Theme {
  if (!value || typeof value !== 'object') return false;
  const theme = value as Partial<Theme>;
  return typeof theme.themeId === 'string' || typeof theme.id === 'string';
}

function collectMediaUrls(value: unknown, urls = new Set<string>()): string[] {
  if (typeof value === 'string') {
    if (value.startsWith('/media/')) urls.add(value);
    return Array.from(urls);
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaUrls(item, urls));
    return Array.from(urls);
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectMediaUrls(item, urls));
  }

  return Array.from(urls);
}
