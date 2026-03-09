import { Prisma } from 'prisma/generated/browser';
import { FilterKey, PrismaQueryPipeline } from 'src/utils/filter.utils';

export class QueryAccountDto extends PrismaQueryPipeline<
    Prisma.AccountsWhereInput,
    Prisma.AccountsOrderByWithRelationInput
> {
    getAllowedFilterKeys(): ('pageSize' | FilterKey<Prisma.AccountsWhereInput, 3>)[] {
        return ['page', 'pageSize'];
    }
}
