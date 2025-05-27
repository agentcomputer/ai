import { defineFlow, definePrompt, generate } from '@genkit-ai/flow';
import *s z from 'zod';
import { geminiPro } from '@genkit-ai/googleai'; // Assuming geminiPro or a default model

// Define input schema
export const RefineDraftInputSchema = z.object({
  originalDraft: z.string().describe('The original document draft content.'),
  modificationInstructions: z.string().describe("User's instructions on how to modify the draft."),
});
export type RefineDraftInput = z.infer<typeof RefineDraftInputSchema>;

// Define output schema
export const RefineDraftOutputSchema = z.object({
  refinedDraft: z.string().describe('The new draft after applying modifications.'),
});
export type RefineDraftOutput = z.infer<typeof RefineDraftOutputSchema>;

// Define the prompt
const refineDraftPrompt = definePrompt(
  {
    name: 'refineDraftPrompt',
    inputSchema: RefineDraftInputSchema,
    outputSchema: RefineDraftOutputSchema, // Ensure the prompt is aware of the expected output structure
    // Declare the model in the prompt metadata for clarity, though it's specified in generate()
    metadata: {
      model: geminiPro, // Or your preferred model, e.g., claude3Haiku
    },
  },
  async (input) => {
    // Construct a more explicit prompt structure for the model
    return {
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping a user refine a document. The user has provided an original draft and instructions for modification. Apply the changes as requested.
Return only the complete refined draft as a single block of text. Do not include any preamble or explanation before the refined draft itself.
Ensure that all instructions are followed. If instructions are contradictory or unclear, make a best effort to refine the draft in a logical way or ask for clarification if absolutely necessary (though preference is to refine directly).`,
        },
        {
          role: 'user',
          content: `Original Draft:
\`\`\`
${input.originalDraft}
\`\`\`

Modification Instructions:
\`\`\`
${input.modificationInstructions}
\`\`\`

Refined Draft:`, // This sets up the model to complete with the refined draft
        },
      ],
      // Specifying a candidate count or other model-specific settings can be done here if needed
      // For example, temperature could be set here or in the generate call
    };
  }
);

// Define the Genkit flow
export const refineDraftFlow = defineFlow(
  {
    name: 'refineDraftFlow',
    inputSchema: RefineDraftInputSchema,
    outputSchema: RefineDraftOutputSchema,
  },
  async (input: RefineDraftInput): Promise<RefineDraftOutput> => {
    const llmResponse = await generate({
      prompt: refineDraftPrompt,
      model: geminiPro, // Or your preferred model
      input: input,
      config: {
        temperature: 0.5, // Adjust temperature for desired creativity/determinism
        // Add other model-specific configurations if necessary
      },
    });

    const output = llmResponse.output();

    if (!output || !output.refinedDraft) {
        // Attempt to extract from choices if the direct output isn't populated as expected
        const choices = llmResponse.choices();
        if (choices && choices.length > 0 && choices[0].message.content) {
            return { refinedDraft: choices[0].message.content };
        }
      // Fallback or error if no valid response can be extracted
      console.error("LLM response was not in the expected format or was empty.", llmResponse);
      throw new Error('Failed to generate refined draft. The AI model did not return the expected output.');
    }
    
    // Assuming the model directly returns the refined draft in the 'refinedDraft' field based on OutputSchema
    return {
      refinedDraft: output.refinedDraft,
    };
  }
);

// Export the flow and its input/output types
export default refineDraftFlow;
