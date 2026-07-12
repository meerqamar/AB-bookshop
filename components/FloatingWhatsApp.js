import { createClient } from '@/lib/supabase/server';

export default async function FloatingWhatsApp() {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('*').eq('key', 'whatsapp_number').single();
  
  const whatsappNumber = data?.value || '923289812517'; // default fallback
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 hover:bg-green-600 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.337a9.994 9.994 0 004.779 1.216h.004c5.505 0 9.988-4.478 9.989-9.985a9.964 9.964 0 00-2.926-7.062A9.917 9.917 0 0012.012 2zM12.01 20.256h-.003a8.318 8.318 0 01-4.244-1.156l-.304-.18-3.155.805.84-3.076-.197-.313a8.334 8.334 0 01-1.272-4.469c.001-4.606 3.75-8.353 8.362-8.353a8.32 8.32 0 015.91 2.449 8.325 8.325 0 012.446 5.908c-.001 4.606-3.75 8.353-8.357 8.353zm4.595-6.275c-.252-.126-1.488-.734-1.718-.818-.23-.084-.397-.126-.566.126-.168.252-.648.818-.795.986-.147.168-.293.189-.545.063-.252-.126-1.062-.391-2.023-1.25a7.514 7.514 0 01-1.399-1.737c-.147-.252-.016-.388.11-.514.113-.113.252-.294.378-.44.126-.147.168-.252.252-.42.084-.168.042-.315-.021-.441-.063-.126-.566-1.365-.776-1.87-.206-.494-.416-.427-.566-.435l-.482-.008c-.168 0-.44.063-.671.315-.23.252-.88 .861-.88 2.099s.901 2.434 1.028 2.602c.126.168 1.774 2.706 4.296 3.795.6.258 1.068.413 1.433.528.602.19 1.15.163 1.583.099.488-.073 1.488-.609 1.698-1.197.21-.588.21-1.092.147-1.197-.063-.105-.23-.168-.482-.294z"/>
      </svg>
    </a>
  );
}
