'use client';

import React from 'react';
import type { FormBlock, FormDefinition, FormDefinitionField } from 'pumpkin-ts-models';
import { getDefaultFormDefinition } from 'pumpkin-ts-models';
import { formBlockDefaults, type FormBlockClassNames } from '../defaults/formBlock';
import { mergeClasses } from '../utils/mergeClasses';

export interface FormBlockSubmitPayload {
  formId: string;
  formKey: string;
  pageSlug: string;
  sourcePage: string;
  tenantId: string;
  siteKey: string;
  formType: string;
  staticEndpointRef: string;
  leadRecipientRef: string;
  formData: Record<string, string>;
}

export interface FormBlockViewProps {
  block: FormBlock;
  classNames?: FormBlockClassNames;
  definitions?: FormDefinition[];
  tenantId?: string;
  siteKey?: string;
  pageSlug?: string;
  onSubmit?: (payload: FormBlockSubmitPayload) => Promise<void> | void;
}

export function FormBlockView({
  block,
  classNames,
  definitions = [],
  tenantId = '',
  siteKey = tenantId,
  pageSlug = '',
  onSubmit,
}: FormBlockViewProps) {
  const cx = mergeClasses(formBlockDefaults, classNames);
  const content = block.content || {};
  const definition = definitions.find((item) => item.formKey === content.formKey) ||
    getDefaultFormDefinition(content.formKey, tenantId, siteKey);
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = React.useState('');
  const statusRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    if (status === 'success' || status === 'error') {
      statusRef.current?.focus();
    }
  }, [status, message]);

  if (!definition) {
    return (
      <section data-section-id={content.id || 'form-block'} data-form-block={content.formKey || 'missing'} className={cx.root}>
        <div className={cx.container}>
          <div className={cx.missing}>This form is unavailable.</div>
        </div>
      </section>
    );
  }

  const visibleFields = [...definition.fields].sort((a, b) => a.order - b.order);
  const hiddenFields = [...definition.hiddenFields].sort((a, b) => a.order - b.order);
  const resolvedTenantId = tenantId || definition.tenantId;
  const resolvedSiteKey = siteKey || definition.siteKey || resolvedTenantId;
  const resolvedSourcePage = content.sourcePage || pageSlug || 'contact';
  const staticEndpointRef = content.staticEndpointRef || definition.staticEndpointRef;
  const leadRecipientRef = content.leadRecipientRef || definition.leadRecipientRef;
  const submitLabel = content.submitLabel || 'Submit';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = collectFormData(form, visibleFields, hiddenFields);

    values.tenantId = resolvedTenantId;
    values.siteKey = resolvedSiteKey;
    values.formKey = definition.formKey;
    values.sourcePage = resolvedSourcePage;

    setStatus('submitting');
    setMessage('Sending your request...');

    try {
      if (!onSubmit) {
        throw new Error('This form is not connected yet.');
      }

      await onSubmit({
        formId: definition.formKey,
        formKey: definition.formKey,
        pageSlug: resolvedSourcePage,
        sourcePage: resolvedSourcePage,
        tenantId: resolvedTenantId,
        siteKey: resolvedSiteKey,
        formType: definition.formType,
        staticEndpointRef,
        leadRecipientRef,
        formData: values,
      });
      form.reset();
      setStatus('success');
      setMessage(content.successMessage || definition.successMessage);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : (content.errorMessage || definition.errorMessage));
    }
  };

  return (
    <section
      data-section-id={content.id || 'form-block'}
      data-form-block={definition.formKey}
      data-static-endpoint-ref={staticEndpointRef}
      data-lead-recipient-ref={leadRecipientRef}
      className={cx.root}
    >
      <div className={cx.container}>
        <div className={cx.panel}>
          <div className={cx.introColumn}>
            <p className={cx.eyebrow}>{content.label || definition.name}</p>
            <h2 className={cx.heading}>{content.heading || definition.name}</h2>
            {(content.intro || definition.description) && (
              <p className={cx.intro}>{content.intro || definition.description}</p>
            )}
          </div>

          <form
            className={cx.form}
            onSubmit={handleSubmit}
            aria-busy={status === 'submitting'}
            data-form-key={definition.formKey}
            data-form-type={definition.formType}
            noValidate={false}
          >
            <div className={cx.fieldGrid}>
              {visibleFields.map((field) => renderField(field, cx, status === 'submitting'))}
              {hiddenFields.map((field) => (
                <input key={field.name} type="hidden" name={field.name} value={getHiddenValue(field, {
                  tenantId: resolvedTenantId,
                  siteKey: resolvedSiteKey,
                  formKey: definition.formKey,
                  sourcePage: resolvedSourcePage,
                })} />
              ))}
            </div>

            {status !== 'idle' && message && (
              <p
                ref={statusRef}
                tabIndex={-1}
                className={[
                  cx.status,
                  status === 'success' ? cx.statusSuccess : status === 'error' ? cx.statusError : cx.statusPending,
                ].join(' ')}
                role={status === 'error' ? 'alert' : 'status'}
                aria-live={status === 'error' ? 'assertive' : 'polite'}
              >
                {message}
              </p>
            )}

            <button type="submit" disabled={status === 'submitting'} className={cx.submitButton}>
              {status === 'submitting' ? 'Sending...' : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function renderField(field: FormDefinitionField, cx: typeof formBlockDefaults, disabled: boolean) {
  const requiredMark = field.required ? <span className={cx.requiredMark}> *</span> : null;
  const wrapperClass = field.width === 'full' || field.type === 'textarea' || field.type === 'checkbox' || field.hidden
    ? cx.fieldWrapperFull
    : cx.fieldWrapper;

  if (field.hidden) {
    return (
      <label key={field.name} className={cx.honeypot} aria-hidden="true">
        <span>{field.label}</span>
        <input
          name={field.name}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className={cx.fieldInput}
        />
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label key={field.name} className={wrapperClass}>
        <span className={cx.fieldLabel}>{field.label}{requiredMark}</span>
        <textarea
          name={field.name}
          required={field.required}
          disabled={disabled}
          placeholder={field.placeholder || ''}
          aria-describedby={field.helpText ? `${field.name}-help` : undefined}
          className={cx.fieldTextarea}
        />
        {renderHelpText(field, cx)}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label key={field.name} className={wrapperClass}>
        <span className={cx.fieldLabel}>{field.label}{requiredMark}</span>
        <select
          name={field.name}
          required={field.required}
          disabled={disabled}
          defaultValue=""
          aria-describedby={field.helpText ? `${field.name}-help` : undefined}
          className={cx.fieldInput}
        >
          <option value="" disabled>{field.placeholder || 'Select an option'}</option>
          {(field.options || []).map((option) => (
            <option key={getOptionValue(option)} value={getOptionValue(option)}>{getOptionLabel(option)}</option>
          ))}
        </select>
        {renderHelpText(field, cx)}
      </label>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label key={field.name} className={wrapperClass}>
        <span className={cx.fieldCheckbox}>
          <input
            name={field.name}
            type="checkbox"
            required={field.required}
            disabled={disabled}
            value="true"
            className={cx.checkboxInput}
          />
          <span>{field.placeholder || field.label}{requiredMark}</span>
        </span>
        {renderHelpText(field, cx)}
      </label>
    );
  }

  const type = field.type === 'dateText' || field.type === 'radio' ? 'text' : field.type === 'phone' ? 'tel' : field.type;
  return (
    <label key={field.name} className={wrapperClass}>
      <span className={cx.fieldLabel}>{field.label}{requiredMark}</span>
      <input
        name={field.name}
        type={type}
        required={field.required}
        disabled={disabled}
        placeholder={field.placeholder || ''}
        autoComplete={field.autocomplete || undefined}
        aria-describedby={field.helpText ? `${field.name}-help` : undefined}
        className={cx.fieldInput}
      />
      {renderHelpText(field, cx)}
    </label>
  );
}

function renderHelpText(field: FormDefinitionField, cx: typeof formBlockDefaults) {
  if (!field.helpText) return null;
  return <span id={`${field.name}-help`} className={cx.helpText}>{field.helpText}</span>;
}

function getOptionValue(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? option : option.value;
}

function getOptionLabel(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? option : option.label;
}

function collectFormData(
  form: HTMLFormElement,
  fields: FormDefinitionField[],
  hiddenFields: FormDefinitionField[],
): Record<string, string> {
  const formData = new FormData(form);
  const values: Record<string, string> = {};

  [...fields, ...hiddenFields].forEach((field) => {
    const value = formData.get(field.name);
    values[field.name] = value === null ? '' : String(value);
  });

  return values;
}

function getHiddenValue(field: FormDefinitionField, context: Record<string, string>) {
  if (field.name in context) return context[field.name];
  return field.defaultValue || '';
}
