type ProductStatus = "Active" | "UnActive" | "Other";
type ProductUnit = "Gram" | "Kilogram" | "Other";

type ProductRep = {
  id: string;
  currentStock: number;
  status: ProductStatus;
  isDelete: boolean;

  category: {
    id: string;
    name: string;
  };

  property?: PropertyRep;
  tags?: string[];
  categoryId: string;
};

type PropertyRep = {
  id: string;
  productId: string;
  urlImage: string;
  name: string;
  description: string;
  weight: string;
  unit: ProductUnit;
  length: number;
  width: number;
  height: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

type CreateProductForm = {
  readonly currentStock: 0;
  status: ProductStatus;
  categoryId: string;
  price: number;
  tags: { id: string }[];

  property: {
    name: string;
    urlImage: string;
    description: string;
    weight: string;
    unit: ProductUnit;
    length: number;
    width: number;
    height: number;
  };
};

type UpdateProductForm = {
  status?: ProductStatus;
  categoryId: string;
  price: number;
  tags: string[];

  property: {
    name: string;
    urlImage: string;
    description: string;
    weight: string;
    unit: ProductUnit;
    length: number;
    width: number;
    height: number;
  };
};

export type {
  ProductRep,
  PropertyRep,
  CreateProductForm,
  UpdateProductForm,
  ProductStatus,
  ProductUnit,
};
