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
<<<<<<< HEAD
  readonly currentStock: 0;
=======
  currentStock: number;
>>>>>>> 8822616 (dã hoàn thành apply api cho product,category và image, cũng cập nhật backend của phần account để có thể mở lại tài khoản nhưng các mục khác thì không thể mở lại được)
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
<<<<<<< HEAD
=======
  currentStock?: number;
>>>>>>> 8822616 (dã hoàn thành apply api cho product,category và image, cũng cập nhật backend của phần account để có thể mở lại tài khoản nhưng các mục khác thì không thể mở lại được)
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
<<<<<<< HEAD
};
=======
};
>>>>>>> 8822616 (dã hoàn thành apply api cho product,category và image, cũng cập nhật backend của phần account để có thể mở lại tài khoản nhưng các mục khác thì không thể mở lại được)
