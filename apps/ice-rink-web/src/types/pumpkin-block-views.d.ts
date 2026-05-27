declare module 'pumpkin-block-views' {
  import type { ComponentType, ReactNode } from 'react';
  import type { FormBlock, FormDefinition, IHtmlBlock, MenuItem, ThemeFooter, ThemeHeader } from 'pumpkin-ts-models';

  export type SlotClassNames = Record<string, string>;
  export type HeroClassNames = SlotClassNames;
  export type PrimaryCtaClassNames = SlotClassNames;
  export type SecondaryCtaClassNames = SlotClassNames;
  export type CardGridClassNames = SlotClassNames;
  export type FaqClassNames = SlotClassNames;
  export type BreadcrumbsClassNames = SlotClassNames;
  export type TrustBarClassNames = SlotClassNames;
  export type HowItWorksClassNames = SlotClassNames;
  export type ServiceAreaMapClassNames = SlotClassNames;
  export type LocalProTipsClassNames = SlotClassNames;
  export type GalleryClassNames = SlotClassNames;
  export type TestimonialsClassNames = SlotClassNames;
  export type ContactClassNames = SlotClassNames;
  export type FormBlockClassNames = SlotClassNames;
  export type BlogClassNames = SlotClassNames;
  export type HeaderClassNames = SlotClassNames;
  export type FooterClassNames = SlotClassNames;

  export interface BlockClassNamesMap {
    Hero?: HeroClassNames;
    PrimaryCTA?: PrimaryCtaClassNames;
    SecondaryCTA?: SecondaryCtaClassNames;
    CardGrid?: CardGridClassNames;
    FAQ?: FaqClassNames;
    Breadcrumbs?: BreadcrumbsClassNames;
    TrustBar?: TrustBarClassNames;
    HowItWorks?: HowItWorksClassNames;
    ServiceAreaMap?: ServiceAreaMapClassNames;
    LocalProTips?: LocalProTipsClassNames;
    Gallery?: GalleryClassNames;
    Testimonials?: TestimonialsClassNames;
    Contact?: ContactClassNames;
    formBlock?: FormBlockClassNames;
    Blog?: BlogClassNames;
  }

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

  export interface BlockOverrides {
    Contact?: {
      onSubmit?: (formData: Record<string, string>) => void;
    };
    formBlock?: {
      definitions?: FormDefinition[];
      tenantId?: string;
      siteKey?: string;
      pageSlug?: string;
      onSubmit?: (payload: FormBlockSubmitPayload) => Promise<void> | void;
    };
    Blog?: {
      renderBody?: (body: string) => ReactNode;
    };
  }

  export interface BlockViewRendererProps {
    block: IHtmlBlock;
    classNames?: BlockClassNamesMap;
    overrides?: BlockOverrides;
    approvedClasses?: string[];
    fallback?: ReactNode;
  }

  export interface HeaderViewProps {
    header: ThemeHeader;
    menu: MenuItem[];
    classNames?: HeaderClassNames;
  }

  export interface FooterViewProps {
    footer: ThemeFooter;
    menu: MenuItem[];
    logoUrl?: string;
    logoAlt?: string;
    classNames?: FooterClassNames;
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

  export const BlockViewRenderer: ComponentType<BlockViewRendererProps>;
  export const FormBlockView: ComponentType<FormBlockViewProps>;
  export const HeaderView: ComponentType<HeaderViewProps>;
  export const FooterView: ComponentType<FooterViewProps>;
}
