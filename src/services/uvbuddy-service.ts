import { logger } from '../server';
import { ThingSpeakResponseSchema } from '../routes/uvbuddy'

export function formatUvBuddyData(payload: typeof ThingSpeakResponseSchema['_type']) {
    logger.info(`Starting formatUvBuddyData service`);
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

export function formatUvBuddyDataHourly(payload: typeof ThingSpeakResponseSchema['_type']) {
    logger.info(`formatUvBuddyDataHourly service`);
    try {
        const formattedData = payload.feeds
                .filter(feed => feed.field1 && !isNaN(Number(feed.field1)))
                .map(feed => ({
                    value: Number(feed.field1),
                    timestamp: feed.created_at
                }));

        const data = {
            formattedData,
            channelInfo: {
                name: payload.channel.name,
                description: payload.channel.description || 'No description available',
            }
        }
        
        logger.info(`formatUvBuddyDataHourly formatted payload: ${JSON.stringify(data)}`);

        return data
    } catch (error) {
        logger.error(`Error in formatUvBuddyDataHourly : error : ${error}`);
        throw error;
    }
}