import { createParser } from 'prisma-searchparams-mapper';
import { Prisma } from 'prisma/generated/browser';
import { FilterKey } from 'src/utils/filter.utils';

export const productsFilterParser = createParser<Prisma.ProductsWhereInput, Prisma.ProductsOrderByWithRelationInput>();

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type ProductsSearchParamsKey = FilterKey<Prisma.ProductsWhereInput> | 'pageSize';
export const allowedProductFilterFields: ProductsSearchParamsKey[] = [
    'id',
    'property.id',
    'property.id_in',
    'property.name_contains',
    'category.id',
    'page',
    'order',
    'pageSize',
    'tagItems.some.tag.id',
    'property.description_contains',
];

export function validateProductFilterFields(fields: Record<string, unknown>): boolean {
    return Object.keys(fields).every((key) => (allowedProductFilterFields as unknown as string[]).includes(key));
}
