import Footer from '@/components/site/footer';
import NavMobile from '@/components/site/nav-mobile';
import Navbar from '@/components/site/navbar';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavMobile />
      <Navbar />
      <main className="flex grow flex-col justify-center">{children}</main>
      <Footer />
    </>
  );
}
