import { ForbiddenException, Injectable } from '@nestjs/common';
import { BookMarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {

    constructor(private prisma: PrismaService) {}
    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({
            where: {
                userId
            }
        })
    }

    getBookmarkbyId(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                userId
            }
        })
    }

    async createBookmark(userId: number, dto: BookMarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto
            }
        });
       return bookmark;
    }

    async editBookmarkbyId(userId: number, dto: EditBookmarkDto, bookmarkId:number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('You are not allowed to edit this bookmark');
        }
        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId
            },
            data: {
                ...dto
            }
        })
    }

    async deleteBookmarkbyId(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException('You are not allowed to edit this bookmark');
        }
        await this.prisma.bookmark.delete({
            where: {
                id: bookmarkId
            }
        });
    }
}
