'use server';

/**
 * @fileOverview Provides a Genkit flow to suggest color palettes for LED patterns.
 *
 * - suggestColorPalette - A function that suggests a color palette.
 * - SuggestColorPaletteInput - The input type for the suggestColorPalette function.
 * - SuggestColorPaletteOutput - The return type for the suggestColorPalette function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestColorPaletteInputSchema = z.object({
  theme: z
    .string()
    .describe(
      'The theme or style for the color palette, e.g., vibrant, pastel, futuristic.'
    ),
});
export type SuggestColorPaletteInput = z.infer<typeof SuggestColorPaletteInputSchema>;

const SuggestColorPaletteOutputSchema = z.object({
  colors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .describe('An array of six hexadecimal color codes.'),
});
export type SuggestColorPaletteOutput = z.infer<typeof SuggestColorPaletteOutputSchema>;

export async function suggestColorPalette(input: SuggestColorPaletteInput): Promise<SuggestColorPaletteOutput> {
  return suggestColorPaletteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestColorPalettePrompt',
  input: {schema: SuggestColorPaletteInputSchema},
  output: {schema: SuggestColorPaletteOutputSchema},
  prompt: `You are a color palette generator for LED light patterns.

  Generate a color palette of six hexadecimal color codes based on the following theme:

  Theme: {{{theme}}}

  Ensure that all colors work well together for an LED light display.
  Return the colors as a JSON array of hexadecimal color codes.
  Each color code should be a valid 6-digit hexadecimal color (e.g., #RRGGBB).
  `, 
});

const suggestColorPaletteFlow = ai.defineFlow(
  {
    name: 'suggestColorPaletteFlow',
    inputSchema: SuggestColorPaletteInputSchema,
    outputSchema: SuggestColorPaletteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
