import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OrganizationDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'slug must contain only lowercase letters, numbers, and hyphens',
    })
    slug!: string;
}