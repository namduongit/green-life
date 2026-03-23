# Module Structure & Response Types

## 1. Chuẩn hoá cấu trúc module
Mỗi module trong `src/modules/<module>` được tổ chức lại theo cùng một layout:

```
src/modules/<module>/
├── controllers/          # Controller duy nhất hoặc nhiều controller của module
├── services/             # Business services
├── dto/
│   ├── requests/         # DTO cho payload/query đầu vào
│   └── responses/        # DTO cho dữ liệu trả về
├── types/                # Type helper (RestResponse wrapper, enum, ...)
└── <module>.module.ts    # Module definition
```

> Bất kỳ module con (vd. `addresses`, `carts`) đều tuân thủ cấu trúc trên – nếu một thư mục chưa có hiện vật (vd. `controllers`) thì sẽ được bổ sung khi phát sinh nhu cầu.

## 2. RestResponse chuẩn
Tất cả response đều được quy về `RestResponse<TData, TMeta = undefined>` được định nghĩa tại `src/utils/response.utils.ts`:

```
type RestResponse<TData, TMeta = undefined> = {
    statusCode: number;
    message: string;
    data: TData;
    meta?: TMeta;
    error?: string | null;
};
```

Interceptor `TransformInterceptor` vẫn chịu trách nhiệm wrap dữ liệu thực tế vào cấu trúc trên, giúp controller/service chỉ cần tập trung trả `data`.

## 3. Danh mục response type theo module
| Module | Type export | Payload | Ý nghĩa |
|--------|-------------|---------|---------|
| Accounts | `AccountListResponse`, `AccountDetailResponse`, `AccountMutationResponse` (src/modules/accounts/types/accounts.responses.ts) | `AccountRep[]` hoặc `AccountRep` | Danh sách tài khoản, chi tiết một tài khoản, các thao tác create/update/delete |
| Addresses | `AddressListResponse`, `AddressDetailResponse`, `AddressMutationResponse` (src/modules/addresses/types/addresses.responses.ts) | `AddressResponseDto[]` hoặc `AddressResponseDto` | Danh sách địa chỉ của tài khoản, chi tiết một địa chỉ, kết quả thao tác thêm/sửa/xoá |
| Auth | `AuthRegisterResponse`, `AuthLoginResponse` (src/modules/auth/types/auth.responses.ts) | `RegisterRep` / `LoginRep` | Kết quả đăng ký và đăng nhập |
| Carts | `CartListResponse`, `CartMutationResponse` (src/modules/carts/types/carts.responses.ts) | `CartRep[]` hoặc `CartRep` | Trạng thái giỏ hàng hiện tại và kết quả các thao tác thêm/xoá/cập nhật |
| Categories | `CategoryListResponse`, `CategoryPaginationResponse`, `CategoryDetailResponse` (src/modules/categories/types/categories.responses.ts) | `CategoryResponseDto[]` (+ `PaginationDto` với meta) hoặc `CategoryResponseDto` | Danh sách, trang phân trang và chi tiết danh mục |
| Orders | `OrderListResponse`, `OrderDetailResponse`, `OrderMutationResponse` (src/modules/orders/types/orders.responses.ts) | `OrderResponseDto[]` hoặc `OrderDetailResponseDto` | Danh sách đơn hàng, chi tiết (bao gồm items, checkout history) và kết quả tạo đơn |
| Payments | `PaymentCreateResponse` (src/modules/payments/types/payments.responses.ts) | `PaymentRep` | Thông tin trả về khi tạo giao dịch Momo (requestId, paymentUrl, …) |
| Products | `ProductListResponse`, `ProductDetailResponse`, `ProductMutationResponse` (src/modules/products/types/products.responses.ts) | `ProductListResponseDto` hoặc `ProductResponseDto` | Kết quả truy vấn danh sách (kèm tags/category/property), chi tiết và thao tác CRUD |
| Tags | `TagListResponse`, `TagPaginationResponse`, `TagDetailResponse` (src/modules/tags/types/tags.responses.ts) | `TagResponseDto[]` (+ `PaginationDto` với meta) hoặc `TagResponseDto` | Danh sách, phân trang và chi tiết thẻ |

> Các DTO cụ thể nằm trong `dto/responses`. Khi bổ sung endpoint mới, hãy mở rộng DTO trước, sau đó thêm alias tương ứng trong `types/*.responses.ts` và cập nhật bảng này nếu cần.
