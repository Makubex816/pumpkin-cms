'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, Page, PageChangeSource, PageFormConfig } from 'pumpkin-ts-models'

const LOCAL_PREVIEW_HOSTS: Record<string, string> = {
  'ice-rink-rentals': 'http://localhost:3002',
  'roller-rink-rentals': 'http://roller.localhost:3002',
}

const FIELD_TYPES = ['text', 'email', 'tel', 'phone', 'date', 'number', 'textarea', 'select', 'checkbox', 'hidden'] as const
const NORMALIZED_FIELDS = ['name', 'email', 'phone', 'eventDate', 'eventLocation', 'eventType', 'estimatedAttendance', 'message'] as const

type FieldType = (typeof FIELD_TYPES)[number]
type NormalizedLeadField = (typeof NORMALIZED_FIELDS)[number]

interface EditableContent {
  [key: string]: unknown
}

interface EditableFormField {
  label: string
  type: string
  required: boolean
  placeholder: string
  name?: string
  key?: string
  helpText?: string
  options?: string[]
}

interface ContactFormDescriptor {
  key: string
  page: Page
  blockIndex: number
  formId: string
  title: string
  subtitle: string
  fieldCount: number
  requiredFieldCount: number
  submitButtonText: string
  staticEndpointStatus: string
}

interface ValidationResult {
  errors: string[]
  warnings: string[]
}

function isRecord(value: unknown): value is EditableContent {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : false
}

function clonePage(page: Page) {
  return JSON.parse(JSON.stringify(page)) as Page
}

export default function FormBuilderPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedFormKey, setSelectedFormKey] = useState<string>('')
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null)
  const [originalFields, setOriginalFields] = useState<EditableFormField[]>([])
  const [showAdvancedKeys, setShowAdvancedKeys] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editFeedback, setEditFeedback] = useState('')
  const editorRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadPages() {
      if (!token || !currentTenant) {
        setPages([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const tenantPages = await apiClient.getPages(token, currentTenant.tenantId)
        if (isCurrent) {
          setPages(tenantPages)
        }
      } catch (err) {
        console.error('[Form Builder] Failed to load pages:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load tenant pages.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadPages()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant])

  const forms = useMemo(() => buildFormDescriptors(pages), [pages])

  useEffect(() => {
    if (selectedFormKey && forms.some((form) => form.key === selectedFormKey)) return

    if (forms.length > 0) {
      selectForm(forms[0])
      return
    }

    setSelectedFormKey('')
    setEditingPage(null)
    setEditingBlockIndex(null)
    setOriginalFields([])
  }, [forms, selectedFormKey])

  const selectedDescriptor = forms.find((form) => form.key === selectedFormKey) || null
  const contactContent = editingPage && editingBlockIndex !== null
    ? getContactContent(editingPage, editingBlockIndex)
    : null
  const formConfig = editingPage ? getFormConfig(editingPage, contactContent) : null
  const validation = editingPage && contactContent && formConfig
    ? validateForm(editingPage, contactContent, formConfig, originalFields)
    : { errors: [], warnings: [] }

  function selectForm(
    form: ContactFormDescriptor,
    options: { focusEditor?: boolean; showFeedback?: boolean } = {}
  ) {
    const pageCopy = clonePage(form.page)
    setSelectedFormKey(form.key)
    setEditingPage(pageCopy)
    setEditingBlockIndex(form.blockIndex)
    setOriginalFields(getContactContent(pageCopy, form.blockIndex).formFields)
    setSuccess(null)
    setError(null)

    if (options.showFeedback) {
      setEditFeedback(`Editing ${form.formId} form on ${form.page.pageSlug} page.`)
    }

    if (options.focusEditor) {
      window.setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        editorRef.current?.focus({ preventScroll: true })
      }, 50)
    }
  }

  function handleEditForm(form: ContactFormDescriptor) {
    selectForm(form, { focusEditor: true, showFeedback: true })
  }

  function updateContactContent(patch: Partial<EditableContent>) {
    if (!editingPage || editingBlockIndex === null) return

    setEditingPage((current) => {
      if (!current) return current
      const nextPage = clonePage(current)
      const block = nextPage.ContentData.ContentBlocks[editingBlockIndex] as IHtmlBlock & { content?: EditableContent }
      block.content = {
        ...getContactContent(nextPage, editingBlockIndex),
        ...patch,
      }
      return nextPage
    })
  }

  function updateFormConfig(patch: Partial<PageFormConfig>) {
    setEditingPage((current) => {
      if (!current) return current
      return {
        ...current,
        formConfig: {
          ...getFormConfig(current, contactContent),
          ...patch,
        },
      }
    })
  }

  function updateNormalizedFieldMap(field: NormalizedLeadField, value: string) {
    setEditingPage((current) => {
      if (!current) return current
      const currentConfig = getFormConfig(current, contactContent)
      return {
        ...current,
        formConfig: {
          ...currentConfig,
          normalizedFieldMap: {
            ...(currentConfig.normalizedFieldMap || {}),
            [field]: normalizeFieldKey(value),
          },
        },
      }
    })
  }

  function updateField(index: number, patch: Partial<EditableFormField>) {
    if (!contactContent) return

    const fields = [...contactContent.formFields]
    fields[index] = normalizeFormField({
      ...fields[index],
      ...patch,
    })
    updateContactContent({ formFields: fields })
  }

  function moveField(index: number, direction: -1 | 1) {
    if (!contactContent) return

    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= contactContent.formFields.length) return

    const fields = [...contactContent.formFields]
    const [field] = fields.splice(index, 1)
    fields.splice(targetIndex, 0, field)
    updateContactContent({ formFields: fields })
  }

  function addField() {
    if (!contactContent) return

    updateContactContent({
      formFields: [
        ...contactContent.formFields,
        {
          label: 'New Field',
          name: nextAvailableFieldKey(contactContent.formFields, 'new-field'),
          type: 'text',
          required: false,
          placeholder: '',
          helpText: '',
          options: [],
        },
      ],
    })
  }

  async function saveForm() {
    if (!token || !currentTenant || !editingPage || !selectedDescriptor || saving) return

    const latestValidation = contactContent && formConfig
      ? validateForm(editingPage, contactContent, formConfig, originalFields)
      : { errors: ['No editable Contact block is selected.'], warnings: [] }

    if (latestValidation.errors.length > 0) {
      setError('Fix validation errors before saving.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const pageToSave: Page = {
        ...editingPage,
        staticPublishing: {
          staticEligible: editingPage.staticPublishing?.staticEligible ?? true,
          needsRebuild: true,
          lastSnapshotAt: editingPage.staticPublishing?.lastSnapshotAt || '',
          lastStaticBuildAt: editingPage.staticPublishing?.lastStaticBuildAt || '',
          lastDeployedAt: editingPage.staticPublishing?.lastDeployedAt || '',
          contentHash: editingPage.staticPublishing?.contentHash || '',
          lastPublishedContentHash: editingPage.staticPublishing?.lastPublishedContentHash || '',
          deploymentStatus: editingPage.staticPublishing?.deploymentStatus === 'deployed'
            ? 'pending_rebuild'
            : editingPage.staticPublishing?.deploymentStatus || 'pending_rebuild',
        },
      }

      const savedPage = await apiClient.updatePage(
        token,
        currentTenant.tenantId,
        selectedDescriptor.page.pageSlug,
        pageToSave,
        {
          changeSource: 'form_builder' as PageChangeSource,
          changeSummary: `Form Builder update for ${selectedDescriptor.formId}`,
        }
      )

      setPages((current) => current.map((page) => page.PageId === savedPage.PageId ? savedPage : page))
      setEditingPage(clonePage(savedPage))
      if (editingBlockIndex !== null) {
        setOriginalFields(getContactContent(savedPage, editingBlockIndex).formFields)
      }
      setSuccess('Form template saved. Static publishing is marked as needing rebuild.')
    } catch (err) {
      console.error('[Form Builder] Failed to save form:', err)
      setError(getErrorMessage(err, 'Failed to save form template.'))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <StateCard title="Form Builder" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Form Builder" message="Please log in to edit tenant form templates." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Form Builder" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Form Builder" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Form Builder" message="Select a tenant/site before editing form templates." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Forms</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Form Builder</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped editor for Contact/Quote form templates on {currentTenant.name || currentTenant.tenantId}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/forms" className="btn btn-secondary">Lead Inbox</Link>
            <Link href="/dashboard/publishing" className="btn btn-secondary">Publishing Dashboard</Link>
          </div>
        </div>
      </header>

      {loading && <div className="card text-sm text-neutral-600">Loading form templates...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}
      {success && <div className="card border-green-200 bg-green-50 text-sm text-green-800">{success}</div>}

      {!loading && !error && forms.length === 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900">No Form Templates Found</h2>
          <p className="mt-2 text-sm text-neutral-600">
            This tenant does not have pages with Contact blocks yet. Add a Contact block through the page editor first.
          </p>
        </div>
      )}

      {!loading && forms.length > 0 && (
        <>
          <FormList forms={forms} selectedKey={selectedFormKey} onSelect={handleEditForm} />

          {editingPage && contactContent && formConfig && selectedDescriptor && (
            <section
              id="form-builder-editor"
              ref={editorRef}
              tabIndex={-1}
              className="card scroll-mt-24 space-y-6 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-primary-700">Currently Editing</p>
                  <h2 className="mt-1 text-xl font-semibold text-neutral-900">Edit Form Template</h2>
                  <p className="mt-1 text-sm text-neutral-600">
                    Form `{selectedDescriptor.formId}` on `{editingPage.pageSlug}` - {editingPage.MetaData?.title || editingPage.pageSlug}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="#form-template-list" className="btn btn-secondary">
                    Form List
                  </a>
                  <a href={getPreviewUrl(editingPage)} target="_blank" rel="noreferrer" className="btn btn-secondary">
                    Preview Page
                  </a>
                  <Link href={`/dashboard/forms`} className="btn btn-secondary">
                    View Leads
                  </Link>
                  <Link href={`/dashboard/pages/${encodeURIComponent(editingPage.pageSlug)}/edit?tenantId=${encodeURIComponent(editingPage.tenantId)}`} className="btn btn-secondary">
                    Edit Full Page
                  </Link>
                  <button
                    type="button"
                    onClick={saveForm}
                    disabled={saving || validation.errors.length > 0}
                    className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Form'}
                  </button>
                </div>
              </div>

              {editFeedback && (
                <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-medium text-primary-800">
                  {editFeedback}
                </div>
              )}

              <ValidationPanel validation={validation} />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TextField label="Form ID" value={selectedDescriptor.formId} readOnly helpText="Form ID is guarded in this MVP. It is derived from the Contact block id or page formConfig." />
                <TextField label="Heading" value={stringValue(contactContent.title)} onChange={(value) => updateContactContent({ title: value })} />
                <TextField label="Subtitle" value={stringValue(contactContent.subtitle)} onChange={(value) => updateContactContent({ subtitle: value })} multiline />
                <TextField label="Submit Button Text" value={stringValue(contactContent.submitButtonText)} onChange={(value) => updateContactContent({ submitButtonText: value })} />
                <TextField label="Form Type" value={formConfig.formType || ''} onChange={(value) => updateFormConfig({ formType: value })} />
                <TextField label="Conversion Goal" value={formConfig.conversionGoal || ''} onChange={(value) => updateFormConfig({ conversionGoal: value })} />
                <TextField label="Routing Mode" value={formConfig.routingMode || ''} onChange={(value) => updateFormConfig({ routingMode: value })} />
                <TextField label="Recipient Group" value={formConfig.recipientGroup || ''} onChange={(value) => updateFormConfig({ recipientGroup: value })} />
                <TextField label="Static Form Endpoint Key" value={formConfig.staticFormEndpointKey || ''} onChange={(value) => updateFormConfig({ staticFormEndpointKey: value })} />
                <TextField label="Thank You URL" value={formConfig.thankYouUrl || ''} onChange={(value) => updateFormConfig({ thankYouUrl: value })} />
                <TextField label="Thank You Message" value={formConfig.thankYouMessage || ''} onChange={(value) => updateFormConfig({ thankYouMessage: value })} multiline />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <CheckboxField label="Requires Consent" checked={formConfig.requiresConsent ?? formConfig.consentRequired ?? true} onChange={(value) => updateFormConfig({ requiresConsent: value, consentRequired: value })} />
                <CheckboxField label="Consent Required" checked={formConfig.consentRequired ?? true} onChange={(value) => updateFormConfig({ consentRequired: value })} />
                <CheckboxField label="Spam Protection Required" checked={formConfig.spamProtectionRequired ?? true} onChange={(value) => updateFormConfig({ spamProtectionRequired: value })} />
                <CheckboxField label="Spam Protection Enabled" checked={Boolean(formConfig.spamProtectionEnabled)} onChange={(value) => updateFormConfig({ spamProtectionEnabled: value })} />
              </div>

              <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">Fields</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Field keys control submitted `FormEntry.formData` keys and Lead Inbox mapping. Change them carefully.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setShowAdvancedKeys((value) => !value)} className="btn btn-secondary">
                      {showAdvancedKeys ? 'Hide Field Keys' : 'Show Field Keys'}
                    </button>
                    <button type="button" onClick={addField} className="btn btn-secondary">Add Field</button>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {contactContent.formFields.map((field, index) => (
                    <FieldEditor
                      key={`${getFieldKey(field, index)}-${index}`}
                      field={field}
                      index={index}
                      showAdvancedKeys={showAdvancedKeys}
                      canMoveUp={index > 0}
                      canMoveDown={index < contactContent.formFields.length - 1}
                      onChange={(patch) => updateField(index, patch)}
                      onMove={(direction) => moveField(index, direction)}
                    />
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="text-lg font-semibold text-neutral-900">Normalized Lead Mapping</h3>
                <p className="mt-1 text-sm text-neutral-600">
                  These mappings help keep Lead Inbox exports stable even when public labels change.
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {NORMALIZED_FIELDS.map((field) => (
                    <TextField
                      key={field}
                      label={field}
                      value={formConfig.normalizedFieldMap?.[field] || ''}
                      onChange={(value) => updateNormalizedFieldMap(field, value)}
                      placeholder={suggestFieldKey(contactContent.formFields, field)}
                    />
                  ))}
                </div>
              </section>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function FormList({
  forms,
  selectedKey,
  onSelect,
}: {
  forms: ContactFormDescriptor[]
  selectedKey: string
  onSelect: (form: ContactFormDescriptor) => void
}) {
  return (
    <section id="form-template-list" className="card scroll-mt-24 overflow-hidden">
      <h2 className="text-lg font-semibold text-neutral-900">Tenant Form Templates</h2>
      <p className="mt-1 text-sm text-neutral-600">Detected from Contact blocks and page form metadata.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Form ID</th>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Fields</th>
              <th className="px-4 py-3">Required</th>
              <th className="px-4 py-3">Submit Text</th>
              <th className="px-4 py-3">Static Endpoint</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {forms.map((form) => {
              const isSelected = form.key === selectedKey
              return (
              <tr
                key={form.key}
                className={isSelected ? 'border-l-4 border-primary-500 bg-primary-50/70' : undefined}
                aria-current={isSelected ? 'true' : undefined}
              >
                <td className="px-4 py-3 font-medium text-neutral-900">{form.formId}</td>
                <td className="px-4 py-3 text-neutral-700">{form.page.MetaData?.title || form.title || form.page.pageSlug}</td>
                <td className="px-4 py-3 text-neutral-700">{form.page.pageSlug}</td>
                <td className="px-4 py-3 text-neutral-700">{form.page.formConfig?.formType || 'not recorded'}</td>
                <td className="px-4 py-3 text-neutral-700">{form.fieldCount}</td>
                <td className="px-4 py-3 text-neutral-700">{form.requiredFieldCount}</td>
                <td className="px-4 py-3 text-neutral-700">{form.submitButtonText || 'missing'}</td>
                <td className="px-4 py-3 text-neutral-700">{form.staticEndpointStatus}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(form)}
                      className={
                        isSelected
                          ? 'rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-700'
                          : 'text-primary-700 hover:text-primary-900'
                      }
                    >
                      {isSelected ? 'Editing' : 'Edit Form'}
                    </button>
                    <a href={getPreviewUrl(form.page)} target="_blank" rel="noreferrer" className="text-primary-700 hover:text-primary-900">
                      Preview
                    </a>
                    <Link href="/dashboard/forms" className="text-primary-700 hover:text-primary-900">
                      Leads
                    </Link>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FieldEditor({
  field,
  index,
  showAdvancedKeys,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
}: {
  field: EditableFormField
  index: number
  showAdvancedKeys: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (patch: Partial<EditableFormField>) => void
  onMove: (direction: -1 | 1) => void
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-neutral-900">Field {index + 1}</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => onMove(-1)} disabled={!canMoveUp} className="btn btn-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50">Move Up</button>
          <button type="button" onClick={() => onMove(1)} disabled={!canMoveDown} className="btn btn-secondary text-xs disabled:cursor-not-allowed disabled:opacity-50">Move Down</button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Label" value={field.label} onChange={(value) => onChange({ label: value })} />
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Type</span>
          <select
            value={FIELD_TYPES.includes(field.type as FieldType) ? field.type : 'text'}
            onChange={(event) => onChange({ type: event.target.value })}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        {showAdvancedKeys && (
          <TextField
            label="Field Key"
            value={field.name || field.key || getFieldKey(field, index)}
            onChange={(value) => onChange({ name: normalizeFieldKey(value), key: normalizeFieldKey(value) })}
            helpText="Advanced: changing this changes future submitted formData keys. Existing FormEntry records are not renamed."
          />
        )}
        <TextField label="Placeholder" value={field.placeholder} onChange={(value) => onChange({ placeholder: value })} />
        <TextField label="Help Text" value={field.helpText || ''} onChange={(value) => onChange({ helpText: value })} />
        {(field.type === 'select' || field.type === 'checkbox') && (
          <TextField
            label="Options"
            value={(field.options || []).join(', ')}
            onChange={(value) => onChange({ options: splitOptions(value) })}
            helpText="Comma-separated options. Select fields use these as choices."
          />
        )}
        <CheckboxField label="Required" checked={field.required} onChange={(value) => onChange({ required: value })} />
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder = '',
  helpText = '',
  readOnly = false,
  multiline = false,
}: {
  label: string
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  helpText?: string
  readOnly?: boolean
  multiline?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      )}
      {helpText && <span className="mt-1 block text-xs text-neutral-500">{helpText}</span>}
    </label>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
      />
      {label}
    </label>
  )
}

function ValidationPanel({ validation }: { validation: ValidationResult }) {
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        No form validation warnings for the current template.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {validation.errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <div className="font-semibold">Fix before saving</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="font-semibold">Warnings</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50' : ''}`}>
      <h1 className={`text-2xl font-bold ${tone === 'error' ? 'text-red-900' : 'text-neutral-900'}`}>{title}</h1>
      <p className={`mt-2 ${tone === 'error' ? 'text-red-800' : 'text-neutral-600'}`}>{message}</p>
    </div>
  )
}

function buildFormDescriptors(pages: Page[]): ContactFormDescriptor[] {
  return pages.flatMap((page) => {
    const blocks = getBlocks(page)
    return blocks
      .map((block, blockIndex) => ({ block, blockIndex }))
      .filter(({ block }) => block.type === 'Contact')
      .map(({ blockIndex }) => {
        const content = getContactContent(page, blockIndex)
        const formConfig = getFormConfig(page, content)
        const formId = content.id || formConfig.formId || `${page.pageSlug}-contact`
        return {
          key: `${page.tenantId}:${page.pageSlug}:${blockIndex}`,
          page,
          blockIndex,
          formId,
          title: content.title,
          subtitle: content.subtitle,
          fieldCount: content.formFields.length,
          requiredFieldCount: content.formFields.filter((field) => field.required).length,
          submitButtonText: content.submitButtonText,
          staticEndpointStatus: formConfig.staticFormEndpointKey ? 'configured' : 'missing key',
        }
      })
  })
}

function getBlocks(page: Page) {
  return Array.isArray(page.ContentData?.ContentBlocks) ? page.ContentData.ContentBlocks : []
}

function getContactContent(page: Page, blockIndex: number) {
  const block = getBlocks(page)[blockIndex] as IHtmlBlock & { content?: EditableContent }
  const content = isRecord(block?.content) ? block.content : {}
  const fields = Array.isArray(content.formFields) ? content.formFields.map(normalizeFormField) : []

  return {
    id: stringValue(content.id),
    title: stringValue(content.title),
    subtitle: stringValue(content.subtitle),
    address: stringValue(content.address),
    phone: stringValue(content.phone),
    email: stringValue(content.email),
    hours: stringValue(content.hours),
    submitButtonText: stringValue(content.submitButtonText),
    formFields: fields,
    socialLinks: Array.isArray(content.socialLinks) ? content.socialLinks : [],
    ...content,
  }
}

function normalizeFormField(value: unknown): EditableFormField {
  const field = isRecord(value) ? value : {}
  return {
    label: stringValue(field.label),
    type: stringValue(field.type) || 'text',
    required: booleanValue(field.required),
    placeholder: stringValue(field.placeholder),
    name: stringValue(field.name),
    key: stringValue(field.key),
    helpText: stringValue(field.helpText),
    options: Array.isArray(field.options) ? field.options.map(stringValue).filter(Boolean) : splitOptions(stringValue(field.options)),
  }
}

function getFormConfig(page: Page, contactContent?: ReturnType<typeof getContactContent> | null): PageFormConfig {
  return {
    formId: page.formConfig?.formId || contactContent?.id || `${page.pageSlug}-contact`,
    formType: page.formConfig?.formType || '',
    conversionGoal: page.formConfig?.conversionGoal || '',
    routingMode: page.formConfig?.routingMode || '',
    thankYouUrl: page.formConfig?.thankYouUrl || '',
    thankYouMessage: page.formConfig?.thankYouMessage || '',
    recipientGroup: page.formConfig?.recipientGroup || '',
    staticFormEndpointKey: page.formConfig?.staticFormEndpointKey || '',
    normalizedFieldMap: page.formConfig?.normalizedFieldMap || {},
    requiresConsent: page.formConfig?.requiresConsent ?? true,
    consentRequired: page.formConfig?.consentRequired ?? true,
    spamProtectionRequired: page.formConfig?.spamProtectionRequired ?? true,
    spamProtectionEnabled: Boolean(page.formConfig?.spamProtectionEnabled),
  }
}

function validateForm(page: Page, content: ReturnType<typeof getContactContent>, formConfig: PageFormConfig, originalFields: EditableFormField[]): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const keys = content.formFields.map(getFieldKey)
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index)

  if (!content.submitButtonText.trim()) warnings.push('Submit button text is missing.')
  if (!formConfig.staticFormEndpointKey?.trim()) warnings.push('Static form endpoint key is missing; static exports still require an external form endpoint.')
  if (!formConfig.consentRequired && !formConfig.requiresConsent) warnings.push('Consent is not marked as required.')
  if (!formConfig.spamProtectionRequired && !formConfig.spamProtectionEnabled) warnings.push('No spam protection requirement is recorded.')
  if (page.googleAds?.eligible && (!content.submitButtonText.trim() || !hasLeadField(content.formFields, 'email'))) {
    warnings.push('Google Ads eligible page has weak form/CTA setup.')
  }

  duplicateKeys.forEach((key) => errors.push(`Duplicate field key: ${key}`))

  content.formFields.forEach((field, index) => {
    if (!FIELD_TYPES.includes(field.type as FieldType)) errors.push(`Field ${index + 1} has unsupported type "${field.type}".`)
    if (field.required && !field.label.trim()) warnings.push(`Required field ${index + 1} is missing a label.`)
    if ((field.type === 'select' || field.type === 'checkbox') && (field.options || []).length === 0) {
      warnings.push(`Field "${field.label || index + 1}" is ${field.type} but has no options.`)
    }

    const originalKey = originalFields[index] ? getFieldKey(originalFields[index], index) : ''
    const currentKey = getFieldKey(field, index)
    if (originalKey && currentKey && originalKey !== currentKey) {
      warnings.push(`Field key changed from "${originalKey}" to "${currentKey}". Existing FormEntry records are not renamed.`)
    }
  })

  ;(['name', 'email', 'phone', 'eventLocation'] as NormalizedLeadField[]).forEach((field) => {
    if (!hasLeadField(content.formFields, field) && !formConfig.normalizedFieldMap?.[field]) {
      warnings.push(`Recommended lead field mapping is missing: ${field}.`)
    }
  })

  return { errors: Array.from(new Set(errors)), warnings: Array.from(new Set(warnings)) }
}

function hasLeadField(fields: EditableFormField[], normalizedField: NormalizedLeadField) {
  return fields.some((field, index) => {
    const candidate = `${field.label} ${field.name || ''} ${field.key || ''} ${getFieldKey(field, index)}`.toLowerCase()
    switch (normalizedField) {
      case 'name':
        return candidate.includes('name')
      case 'email':
        return candidate.includes('email')
      case 'phone':
        return candidate.includes('phone') || candidate.includes('tel')
      case 'eventDate':
        return candidate.includes('date')
      case 'eventLocation':
        return candidate.includes('location') || candidate.includes('city') || candidate.includes('venue')
      case 'eventType':
        return candidate.includes('type')
      case 'estimatedAttendance':
        return candidate.includes('attendance') || candidate.includes('guest')
      case 'message':
        return candidate.includes('message') || candidate.includes('goals') || candidate.includes('details')
      default:
        return false
    }
  })
}

function getFieldKey(field: EditableFormField, index: number) {
  return normalizeFieldKey(field.name || field.key || field.label || `field-${index + 1}`)
}

function normalizeFieldKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitOptions(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function nextAvailableFieldKey(fields: EditableFormField[], baseKey: string) {
  const existing = new Set(fields.map(getFieldKey))
  let key = normalizeFieldKey(baseKey) || 'field'
  let suffix = 2
  while (existing.has(key)) {
    key = `${normalizeFieldKey(baseKey)}-${suffix}`
    suffix += 1
  }
  return key
}

function suggestFieldKey(fields: EditableFormField[], normalizedField: NormalizedLeadField) {
  const match = fields.find((field, index) => hasLeadField([field], normalizedField))
  return match ? getFieldKey(match, 0) : ''
}

function getPreviewUrl(page: Page) {
  const baseUrl = LOCAL_PREVIEW_HOSTS[page.tenantId] || 'http://localhost:3002'
  return page.pageSlug === 'home' ? `${baseUrl}/` : `${baseUrl}/${page.pageSlug}`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
