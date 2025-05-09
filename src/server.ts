import { fastify } from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';

import { routes } from './routes';
import { uvBuddyRoutes } from './uvbuddy';

import { pino } from 'pino';
import pretty from 'pino-pretty';

export const logger = pino(pretty({
    messageFormat: '{msg}',
    ignore: 'level,pid',
    colorize: true
}));

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, { origin: '*' });

app.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Fastify API',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Digite "Bearer <seu-token>" no campo de autorização.',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    transformStaticCSP: (header) => header,
});


app.register(routes)

app.register(uvBuddyRoutes)

app.get('/', () => {
    return 'API is running!';
})

app.listen({ port: 3333 }).then(() => {
    console.log('Server is running on port 3333');
}); 