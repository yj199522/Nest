import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService, private jwtToken: JwtService, private config: ConfigService) { }

    async signup(dto: AuthDto) {
        const hashedPassword = await argon.hash(dto.password)
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hashPassword: hashedPassword
                }
            })
            return this.signToken(user.id, user.email)
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials already in use')
            }
            throw error
        }
    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) {
            throw new ForbiddenException('Invalid credentials')
        }
        const valid = await argon.verify(user.hashPassword, dto.password)
        if (!valid) {
            throw new ForbiddenException('Invalid credentials')
        }
        return this.signToken(user.id, user.email)
    }

    async signToken(id: number, email: string): Promise<{ access_token: string }> {
        const payload = { sub: id, email }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwtToken.signAsync(payload, { secret, expiresIn: '15m' })
        return { access_token: token }
    }

}