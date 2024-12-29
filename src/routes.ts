import z from "zod";
import { FastifyTypedInstance } from "./types";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { hash, compare } from 'bcryptjs';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function routes(app: FastifyTypedInstance) {
    app.post('/register', {
        schema: {
            tags: ['auth'],
            description: 'Registrar um novo usuário',
            body: z.object({
                name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
            }),
            response: {
                201: z.object({
                    message: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { name, email, password } = request.body;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return reply.status(400).send({ message: 'Usuário já existe' });
        }

        const hashedPassword = await hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return reply.status(201).send({ message: 'Usuário registrado com sucesso' });
    });

    app.post('/login', {
        schema: {
            tags: ['auth'],
            description: 'Login de usuário',
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
            response: {
                200: z.object({
                    token: z.string(),
                }),
                401: z.object({
                    message: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { email, password } = request.body;

        // Busca o usuário no banco de dados
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return reply.status(401).send({ message: 'Usuário não encontrado' });
        }

        // Verifica se a senha corresponde à senha criptografada
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return reply.status(401).send({ message: 'Credenciais inválidas' });
        }

        // Gera o token JWT válido por 1 hora
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return reply.status(200).send({ token });
    });
}