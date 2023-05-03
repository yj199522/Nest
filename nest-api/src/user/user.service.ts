import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EditDtoUser } from "./dto";

@Injectable()
export class UserService{
    constructor(private prisma: PrismaService){}
    async editUser(userId: number, dto: EditDtoUser){
        const user = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {...dto}
        })
        delete user.hashPassword;
        return user;
    }
}