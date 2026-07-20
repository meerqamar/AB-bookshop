'use client';

import { createClient } from '@/lib/supabase/client';

/**
 * Sign out and hard-redirect so account UI cannot linger in client state.
 * Never blocks forever on the network — always leaves the page.
 */
export async function logoutAndRedirect(redirectTo = '/') {
  try {
    sessionStorage.removeItem('ab_order_note');
  } catch {
    // ignore
  }

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // Keep this session's cart visible after logout, but tagged so another
    // account login won't adopt it as their own cart.
    if (user?.id) {
      const userCart = localStorage.getItem(`ab_cart_u_${user.id}`);
      if (userCart) {
        localStorage.setItem('ab_cart_guest', userCart);
        localStorage.setItem('ab_cart_from', `logout:${user.id}`);
      }
    }
    await Promise.race([
      supabase.auth.signOut({ scope: 'local' }),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]);
  } catch {
    // Still leave the page even if signOut throws
  }

  window.location.href = redirectTo;
}
