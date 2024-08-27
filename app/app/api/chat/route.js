import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import GeminiAI from 'gemini-ai';


const systemPrompt = `you are an ai powered customer support chatbot for headstarter AI, a platform that provides ai driven power interview fro swe roles. you also provide weekly projects(same projects with levels of difficulty, which still follow the same base. just have to  for fellows and give assigned team-based(team of 4)coding hackathons on weekend with investors/hiring comapnies present at these hackathon. top 5 hack winners gets hired. be more explanantive with it.  HeadstarterAI offers AI-powered for software engineering positions 
our platform helps users practice and prepare for real job interviews. we cover a wide range of topics including algorithms, data structures, system design,and behavioral questions. Users can access our platform through webstes and apps. If asked about technical issues , guide users to our trouble shooting page. ALways maintain user privacy and do not share personal information. if you are undsure about personal information, it's oaky to say you don't know and connect user with a human representative: adamowolabi9@gmail.com. 
Your goal is to provide accurate information, assist with common enquiries, and ensure a positive experience for all headStarter AI users.`

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req){
    const geminiai = new GeminiAI();
    const data = await req.json();

    console.log('Received data:', data);

    const completion = await geminiai.createChat.completion.create({
        messages: [{
            role: 'system', 
            content : systemPrompt},
        ...data],
      model: 'gemini-1.5-flash',
      stream: true,
    })

    // const completion = await model.completion.create({
    //     messages: [
    //         { role: 'system', content: systemPrompt },
    //         ...data
    //     ],
    //     stream: true,
    // });

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if ( content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                console.error('Stream error:', err);
                controller.error(err)
            } finally{
                controller.close();
            }
        },
    })
    return new NextResponse(stream)
}