import { CommonStatus, Unit } from 'prisma/generated/enums';
import { PaginationDto } from 'src/modules/common.dto';

export type ProductCategoryResponseDto = {
	id: string;
	name: string;
};

export type ProductTagResponseDto = {
	id: string;
	name: string;
};

export type ProductPropertyResponseDto = {
	urlImage: string;
	name: string;
	description: string;
	weight: string;
	unit: Unit;
	length: number;
	width: number;
	height: number;
	price: number;
};

export type ProductResponseDto = {
	id: string;
	currentStock: number;
	status: CommonStatus;
	category: ProductCategoryResponseDto;
	tags: ProductTagResponseDto[];
	property?: ProductPropertyResponseDto;
	isDelete: boolean;
};

export type ProductListResponseDto = {
	data: ProductResponseDto[];
	pagination?: PaginationDto;
};
