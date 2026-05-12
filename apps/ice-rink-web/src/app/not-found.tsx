import Link from 'next/link';
import { resolveSite } from '@/lib/resolve-site';

export default function NotFound() {
  const site = resolveSite();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
        {site.brand}
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-950 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-lg text-slate-500 mt-3 max-w-md">
        This page is not published for this site yet.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center px-6 py-2.5 bg-sky-700 text-white font-bold rounded-full hover:bg-sky-800 transition-all shadow-md"
      >
        Go Home
      </Link>
    </div>
  );
}
