import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const { authorization } = request.headers;
    if (!authorization) {
        return reply.status(401).send({ message: 'Token não fornecido' });
    }

    const token = authorization.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
        request.locals = request.locals || {};
        request.locals.user = decoded; // Adiciona o usuário ao objeto `request`
    } catch {
        return reply.status(401).send({ message: 'Token inválido ou expirado' });
    }
}
