import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import { createClient } from '@/lib/supabase/server';

export default async function StoreShell({ children }) {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('value').eq('key', 'whatsapp_number').single();
  const whatsappNumber = data?.value || '923289812517';

  return (
    <>
      <Navbar />
      <div className="min-h-[50vh]">{children}</div>
      <Footer />
      <FloatingWhatsApp whatsappNumber={whatsappNumber} />
    </>
  );
}
