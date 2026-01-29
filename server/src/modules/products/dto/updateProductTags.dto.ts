import { IsString } from 'class-validator';

export class UpdateProductTagsDto {
    @IsString({
        each: true,
    })
    readonly tags: string[];
}
