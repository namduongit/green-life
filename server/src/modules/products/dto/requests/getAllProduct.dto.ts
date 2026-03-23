import { Prisma } from 'prisma/generated/browser';
import { FilterKey, PrismaQueryPipeline } from 'src/utils/filter.utils';

type ProductsSearchParamsKey = FilterKey<Prisma.ProductsWhereInput> | 'pageSize';

export class ProductsQueryDto extends PrismaQueryPipeline<
    Prisma.ProductsWhereInput,
    Prisma.ProductsOrderByWithRelationInput
> {
    getAllowedFilterKeys() {
        const allowedProductFilterFields: ProductsSearchParamsKey[] = [
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
        return allowedProductFilterFields;
    }
}
