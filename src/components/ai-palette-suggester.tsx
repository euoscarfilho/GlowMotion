'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { suggestPaletteAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';

type AiPaletteSuggesterProps = {
  onPaletteSuggested: (colors: string[]) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Generating...' : 'Generate Palette'}
    </Button>
  );
}

export function AiPaletteSuggester({ onPaletteSuggested }: AiPaletteSuggesterProps) {
  const initialState = { message: '', colors: [], error: '' };
  const [state, dispatch] = useActionState(suggestPaletteAction, initialState);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state.colors && state.colors.length > 0) {
      onPaletteSuggested(state.colors);
      setOpen(false);
    }
  }, [state, onPaletteSuggested, toast]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" /> Suggest Palette
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={dispatch}>
          <DialogHeader>
            <DialogTitle>AI Palette Generator</DialogTitle>
            <DialogDescription>
              Describe a theme, and AI will generate a color palette for your light show.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="theme" className="text-right">
                Theme
              </Label>
              <Input
                id="theme"
                name="theme"
                defaultValue="Vibrant sunset"
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
