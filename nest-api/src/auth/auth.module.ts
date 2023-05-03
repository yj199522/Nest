import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.sevice";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    imports:[JwtModule.register({})]
})
export class AuthModule{}