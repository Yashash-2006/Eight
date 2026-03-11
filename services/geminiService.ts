
import { GoogleGenAI, FunctionDeclaration, GenerateContentResponse, Modality, Type } from "@google/genai";
import { ANALYSIS_SYSTEM_INSTRUCTION, MEDITATION_SYSTEM_INSTRUCTION, SAFETY_SYSTEM_INSTRUCTION, SLEEP_STORY_SYSTEM_INSTRUCTION } from "../constants";
import type { Message, Mood, CalendarEvent, StressHotspot } from "../types";
import { getCalendarEvents, getHRVStatus, notifyDoctor, addCalendarEvent } from "./mockApiService";

const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Gemini API key is missing. Please set the API_KEY environment variable.");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const tools: FunctionDeclaration[] = [
    {
        name: 'getCalendarEvents',
        description: 'Get a list of upcoming events from the user\'s calendar to identify potential stressors.',
        parameters: { type: Type.OBJECT, properties: {}, required: [] }
    },
    {
        name: 'addCalendarEvent',
        description: 'Schedule a new event in the user\'s calendar.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: 'Title of the event' },
                startTime: { type: Type.STRING, description: 'Start time in ISO 8601 format (e.g. 2024-09-25T14:00:00)' },
                endTime: { type: Type.STRING, description: 'End time in ISO 8601 format' },
                description: { type: Type.STRING, description: 'Optional description of the event' }
            },
            required: ['title', 'startTime', 'endTime']
        }
    },
    {
        name: 'getHRVStatus',
        description: 'Get the user\'s current Heart Rate Variability (HRV) status from a connected wearable device.',
        parameters: { type: Type.OBJECT, properties: {}, required: [] }
    },
    {
        name: 'notifyDoctor',
        description: 'Notify a doctor or a designated emergency contact in a crisis situation.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                summary: {
                    type: Type.STRING,
                    description: 'A brief summary of the crisis.'
                }
            },
            required: ['summary']
        }
    }
];

const availableTools: { [key: string]: Function } = {
    getCalendarEvents,
    addCalendarEvent,
    getHRVStatus,
    notifyDoctor
};

export async function analyzeTextAndImage(prompt: string, imageBase64?: string, history?: Message[]) {
    const ai = getAiClient();
    const contents: any[] = [];

    if (history) {
        // Exclude the last placeholder message if it exists
        const filteredHistory = history.filter(msg => msg.text.trim() !== '' || msg.sender !== 'ai');
        filteredHistory.forEach(msg => {
            contents.push({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] });
        });
    }

    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
        parts.unshift({
            inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
            },
        });
    }
    contents.push({ role: 'user', parts });


    return await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction: `${SAFETY_SYSTEM_INSTRUCTION} \n ${ANALYSIS_SYSTEM_INSTRUCTION}`,
            tools: [{ functionDeclarations: tools }],
        }
    });
}

export async function runTool(toolInput: string, history: Message[]) {
    const ai = getAiClient();
    const toolCall = JSON.parse(toolInput);
    const toolResult = await availableTools[toolCall.name](toolCall.args);

    const contents: any[] = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));

    contents.push({
        role: 'model',
        parts: [{ functionCall: toolCall }]
    });

    contents.push({
        role: 'function',
        parts: [{ functionResponse: { name: toolCall.name, response: { content: toolResult } } }]
    });

    return await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction: `${SAFETY_SYSTEM_INSTRUCTION} \n ${ANALYSIS_SYSTEM_INSTRUCTION}`,
        }
    });
}

export async function* performProactiveCheck(isCalendarConnected: boolean): AsyncGenerator<GenerateContentResponse> {
    if (!isCalendarConnected) {
        yield { text: "Hello! I'm here to support you. For more personalized check-ins based on your schedule, you can connect your calendar. How are you feeling today?" } as GenerateContentResponse;
        return;
    }

    const model = 'gemini-2.5-flash';
    const initialPrompt = "Based on my calendar, start a conversation with me. Your first message should be a casual, friendly check-in asking how my day or mood is. Keep it plain text.";

    try {
        const ai = getAiClient();
        const stream1 = await ai.models.generateContentStream({
            model,
            contents: [{ role: 'user', parts: [{ text: initialPrompt }] }],
            config: {
                systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
                tools: [{ functionDeclarations: [tools.find(t => t.name === 'getCalendarEvents')!] }],
            }
        });

        let functionCall: any = null;
        let responseText = '';

        for await (const chunk of stream1) {
            if (chunk.functionCalls && chunk.functionCalls.length > 0) {
                functionCall = chunk.functionCalls[0];
                break;
            }
            if(chunk.text) {
                responseText += chunk.text;
            }
        }
        
        if (functionCall && functionCall.name === 'getCalendarEvents') {
            const calendarEvents = await getCalendarEvents();
            
            const stream2 = await ai.models.generateContentStream({
                model,
                contents: [
                    { role: 'user', parts: [{ text: initialPrompt }] },
                    { role: 'model', parts: [{ functionCall }] },
                    { role: 'function', parts: [{ functionResponse: { name: 'getCalendarEvents', response: { content: calendarEvents } } }] }
                ],
                config: {
                    systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
                }
            });

            for await (const chunk of stream2) {
                yield chunk;
            }
        } else if (responseText) {
            yield { text: responseText } as GenerateContentResponse;
        } else {
             yield { text: "Hello! Let's get started with your day. How are you feeling?" } as GenerateContentResponse;
        }
    } catch (error) {
        if (error instanceof Error && error.message === 'API_KEY_MISSING') {
            throw error;
        }
        console.error("Error in proactive check stream:", error);
        yield { text: "Hello! I had some trouble checking your schedule, but I'm here to help. How are you feeling today?" } as GenerateContentResponse;
    }
}


export async function generateSpeech(text: string, voiceName: string): Promise<string | null> {
    try {
        if (!text) return null;

        // Strict cleaning: Allow ONLY alphanumerics, standard punctuation, and spaces.
        // This removes ALL emojis, unicode symbols, markdown, and obscure characters.
        let cleanText = text.replace(/[^\w\s.,?!'-]/gi, '');

        // Normalize whitespace
        cleanText = cleanText.replace(/\s+/g, ' ').trim();

        // Hard truncation for safety (400 chars max for TTS stability)
        if (cleanText.length > 400) {
            cleanText = cleanText.substring(0, 400);
            const lastPunctuation = Math.max(cleanText.lastIndexOf('.'), cleanText.lastIndexOf('?'), cleanText.lastIndexOf('!'));
            if (lastPunctuation > 200) {
                cleanText = cleanText.substring(0, lastPunctuation + 1);
            }
        }

        if (cleanText.length === 0) return null;
        
        // Ensure there is at least one letter or number
        if (!/[a-zA-Z0-9]/.test(cleanText)) return null;

        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        if (error instanceof Error && error.message === 'API_KEY_MISSING') {
            throw error;
        }
        console.error("Error generating speech:", error);
        return null;
    }
}

export async function summarizeConversation(messages: Message[], mood: Mood): Promise<string> {
    const ai = getAiClient();
    const transcript = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize this chat into a diary entry. Keep it chill and reflective. Mention the key points and how they were feeling. They said their mood was '${mood}'.\n\n---\n\n${transcript}`,
        config: {
             systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
        }
    });
    
    return response.text;
}

export async function generateMeditationScript(theme: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a meditation script for the theme: ${theme}`,
        config: {
             systemInstruction: `${SAFETY_SYSTEM_INSTRUCTION} \n ${MEDITATION_SYSTEM_INSTRUCTION}`,
        }
    });
    
    return response.text;
}

export async function generateSleepStoryScript(theme: string): Promise<string> {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a sleep story for the theme: ${theme}`,
        config: {
             systemInstruction: `${SAFETY_SYSTEM_INSTRUCTION} \n ${SLEEP_STORY_SYSTEM_INSTRUCTION}`,
        }
    });
    
    return response.text;
}

export async function analyzeStressHotspots(events: CalendarEvent[]): Promise<StressHotspot[]> {
  const ai = getAiClient();
  const prompt = `Analyze the following list of calendar events for today and identify potential "stress hotspots." A stress hotspot could be back-to-back meetings with no breaks, or events with keywords like "review," "deadline," "pitch," or "performance." Return a JSON array of objects, where each object has "startTime", "endTime", and a brief "reason". startTime and endTime should be in ISO 8601 format. If there are no hotspots, return an empty array.

Events:
${JSON.stringify(events, null, 2)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    const jsonString = response.text.trim();
    // It's possible for the model to return a markdown block
    const sanitizedJson = jsonString.replace(/^```json\s*|```\s*$/g, '');
    const hotspots = JSON.parse(sanitizedJson) as StressHotspot[];
    return hotspots;
  } catch (error) {
    console.error("Error parsing stress hotspot analysis:", error);
    return []; 
  }
}
