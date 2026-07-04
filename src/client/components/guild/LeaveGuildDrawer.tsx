import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';

type LeaveGuildDrawerProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}>;

export function LeaveGuildDrawer({
  open,
  onClose,
  onConfirm,
  loading,
}: LeaveGuildDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle className="font-display tracking-widest text-lg">
            Leave Guild?
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            Your contribution will be removed from the guild score.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="w-full font-bold"
          >
            {loading ? 'Leaving...' : 'Leave Guild'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
