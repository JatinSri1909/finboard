'use client';
import Navbar from '@/components/shared/navbar';
import { useMobile } from '@/hooks/use-mobile';

export default function Home() {
  const isMobile = useMobile();

  return (
    <main>
      <Navbar />
    </main>
  );
}
