// services/api.ts

import axios from 'axios';
import { STABILITY_API_KEY } from '@env';

const API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      API_URL,
      {
        width: 512,
        height: 512,
        steps: 30,
        text_prompts: [
          {
            text: prompt.trim(),
            weight: 1,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const base64Image = response.data?.artifacts?.[0]?.base64;
    if (!base64Image) {
      throw new Error('Image non trouvée dans la réponse');
    }

    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
    } else {
      console.error(error);
    }
    throw new Error("Impossible de générer l'image");
  }
};
