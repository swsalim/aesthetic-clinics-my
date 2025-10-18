interface LoginLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: 'Login | Aesthetic Clinics My',
  description: 'Sign in to your Aesthetic Clinics My account',
};

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8 dark:from-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}
