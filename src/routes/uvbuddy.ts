import z from "zod";
import { FastifyTypedInstance } from "../types";
import axios from "axios";
import { logger } from "../server";
import { formatUvBuddyData } from "../services/uvbuddy-service";

export const ThingSpeakFeedSchema = z.object({
    field1: z.string().nullable(),
    created_at: z.string(),
    entry_id: z.number()
});

export const ThingSpeakResponseSchema = z.object({
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
            tags: ['uvBuddy'],
            description: 'Obter dados do sensor do ThingSpeak',
            querystring: z.object({
                results: z.string().optional().default('30') 
                // Definindo o valor padrão como '30', pois representa os ultimos 10 minutos de resultados(definido no código do nosso protótipo)
            }),
            response: {
                200: z.object({
                    sensorData: z.object({
                        averageValue: z.number(),
                        lastTimestamp: z.string(),
                    }),
                    channelInfo: z.object({
                        name: z.string(),
                        description: z.string().optional()
                    })
                }),
                500: z.object({
                    message: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { results } = request.query;
        logger.info(`Get request to /sensor-data endpoint : request.query : ${results}`);
        
        try {
            const response = await axios.get(
                `https://api.thingspeak.com/channels/${process.env.THINGSPEAK_CHANNEL_ID}/feeds.json`,
                {
                    params: {
                        api_key: process.env.THINGSPEAK_READ_API_KEY,
                        results
                    }
                }
            ); 

            logger.info(`Succefuly get to thingspeak API`);

            const parsedData = ThingSpeakResponseSchema.parse(response.data);
            const formattedData = await formatUvBuddyData(parsedData);

            return reply.status(200).send(formattedData);
        } catch (error) {
            logger.error(`Error to get request to /sensor-data endpoint : error : ${error}`);
            return reply.status(500).send({ message: error instanceof Error ? error.message : 'An unexpected error occurred' });
        }
    });
}