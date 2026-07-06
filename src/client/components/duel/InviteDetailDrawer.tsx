import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Check, X, Ban } from 'lucide-react';
import { CLASS_META } from '../../../shared/web';
import { classColor } from '../../lib/class-colors';
import type { DuelInvite } from '../../../shared/api';

export type InviteDirection = 'incoming' | 'outgoing';

type InviteDetailDrawerProps = Readonly<{
  invite: DuelInvite | null;
  direction: InviteDirection;
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
  onCancel: (inviteId: string) => void;
}>;

const STATUS_LABEL: Record<DuelInvite['status'], string> = {
  pending: 'Awaiting response',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export function InviteDetailDrawer({
  invite,
  direction,
  open,
  busy,
  onClose,
  onAccept,
  onDecline,
  onCancel,
}: InviteDetailDrawerProps) {
  if (!invite) return null;

  const cls = direction === 'incoming' ? invite.fromClass : undefined;
  const color = cls ? classColor(cls) : 'var(--color-primary)';
  const name =
    direction === 'incoming' ? invite.fromUsername : invite.toUsername;
  const meta = cls ? CLASS_META[cls] : null;
  const isPending = invite.status === 'pending';

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle className="font-display tracking-widest text-lg">
            {direction === 'incoming' ? 'Challenge Received' : 'Challenge Sent'}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            {STATUS_LABEL[invite.status]}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 flex flex-col items-center gap-3">
          <div
            className="size-16 rounded-full flex items-center justify-center font-bold text-xl"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {name[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="text-center">
            <p className="font-semibold text-base text-foreground">{name}</p>
            {meta && (
              <p className="text-sm text-muted-foreground">{meta.name}</p>
            )}
          </div>
        </div>

        <DrawerFooter className="pt-2">
          {!isPending && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          )}

          {isPending && direction === 'incoming' && (
            <>
              <Button
                onClick={() => void onAccept(invite.inviteId)}
                disabled={busy}
                className="w-full font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: color, border: 'none' }}
              >
                <Check className="size-4" />
                {busy ? 'Accepting...' : 'Accept Challenge'}
              </Button>
              <Button
                variant="outline"
                onClick={() => void onDecline(invite.inviteId)}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2"
              >
                <X className="size-4" />
                Decline
              </Button>
            </>
          )}

          {isPending && direction === 'outgoing' && (
            <Button
              variant="outline"
              onClick={() => void onCancel(invite.inviteId)}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 text-destructive"
            >
              <Ban className="size-4" />
              {busy ? 'Cancelling...' : 'Cancel Invite'}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
