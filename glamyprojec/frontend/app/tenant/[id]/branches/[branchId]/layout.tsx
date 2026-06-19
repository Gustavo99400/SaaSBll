export function generateStaticParams() {
  return [{ id: 'sample', branchId: 'sample' }];
}

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
