import { logger } from '../server';
import { ThingSpeakResponseSchema } from '../uvbuddy'

export function formatUvBuddyData(payload: typeof ThingSpeakResponseSchema['_type']) {
    logger.info(`starting formatUvBuddyData service`);
    try {
        const validValues = payload.feeds
                .filter(feed => feed.field1 && parseFloat(feed.field1) > 0)
                .map(feed => ({
                    value: parseFloat(feed.field1!),
                    timestamp: feed.created_at,
                }));

            const averageValue = validValues.length > 0
                ? validValues.reduce((sum, item) => sum + item.value, 0) / validValues.length
                : 0;

            const lastTimestamp = validValues.length > 0
                ? validValues[validValues.length - 1].timestamp
                : '';

            const formattedData = {
                sensorData: {
                    averageValue: Number(averageValue.toFixed(2)),
                    lastTimestamp,
                },
                channelInfo: {
                    name: payload.channel.name,
                    description: payload.channel.description || 'No description available',
                }
            };
            logger.info(`formatUvBuddyData formatted payload: ${JSON.stringify(formattedData)}`);

            return formattedData
    } catch (error) {
        logger.error(`Error in formatUvBuddyData : error : ${error}`);
        throw error;
    }
}