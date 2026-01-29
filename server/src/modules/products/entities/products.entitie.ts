export const ProductStatus = {
    Active: 'Active',
    UnActive: 'UnActive',
    Other: 'Other',
} as const;

export type ProductStatusType = (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductUnit = {
    Gram: 'Gram',
    Kilogram: 'Kilogram',
    Other: 'Other',
} as const;
export type ProductUnitType = (typeof ProductUnit)[keyof typeof ProductUnit];

export class ProductProperty {
    id: string;
    name: string;
    productId: string;
    urlImage: string;
    description: string;
    weight: string;
    unit: ProductUnitType;
    length: number;
    width: number;
    height: number;
}

export class Product {
    id: string;
    currentStock: number;
    status: ProductStatusType;
    category: {
        id: string;
        name: string;
    };
    tags: {
        id: string;
        name: string;
    }[];
    property: ProductProperty | null;
}
