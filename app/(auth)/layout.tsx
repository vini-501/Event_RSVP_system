export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login page handles its own full-screen layout with split panel design.
  // Other auth pages (signup, reset-password) get a centered card layout.
  return <>{children}</>
}
