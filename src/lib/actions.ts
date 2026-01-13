'use server';

import { suggestColorPalette } from '@/ai/flows/suggest-color-palette';
import { z } from 'zod';

const SuggestPaletteSchema = z.object({
  theme: z.string().min(3, 'Theme must be at least 3 characters long.'),
});

type SuggestPaletteState = {
  message?: string;
  colors?: string[];
  error?: string;
};

export async function suggestPaletteAction(
  prevState: SuggestPaletteState,
  formData: FormData,
): Promise<SuggestPaletteState> {
  const validatedFields = SuggestPaletteSchema.safeParse({
    theme: formData.get('theme'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid theme provided. Please enter a valid theme.',
    };
  }

  try {
    const result = await suggestColorPalette({ theme: validatedFields.data.theme });
    if (result.colors && result.colors.length > 0) {
      return { message: 'Palette generated!', colors: result.colors };
    }
    return { error: 'Could not generate a palette. Please try another theme.' };
  } catch (error) {
    console.error(error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
