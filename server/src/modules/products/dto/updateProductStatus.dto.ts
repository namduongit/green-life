import { IsEnum } from 'class-validator';
import { CommonStatus } from 'prisma/generated/enums';

export class UpdateProductStatusDto {
    @IsEnum(CommonStatus, {
        message: 'Trạng thái không hợp lệ',
    })
    readonly status: CommonStatus;
}
