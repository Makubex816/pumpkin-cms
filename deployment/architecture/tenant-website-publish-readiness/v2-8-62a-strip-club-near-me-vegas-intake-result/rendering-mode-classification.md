# Rendering Mode Classification

Primary classification: `static HTML`.

Subtype: `compiled deployment output`.

Evidence:

- 43 route-shaped HTML files;
- directory `index.html` routing;
- shared CSS and one vanilla browser script;
- local JSON data and static media;
- no `package.json`, dependency lock, JSX, TSX, Vue, Svelte, Next.js, Vite, or source-component tree;
- no server function or dynamic route implementation.

This is not a Next.js, React/Vite, or mixed runtime package. It should be treated as a read-only presentation/content input for a Pumpkin compiler, not deployed or imported directly.

Chrome parsed the HTML with script execution disabled before navigation. External HTTP(S), package JavaScript, CSS, and media requests were blocked during DOM inventory. Uploaded JavaScript executed: no.
