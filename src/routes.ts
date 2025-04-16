import z from "zod";
import { FastifyTypedInstance } from "./types";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { hash, compare } from 'bcryptjs';
import { authMiddleware } from "../middleware/auth";
import sgMail from "@sendgrid/mail";

const prisma = new PrismaClient();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "your_sendgrid_api_key");
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || "your_reset_secret";
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
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return reply.status(200).send({ token });
    });

    app.get('/dados', {
        schema: {
            tags: ['protected'],
            description: 'Rota protegida que requer autenticação',
            response: {
                200: z.object({
                    data: z.string(),
                }),
                401: z.object({ message: z.string() }),
            },
            security: [{ bearerAuth: [] }], // Aplica o esquema de segurança na rota
        },
        preHandler: authMiddleware,
    }, async (request, reply) => {
        return reply.status(200).send({ data: `Olá, usuário com ID [${request.user?.id}] e email [${request.user?.email}]!` });
    });


    app.post(
    "/forgot-password",
    {
        schema: {
            tags: ["auth"],
            description: "Solicitar recuperação de senha",
            body: z.object({
                email: z.string().email(),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
            },
        },
    },
    async (request, reply) => {
        const { email } = request.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.status(404).send({ message: "Usuário não encontrado" });
        }

        // Gera o token de recuperação válido por 1 hora
        const resetToken = jwt.sign({ id: user.id }, JWT_RESET_SECRET, { expiresIn: "1h" });

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const msg = {
            to: email,
            from: process.env.SENDGRID_EMAIL_FROM || "noreply@yourdomain.com",
            subject: "Recuperação de senha",
            text: `Clique no link para redefinir sua senha: ${resetLink}`,
        };

        try {
            await sgMail.send(msg);
            return reply.status(200).send({ message: "E-mail de recuperação enviado" });
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            return reply.status(500).send({ message: "Erro ao enviar e-mail" });
        }
    }
);

// Rota para redefinir senha
app.post(
    "/reset-password",
    {
        schema: {
            tags: ["auth"],
            description: "Redefinir senha",
            body: z.object({
                token: z.string(),
                newPassword: z.string().min(6),
            }),
            response: {
                200: z.object({
                    message: z.string(),
                }),
                400: z.object({
                    message: z.string(),
                }),
            },
        },
    },
    async (request, reply) => {
        const { token, newPassword } = request.body;

        try {
            const decoded: any = jwt.verify(token, JWT_RESET_SECRET);
            const user = await prisma.user.findUnique({ where: { id: decoded.id } });

            if (!user) {
                return reply.status(400).send({ message: "Token inválido ou expirado" });
            }

            const hashedPassword = await hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });

            return reply.status(200).send({ message: "Senha redefinida com sucesso" });
        } catch (error) {
            return reply.status(400).send({ message: "Token inválido ou expirado" });
        }
    }
);
}