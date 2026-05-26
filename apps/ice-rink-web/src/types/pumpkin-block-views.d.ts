declare module 'pumpkin-block-views' {
  import type { ComponentType, ReactNode } from 'react';
  import type { IHtmlBlock, MenuItem, ThemeFooter, ThemeHeader } from 'pumpkin-ts-models';

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
    Blog?: BlogClassNames;
  }

  export interface BlockOverrides {
    Contact?: {
      onSubmit?: (formData: Record<string, string>) => void;
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

  export const BlockViewRenderer: ComponentType<BlockViewRendererProps>;
  export const HeaderView: ComponentType<HeaderViewProps>;
  export const FooterView: ComponentType<FooterViewProps>;
}
