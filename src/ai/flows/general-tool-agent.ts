import { defineFlow, definePrompt, generate } from '@genkit-ai/flow';
import * as z from 'zod';
import { geminiPro } from '@genkit-ai/googleai'; // Assuming geminiPro is the desired model

// Define input schema
export const GeneralToolAgentInputSchema = z.object({
  toolName: z.string(),
  userPrompt: z.string(),
});
export type GeneralToolAgentInput = z.infer<typeof GeneralToolAgentInputSchema>;

// Define output schema
export const GeneralToolAgentOutputSchema = z.object({
  agentResponse: z.string(),
});
export type GeneralToolAgentOutput = z.infer<typeof GeneralToolAgentOutputSchema>;

// Define the prompt
const generalToolAgentPrompt = definePrompt(
  {
    name: 'generalToolAgentPrompt',
    inputSchema: GeneralToolAgentInputSchema,
    outputSchema: GeneralToolAgentOutputSchema,
  },
  async (input) => {
    return {
      messages: [
        {
          role: 'system',
          content: `You are the AI assistant for the '${input.toolName}' tool. The user said: '${input.userPrompt}'. Respond helpfully and ask clarifying questions if needed, keeping the context of the '${input.toolName}' tool in mind. If the request seems unrelated to the tool, you can gently guide them back or ask for clarification on how it relates to the tool's capabilities. Be concise in your responses unless asked for detailed explanations.`,
        },
      ],
    };
  }
);

// Define the Genkit flow
export const generalToolAgentFlow = defineFlow(
  {
    name: 'generalToolAgentFlow',
    inputSchema: GeneralToolAgentInputSchema,
    outputSchema: GeneralToolAgentOutputSchema,
  },
  async (input) => {
    const llmResponse = await generate({
      prompt: generalToolAgentPrompt,
      model: geminiPro, // Or any other compatible model
      input: input,
      config: {
        temperature: 0.7, // Adjust temperature as needed
      },
    });

    return {
      agentResponse: llmResponse.output()?.agentResponse || 'Sorry, I could not generate a response.',
    };
  }
);

// Ensure to export the flow, input and output types
export default generalToolAgentFlow;
