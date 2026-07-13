'use client';

import { useEffect } from 'react';

interface PreviewBehaviorAdapterProps {
  tenantId: string;
  contentId: string;
  bodyClass: string;
}

interface PreviewProofState {
  version: string;
  tenantId: string;
  events: Array<{ type: string; detail: Record<string, unknown> }>;
  formActionsHeld: number;
  externalNavigationsHeld: number;
  airstripRequests: number;
  postRequests: number;
  personalDataStored: false;
}

export function PreviewBehaviorAdapter({ tenantId, contentId, bodyClass }: PreviewBehaviorAdapterProps) {
  useEffect(() => {
    const root = document.getElementById(contentId);
    if (!root) return;

    const controller = new AbortController();
    const options = { signal: controller.signal };
    const state: PreviewProofState = {
      version: '2.8.62f',
      tenantId,
      events: [],
      formActionsHeld: 0,
      externalNavigationsHeld: 0,
      airstripRequests: 0,
      postRequests: 0,
      personalDataStored: false,
    };
    const proofWindow = window as typeof window & { __PUMPKIN_PREVIEW_PROOF__?: PreviewProofState };
    proofWindow.__PUMPKIN_PREVIEW_PROOF__ = state;
    const record = (type: string, detail: Record<string, unknown> = {}) => state.events.push({ type, detail });
    const one = <T extends Element>(selector: string, scope: ParentNode = root) => scope.querySelector<T>(selector);
    const all = <T extends Element>(selector: string, scope: ParentNode = root) => Array.from(scope.querySelectorAll<T>(selector));

    const appliedBodyClasses = bodyClass.split(/\s+/).filter(Boolean);
    document.body.classList.add(...appliedBodyClasses);

    const header = one<HTMLElement>('[data-header]');
    const nav = one<HTMLElement>('[data-nav]');
    const toggle = one<HTMLButtonElement>('[data-menu-toggle]');
    if (nav && toggle) {
      const headerCta = header ? one<HTMLAnchorElement>('.header-cta a', header) : null;
      if (headerCta && !one('[data-mobile-cta]', nav)) {
        const mobileCta = headerCta.cloneNode(true) as HTMLAnchorElement;
        mobileCta.className = 'nav-link nav-link-cta';
        mobileCta.removeAttribute('data-source-control-id');
        mobileCta.setAttribute('data-mobile-cta', '');
        mobileCta.setAttribute('data-preview-derived-control', 'mobile-cta');
        nav.appendChild(mobileCta);
      }
      const setOpen = (open: boolean) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        record('menu-state', { open });
      };
      toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setOpen(!nav.classList.contains('is-open'));
      }, options);
      nav.addEventListener('click', (event) => {
        if ((event.target as Element).closest('.nav-link')) setOpen(false);
      }, options);
      document.addEventListener('click', (event) => {
        if (nav.classList.contains('is-open') && !(header?.contains(event.target as Node))) setOpen(false);
      }, options);
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
          setOpen(false);
          toggle.focus();
        }
      }, options);
    }

    const normalizeClubName = (value: string) => {
      const names: Record<string, string> = {
        airstrip: 'AIRSTRIP',
        'airstrip las vegas': 'AIRSTRIP',
        'crazy horse 3': 'Crazy Horse 3',
        treasures: 'Treasures',
        'treasures las vegas': 'Treasures',
        sapphire: 'Sapphire',
        'sapphire las vegas': 'Sapphire',
        'peppermint hippo': 'Peppermint Hippo',
        hustler: 'Hustler Club Las Vegas',
        'hustler club las vegas': 'Hustler Club Las Vegas',
        'spearmint rhino': 'Spearmint Rhino',
        scores: 'Scores Las Vegas',
        'scores las vegas': 'Scores Las Vegas',
        palomino: 'Palomino Club',
        'palomino club': 'Palomino Club',
        'little darlings': 'Little Darlings',
      };
      const key = value.toLowerCase().replace(/-/g, ' ').trim();
      return names[key] || value || 'Help me choose';
    };
    const clubFields = all<HTMLInputElement | HTMLSelectElement>('[data-lead-club], select[name="club"], input[name="club"]');
    const pickupFields = all<HTMLInputElement>('[data-pickup-field], input[name="pickup"]');
    const guestFields = all<HTMLInputElement | HTMLSelectElement>('[data-guests-field], select[name="guests"], input[name="guests"]');
    const timingFields = all<HTMLSelectElement>('[data-timing-field], select[name="timing"]');
    const selectClub = (value: string) => {
      const desired = normalizeClubName(value);
      for (const field of clubFields) {
        if (field instanceof HTMLSelectElement) {
          let option = Array.from(field.options).find((candidate) =>
            candidate.value === desired || candidate.textContent?.trim().toLowerCase() === desired.toLowerCase());
          if (!option) {
            option = new Option(desired, desired);
            field.add(option);
          }
          field.value = option.value;
        } else {
          field.value = desired;
        }
      }
    };
    const setPickup = (value: string) => pickupFields.forEach((field) => { field.value = value || 'New York-New York Hotel & Casino'; });
    const scrollToForm = () => (one<HTMLElement>('#lead-form') || one<HTMLElement>('[data-lead-form]'))?.scrollIntoView({ block: 'start' });
    const requestedClub = new URLSearchParams(window.location.search).get('club');
    if (requestedClub) selectClub(requestedClub);
    pickupFields.filter((field) => !field.value).forEach((field) => { field.value = 'New York-New York Hotel & Casino'; });

    root.addEventListener('click', (event) => {
      const target = event.target as Element;
      const externalLink = target.closest<HTMLAnchorElement>('a[data-preview-external="held"]');
      if (externalLink) {
        event.preventDefault();
        externalLink.setAttribute('data-preview-external-held', 'true');
        state.externalNavigationsHeld += 1;
        record('external-navigation-held', { host: new URL(externalLink.href).hostname });
        return;
      }

      const selectControl = target.closest<HTMLElement>('[data-select-club]');
      if (selectControl) selectClub(selectControl.dataset.selectClub || '');
      const scrollControl = target.closest<HTMLElement>('[data-scroll-form]');
      if (scrollControl) {
        selectClub(scrollControl.dataset.selectClub || '');
        scrollToForm();
      }
      const concierge = target.closest<HTMLElement>('[data-concierge]');
      if (concierge) {
        selectClub(concierge.dataset.concierge || '');
        const modal = one<HTMLElement>('[data-modal]');
        if (modal) modal.hidden = false;
        else scrollToForm();
      }
      if (target.closest('[data-modal-close]')) {
        const modal = one<HTMLElement>('[data-modal]');
        if (modal) modal.hidden = true;
      }
      if (target.closest('[data-apply-location]')) {
        setPickup(one<HTMLInputElement>('[data-location-input]')?.value.trim() || 'New York-New York Hotel & Casino');
        scrollToForm();
      }

      const quiz = target.closest<HTMLElement>('[data-quiz]');
      if (quiz) {
        const reasons: Record<string, string> = {
          couples: 'Compare an intimate setting, private seating, and a confirmed transportation plan for a couples or small-group visit.',
          bachelor: 'Compare group seating, transportation, and package terms for a bachelor-party visit.',
          first: 'Compare age, entry, transportation, and package terms before a first visit.',
        };
        const choice = quiz.dataset.quiz || 'couples';
        const result = one<HTMLElement>('#quiz-result');
        const reason = one<HTMLElement>('#quiz-reason');
        if (result && reason) {
          reason.textContent = reasons[choice] || reasons.couples;
          result.hidden = false;
          all<HTMLElement>('[data-quiz]').forEach((item) => item.removeAttribute('data-quiz-selected'));
          quiz.setAttribute('data-quiz-selected', 'true');
          result.scrollIntoView({ block: 'center' });
          record('quiz-selection', { choice });
        }
      }

      const finder = target.closest<HTMLElement>('[data-finder-run]');
      if (finder) {
        const result = one<HTMLElement>('[data-finder-result]', finder.closest('[data-finder]') || root);
        if (result) result.textContent = 'Compare group size, pickup location, budget, and atmosphere before choosing a venue.';
        record('finder-result');
      }

      const previewSubmit = target.closest<HTMLElement>('[data-preview-submit="true"]');
      if (previewSubmit) {
        event.preventDefault();
        const form = previewSubmit.closest('form');
        if (!form) return;
        if (!form.checkValidity()) {
          form.reportValidity();
          form.setAttribute('data-preview-result', 'validation-held');
          record('form-validation-held', { id: form.dataset.sourceFormId || '' });
          return;
        }
        form.setAttribute('data-preview-result', 'success-no-post');
        let message = form.querySelector<HTMLElement>('[data-form-message], .form-message, .pumpkin-preview-form-message');
        if (!message) {
          message = document.createElement('p');
          message.className = 'pumpkin-preview-form-message';
          message.setAttribute('aria-live', 'polite');
          form.appendChild(message);
        }
        message.textContent = 'Preview only: validation passed, but no request was sent.';
        state.formActionsHeld += 1;
        record('form-action-held', { id: form.dataset.sourceFormId || '', personalDataStored: false });
      }
    }, options);

    root.addEventListener('submit', (event) => {
      event.preventDefault();
      state.formActionsHeld += 1;
      record('defense-in-depth-submit-held');
    }, options);

    for (const image of all<HTMLImageElement>('img[data-pumpkin-image-fallback]')) {
      image.addEventListener('error', () => {
        const fallback = image.dataset.pumpkinImageFallback;
        if (!fallback || image.dataset.pumpkinFallbackUsed === 'true') return;
        image.dataset.pumpkinFallbackUsed = 'true';
        image.src = fallback;
        record('image-fallback');
      }, options);
    }

    for (const quickField of all<HTMLSelectElement>('[data-quick-guests], [data-quick-timing]')) {
      quickField.addEventListener('change', () => {
        if (quickField.hasAttribute('data-quick-guests')) guestFields.forEach((field) => { field.value = quickField.value; });
        if (quickField.hasAttribute('data-quick-timing')) timingFields.forEach((field) => { field.value = quickField.value; });
      }, options);
    }

    record('adapter-ready', {
      menus: all('[data-menu-toggle]').length,
      quizzes: all('[data-quiz]').length,
      forms: all('form').length,
      imageFallbacks: all('img[data-pumpkin-image-fallback]').length,
    });

    return () => {
      controller.abort();
      document.body.classList.remove(...appliedBodyClasses);
      if (proofWindow.__PUMPKIN_PREVIEW_PROOF__ === state) delete proofWindow.__PUMPKIN_PREVIEW_PROOF__;
    };
  }, [bodyClass, contentId, tenantId]);

  return null;
}
