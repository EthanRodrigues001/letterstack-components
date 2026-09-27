import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Banner } from 'fumadocs-ui/components/banner';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { ImageZoom, type ImageZoomProps } from 'fumadocs-ui/components/image-zoom';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { EmailPreview } from '@/components/docs/email-preview';
import { InstallBlock } from '@/components/docs/install-block';
import type { ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // images become zoomable in prose
    img: (props: ComponentProps<'img'>) => <ImageZoom {...(props as ImageZoomProps)} />,
    Accordion,
    Accordions,
    Banner,
    EmailPreview,
    File,
    Files,
    Folder,
    ImageZoom,
    InlineTOC,
    InstallBlock,
    Step,
    Steps,
    // Tabs is also what ```npm fences compile to
    Tab,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    TypeTable,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
