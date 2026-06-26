'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConfirmAge } from '@/lib/api/hooks';

const KEY = 'primal-age-confirmed';

export default function AgeGate({ isAdult, children }: { isAdult: boolean; children: React.ReactNode }) {
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();
  const { mutate: confirmAge } = useConfirmAge();

  useEffect(() => {
    if (!isAdult) return;
    if (typeof window !== 'undefined' && localStorage.getItem(KEY)) setConfirmed(true);
  }, [isAdult]);

  if (!isAdult || confirmed) return <>{children}</>;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) router.push('/categories'); }}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <ShieldAlert className="mx-auto mb-2 h-10 w-10 text-destructive" strokeWidth={1.75} aria-hidden />
          <DialogTitle className="text-center font-display text-2xl">
            Avez-vous 18 ans ou plus&nbsp;?
          </DialogTitle>
          <DialogDescription className="text-center">
            Cette catégorie est réservée aux personnes majeures.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            onClick={() => { confirmAge(); localStorage.setItem(KEY, '1'); setConfirmed(true); }}
            className="w-full"
          >
            J&apos;ai 18 ans ou plus
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/categories')}
            className="w-full"
          >
            Quitter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
