export function generateStaticParams() {
  return [{ id: 'sample' }];
}

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
