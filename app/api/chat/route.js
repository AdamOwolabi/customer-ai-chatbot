import { NextResponse } from "next/server";

const systemPrompt = `you are an ai powered customer support chatbot for headstarter AI...`; // truncated for brevity

export async function POST(req) {
    try {
        const data = await req.json();
        console.log('Received data:', data);

        const OPENROUTER_API_KEY = process.env.OPENROUTER_API;
        if (!OPENROUTER_API_KEY) {
            console.error('API key is missing');
            return new NextResponse('Internal Server Error', { status: 500 });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "sao10k/l3-lunaris-8b",
                "messages": [
                    { role: "system", content: systemPrompt },
                    ...data
                ],
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API request failed with status:', response.status);
            console.error('API error response:', errorText);
            return new NextResponse('Error', { status: 500 });
        }

        const responseData = await response.json();
        const completionText = responseData.choices[0]?.message?.content || 'No content';
        
        return new NextResponse(completionText);
    } catch (error) {
        console.error('Server-side error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
