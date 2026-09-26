import { source } from '@/lib/source';
import { GlassLayout } from 'fumadocs-ui/layouts/glass';
import { getLayoutTabs } from 'fumadocs-ui/layouts/shared';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = source.getPageTree();

  // getLayoutTabs' defaultTransform wraps each root's icon in a
  // `size-full [&_svg]:size-full` div. In the glass dropdown that beats the trigger's
  // own `[&_svg]:size-4`, so the icon fills the control and squeezes the label to an
  // ellipsis. Pass the icon straight through instead.
  //
  // The tabs are resolved here rather than handed to GlassLayout as a `transform`
  // option, because GlassLayout is a client component and a function prop cannot
  // cross that boundary.
  const tabs = getLayoutTabs(tree, {
    transform: (option, node) => ({ ...option, icon: node.icon }),
  });

  return (
    <GlassLayout {...baseOptions()} tree={tree} tabs={tabs}>
      {children}
    </GlassLayout>
  );
}
