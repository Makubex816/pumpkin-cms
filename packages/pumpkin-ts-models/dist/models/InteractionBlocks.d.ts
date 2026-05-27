import { IHtmlBlock } from './IHtmlBlock';
import type { FormBlock, FormBlockContent, FormDefinition, FormDefinitionField, FormFieldType } from '../forms';
export interface GalleryImage {
    src: string;
    alt: string;
    caption: string;
}
export interface GalleryContent {
    title: string;
    subtitle: string;
    images: GalleryImage[];
}
export interface GalleryBlock extends IHtmlBlock {
    type: 'Gallery';
    content: GalleryContent;
}
export interface TestimonialItem {
    quote: string;
    author: string;
    eventType: string;
    rating: number;
}
export interface TestimonialsContent {
    title: string;
    subtitle: string;
    layout: string;
    items: TestimonialItem[];
}
export interface TestimonialsBlock extends IHtmlBlock {
    type: 'Testimonials';
    content: TestimonialsContent;
}
export interface FormField {
    name?: string;
    key?: string;
    id?: string;
    label: string;
    type: string | FormFieldType;
    required: boolean;
    placeholder: string;
    helpText?: string;
    options?: string[];
    autocomplete?: string;
    defaultValue?: string;
    hidden?: boolean;
    validation?: Record<string, unknown>;
    order?: number;
    width?: string;
    sensitive?: boolean;
    includeInLeadSummary?: boolean;
}
export interface SocialLink {
    platform: string;
    url: string;
    icon: string;
}
export interface ContactContent {
    id: string;
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    formFields: FormField[];
    submitButtonText: string;
    socialLinks: SocialLink[];
}
export interface ContactBlock extends IHtmlBlock {
    type: 'Contact';
    content: ContactContent;
}
export type { FormBlock, FormBlockContent, FormDefinition, FormDefinitionField, FormFieldType, };
//# sourceMappingURL=InteractionBlocks.d.ts.map