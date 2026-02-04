import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { createParser, PrismaWhere, SearchParamsQuery } from 'prisma-searchparams-mapper';

type WhereOperator = 'in' | 'notIn' | 'not' | 'gte' | 'lte' | 'gt' | 'lt' | 'contains' | 'startsWith' | 'endsWith';
type NonKey = 'AND' | 'OR' | 'NOT';

// Helper: Tính độ sâu tối đa của type T với Visited protection
type MaxDepthOfType<T, Visited = T, CurrentDepth extends any[] = []> = CurrentDepth['length'] extends 10 // Giới hạn tối đa 10
    ? 10
    : {
            [K in Exclude<keyof T, NonKey>]: [T[K]] extends [Visited]
                ? CurrentDepth['length']
                : NonNullable<T[K]> extends Record<string, any>
                  ? NonNullable<T[K]> extends any[] | Date | RegExp
                      ? CurrentDepth['length']
                      : MaxDepthOfType<NonNullable<T[K]>, Visited | T[K], [...CurrentDepth, any]>
                  : CurrentDepth['length'];
        }[Exclude<keyof T, NonKey>] extends infer Depths
      ? Depths extends number
          ? Depths
          : 0
      : 0;

// Thay vì BuildTuple, dùng union trực tiếp
type DepthUnion<N extends number> = N extends 10
    ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
    : N extends 9
      ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
      : N extends 8
        ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
        : N extends 7
          ? 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
          : N extends 6
            ? 0 | 1 | 2 | 3 | 4 | 5 | 6
            : N extends 5
              ? 0 | 1 | 2 | 3 | 4 | 5
              : N extends 4
                ? 0 | 1 | 2 | 3 | 4
                : N extends 3
                  ? 0 | 1 | 2 | 3
                  : N extends 2
                    ? 0 | 1 | 2
                    : N extends 1
                      ? 0 | 1
                      : 0;

// Helper: Get keys at specific depth
type KeysAtDepth<
    T,
    Depth extends number,
    Visited = T,
    CurrentDepth extends any[] = [],
> = CurrentDepth['length'] extends Depth
    ? Exclude<keyof T, NonKey> & string
    : {
          [K in Exclude<keyof T, NonKey> & string]: [T[K]] extends [Visited]
              ? never
              : NonNullable<T[K]> extends Record<string, any>
                ? NonNullable<T[K]> extends any[] | Date | RegExp
                    ? never
                    : KeysAtDepth<
                            NonNullable<T[K]>,
                            Depth,
                            Visited | T[K],
                            [...CurrentDepth, any]
                        > extends infer SubKeys
                      ? SubKeys extends string
                          ? `${K}.${SubKeys}`
                          : never
                      : never
                : never;
      }[Exclude<keyof T, NonKey> & string];

// Generate paths với DepthUnion thay vì BuildTuple
type DotPath<T, MaxDepth extends number = MaxDepthOfType<T>> = {
    [D in DepthUnion<MaxDepth>]: KeysAtDepth<T, D, T>;
}[DepthUnion<MaxDepth>];

type WhereParamKey<T, MaxDepth extends number = 3> = DotPath<T, MaxDepth> | `${DotPath<T, MaxDepth>}_${WhereOperator}`;

export type FilterKey<T, MaxDepth extends number = 3> = WhereParamKey<T, MaxDepth> | 'order' | 'page';

export abstract class PrismaQueryPipeline<
    TWhereInput = PrismaWhere,
    TOrderByInput = Record<string, 'asc' | 'desc'>,
> implements PipeTransform<SearchParamsQuery<TWhereInput, TOrderByInput>> {
    abstract getAllowedFilterKeys(): (FilterKey<TWhereInput> | 'pageSize')[];
    private queyrParser = createParser<TWhereInput, TOrderByInput>();

    transform(value: SearchParamsQuery<TWhereInput, TOrderByInput>, metadata: ArgumentMetadata) {
        const allowedKeys = this.getAllowedFilterKeys() as unknown as string[];
        const invalidKeys = Object.keys(value.where || {}).filter((key) => !allowedKeys.includes(key));

        if (invalidKeys.length > 0) {
            throw new BadRequestException(`Invalid filter fields: ${invalidKeys.join(', ')}`);
        }

        const pageSize = value['pageSize'] ? Number(value['pageSize']) : undefined;
        const query = this.queyrParser.parse(value as any, { pageSize });

        return query;
    }
}
