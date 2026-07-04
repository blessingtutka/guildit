import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { Landmark } from 'lucide-react';

type CreateGuildDrawerProps = Readonly<{
  open: boolean;
  onClose: () => void;
  playerColor: string;
  loading: boolean;
  onSubmit: (name: string) => void;
}>;

export function CreateGuildDrawer({
  open,
  onClose,
  playerColor,
  loading,
  onSubmit,
}: CreateGuildDrawerProps) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (name.trim().length >= 3) {
      onSubmit(name.trim());
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <DrawerTitle className="font-display tracking-widest text-lg">
            Found a Guild
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            Choose a name that strikes fear into rivals.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter guild name..."
            maxLength={32}
            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <p className="text-xs text-muted-foreground text-right">
            {name.length}/32
          </p>
        </div>

        <DrawerFooter className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={loading || name.trim().length < 3}
            className="w-full font-bold text-white flex intems-center justify-center gap-2"
            style={{ backgroundColor: playerColor, border: 'none' }}
          >
            <Landmark />
            {loading ? 'Founding...' : 'Found Guild'}
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
