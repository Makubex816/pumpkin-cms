'use client';

import { useRef, useState } from 'react';
import type { ContactClassNames } from 'pumpkin-block-views';
import type { ContactBlock, FormDefinition, FormFieldDefinition } from 'pumpkin-ts-models';
import { contactDefaults } from 'pumpkin-block-views';

type BaseContactContent = ContactBlock['content'];

interface ContactBlockContent extends BaseContactContent {
  formType?: string;
  successMessage?: string;
  formTitle?: string;
  formDescription?: string;
}

interface ContactFormBlockProps {
  block: ContactBlock & {
    content: ContactBlockContent;
  };
  classNames?: ContactClassNames;
  formDefinition?: FormDefinition;
  pageSlug: string;
  previewMode?: boolean;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactFormBlock({
  block,
  classNames,
  formDefinition,
  pageSlug,
  previewMode = false,
}: ContactFormBlockProps) {
  const cx = { ...contactDefaults, ...classNames };
  const { content } = block;
  const formRef = useRef<HTMLFormElement | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const fields = getFields(content, formDefinition);
  const consent = getConsent(formDefinition);
  const visibleFields = consent
    ? fields.filter((field) => field.name !== consent.name && field.id !== consent.name)
    : fields;
  const formType = content.formType?.trim().toLowerCase();
  const submitButtonText = formDefinition?.submitButtonText || content.submitButtonText || 'Submit';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (previewMode) {
      setSubmitState('error');
      setMessage('Preview mode: form submission is disabled.');
      return;
    }

    const form = formRef.current ?? event.currentTarget;

    if (!formType) {
      setSubmitState('error');
      setMessage('This form is missing a form type.');
      return;
    }

    const body = collectFormData(form, pageSlug);
    setSubmitState('submitting');
    setMessage('');

    try {
      const response = await fetch(`/api/forms/submit/${encodeURIComponent(formType)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        setSubmitState('error');
        setMessage(await getErrorMessage(response));
        return;
      }

      formRef.current?.reset();
      setSubmitState('success');
      setMessage(
        formDefinition?.successMessage ||
        content.successMessage ||
        'Thanks. Your message has been sent.',
      );
    } catch (error) {
      setSubmitState('error');
      setMessage(error instanceof Error ? error.message : 'The form could not be submitted.');
    }
  };

  return (
    <section className={cx.root}>
      <div className={cx.container}>
        <div className={cx.infoSection}>
          {content.title && <h2 className={cx.title}>{content.title}</h2>}
          {content.subtitle && <p className={cx.subtitle}>{content.subtitle}</p>}
          {content.address && (
            <div className={cx.infoItem}>
              <span className={cx.infoLabel}>Address</span>
              <span className={cx.infoValue}>{content.address}</span>
            </div>
          )}
          {content.phone && (
            <div className={cx.infoItem}>
              <span className={cx.infoLabel}>Phone</span>
              <a href={`tel:${content.phone}`} className={cx.infoValue}>{content.phone}</a>
            </div>
          )}
          {content.email && (
            <div className={cx.infoItem}>
              <span className={cx.infoLabel}>Email</span>
              <a href={`mailto:${content.email}`} className={cx.infoValue}>{content.email}</a>
            </div>
          )}
          {content.hours && (
            <div className={cx.infoItem}>
              <span className={cx.infoLabel}>Hours</span>
              <span className={cx.infoValue}>{content.hours}</span>
            </div>
          )}
        </div>

        {fields.length > 0 && (
          <form ref={formRef} className={cx.form} onSubmit={handleSubmit}>
            {(content.formTitle || content.formDescription) && (
              <div className="site-contact-form-heading">
                {content.formTitle && <h2>{content.formTitle}</h2>}
                {content.formDescription && <p>{content.formDescription}</p>}
              </div>
            )}
            {visibleFields.map((field) => (
              <FormField
                key={field.name}
                field={field}
                classNames={cx}
              />
            ))}
            {consent && (
              <div className={`${cx.fieldWrapper} site-form-field--full site-consent-field`.trim()}>
                <label className="site-consent-control" htmlFor={consent.name}>
                  <input
                    id={consent.name}
                    name={consent.name}
                    type="checkbox"
                    value="true"
                    required={consent.required}
                    disabled={previewMode}
                  />
                  <span>
                    {consent.text}
                    {consent.required && ' *'}
                  </span>
                </label>
              </div>
            )}
            <input type="hidden" name="pageSlug" value={pageSlug} />
            <button
              type={previewMode ? 'button' : 'submit'}
              className={cx.submitButton}
              disabled={previewMode || submitState === 'submitting'}
            >
              {previewMode ? 'Preview only' : submitState === 'submitting' ? 'Sending...' : submitButtonText}
            </button>
            {previewMode && (
              <p className="pk-contact__status pk-contact__status--error">
                Preview mode: form submission is disabled.
              </p>
            )}
            {message && (
              <p className={submitState === 'error' ? 'pk-contact__status pk-contact__status--error' : 'pk-contact__status pk-contact__status--success'}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

function FormField({
  field,
  classNames,
}: {
  field: FormFieldDefinition;
  classNames: typeof contactDefaults;
}) {
  if (field.hidden) {
    return <input type="hidden" name={field.name} defaultValue={field.defaultValue ?? ''} />;
  }

  return (
    <div className={`${classNames.fieldWrapper} ${getFieldWidthClass(field.width)}`.trim()}>
      <label className={classNames.fieldLabel} htmlFor={field.name}>
        {field.label}
        {field.required && ' *'}
      </label>
      {renderField(field, classNames)}
      {field.helpText && <p className="pk-contact__field-help">{field.helpText}</p>}
    </div>
  );
}

function renderField(field: FormFieldDefinition, classNames: typeof contactDefaults) {
  const sharedProps = {
    id: field.name,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder,
    defaultValue: field.defaultValue ?? '',
  };

  if (field.type === 'textarea') {
    return <textarea {...sharedProps} className={classNames.fieldTextarea} />;
  }

  if (field.type === 'select') {
    return (
      <select
        id={field.name}
        name={field.name}
        required={field.required}
        defaultValue={field.defaultValue ?? ''}
        className={classNames.fieldInput}
      >
        <option value="">{field.placeholder || 'Select an option'}</option>
        {(field.options ?? []).map((option) => (
          <option key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <input
        id={field.name}
        name={field.name}
        type="checkbox"
        required={field.required}
        defaultChecked={field.defaultValue === 'true'}
      />
    );
  }

  return (
    <input
      {...sharedProps}
      type={field.type === 'phone' ? 'tel' : field.type || 'text'}
      className={classNames.fieldInput}
    />
  );
}

function getFields(content: ContactBlockContent, formDefinition?: FormDefinition): FormFieldDefinition[] {
  if (formDefinition?.fields?.length) {
    return [...formDefinition.fields].sort((a, b) => a.order - b.order);
  }

  return (content.formFields ?? []).map((field, index) => ({
    id: getFieldName(field, index),
    name: getFieldName(field, index),
    label: field.label,
    type: normalizeFieldType(field.type),
    required: field.required,
    placeholder: field.placeholder,
    helpText: '',
    autocomplete: '',
    defaultValue: '',
    order: index,
    hidden: false,
    width: 'full',
    options: [],
    validation: {
      pattern: '',
      message: '',
    },
    attributes: {},
  }));
}

function getFieldWidthClass(width: FormFieldDefinition['width']) {
  if (width === 'half') return 'site-form-field--half';
  if (width === 'third') return 'site-form-field--third';
  if (width === 'two-thirds') return 'site-form-field--two-thirds';
  return 'site-form-field--full';
}

function getConsent(formDefinition?: FormDefinition) {
  const consent = formDefinition?.consent;
  const text = consent?.text?.trim();
  if (!consent || !text) return null;

  return {
    name: consent.fieldName?.trim() || 'consent',
    text,
    required: consent.required,
  };
}

function getOptionValue(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? option : option.value;
}

function getOptionLabel(option: string | { value: string; label: string }) {
  return typeof option === 'string' ? option : option.label;
}

function getFieldName(field: BaseContactContent['formFields'][number], index: number) {
  const fieldWithName = field as typeof field & { name?: string };
  return fieldWithName.name || field.label?.trim().toLowerCase().replace(/\s+/g, '-') || `field-${index}`;
}

function normalizeFieldType(type: string): FormFieldDefinition['type'] {
  return type === 'phone' || type === 'textarea' || type === 'email' || type === 'hidden' || type === 'select' || type === 'checkbox' || type === 'radio'
    ? type
    : 'text';
}

function collectFormData(form: HTMLFormElement, pageSlug: string) {
  const formData = new FormData(form);
  const body: Record<string, unknown> = {
    pageSlug,
  };

  formData.forEach((value, key) => {
    body[key] = value;
  });

  return body;
}

async function getErrorMessage(response: Response) {
  const text = await response.text();

  try {
    const data = JSON.parse(text) as { message?: string; detail?: string; title?: string };
    return data.message || data.detail || data.title || text || 'The form could not be submitted.';
  } catch {
    return text || 'The form could not be submitted.';
  }
}
