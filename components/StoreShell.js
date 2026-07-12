import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function StoreShell({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
