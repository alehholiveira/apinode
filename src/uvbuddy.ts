import z from "zod";
import { FastifyTypedInstance } from "./types";
import axios from "axios";

const ThingSpeakFeedSchema = z.object({
    field1: z.string().nullable(),
    created_at: z.string(),
    entry_id: z.number()
});

const ThingSpeakResponseSchema = z.object({
    channel: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().optional(),
        created_at: z.string(),
        updated_at: z.string()
    }),
    feeds: z.array(ThingSpeakFeedSchema)
});

export async function uvBuddyRoutes(app: FastifyTypedInstance) {
    app.get('/sensor-data', {
        schema: {
            tags: ['ThingSpeak'],
            description: 'Obter dados do sensor do ThingSpeak',
            querystring: z.object({
                results: z.string().optional().default('2')
            }),
            response: {
                200: z.object({
                    sensorData: z.array(z.object({
                        value: z.number().nullable(),
                        timestamp: z.string(),
                        entryId: z.number()
                    })),
                    channelInfo: z.object({
                        name: z.string(),
                        description: z.string().optional() // Tornando o campo description opcional aqui também
                    })
                }),
                500: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        try {
            const { results } = request.query;
            
            const response = await axios.get(
                `https://api.thingspeak.com/channels/${process.env.THINGSPEAK_CHANNEL_ID}/feeds.json`,
                {
                    params: {
                        api_key: process.env.THINGSPEAK_READ_API_KEY,
                        results
                    }
                }
            );

            const parsedData = ThingSpeakResponseSchema.parse(response.data);

            // Transformando os dados para o formato desejado
            const formattedData = {
                sensorData: parsedData.feeds.map(feed => ({
                    value: feed.field1 ? parseFloat(feed.field1) : null,
                    timestamp: feed.created_at,
                    entryId: feed.entry_id
                })),
                channelInfo: {
                    name: parsedData.channel.name,
                    description: parsedData.channel.description || ''
                }
            };

            return reply.status(200).send(formattedData);
        } catch (error) {
            console.error('Erro ao buscar dados do ThingSpeak:', error);
            return reply.status(500).send({ message: error instanceof Error ? error.message : 'An unexpected error occurred' });
        }
    });
}