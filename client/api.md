# Addresses API

Quản lý địa chỉ giao hàng gắn với tài khoản người dùng. Mỗi tài khoản có thể lưu nhiều địa chỉ, trong đó chỉ có một địa chỉ được đánh dấu mặc định tại cùng một thời điểm.

## Thuộc tính địa chỉ

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `fullName` | `string` | Có | Họ và tên người nhận |
| `phone` | `string` | Có | Số điện thoại người nhận |
| `province` | `string` | Có | Tỉnh/Thành phố |
| `ward` | `string` | Có | Phường/Xã |
| `detail` | `string` | Có | Địa chỉ cụ thể |
| `isDefault` | `boolean` | Không (mặc định `false`) | Đánh dấu địa chỉ mặc định |

## Endpoints

> Tất cả các endpoint bên dưới nằm trong nhóm người dùng: `/api/users/{accountId}/address`.

### 1. Lấy danh sách địa chỉ
- **Method**: `GET /api/users/{accountId}/address`
- **Description**: Trả về toàn bộ địa chỉ của tài khoản, địa chỉ mặc định nằm đầu danh sách.

### 2. Lấy chi tiết địa chỉ
- **Method**: `GET /api/users/{accountId}/address/{addressId}`
- **Description**: Trả về một địa chỉ cụ thể thuộc tài khoản. Nếu không tìm thấy sẽ trả về 404.

### 3. Thêm địa chỉ mới
- **Method**: `POST /api/users/{accountId}/address`
- **Body**:
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321",
  "province": "Hà Nội",
  "ward": "Cầu Giấy",
  "detail": "Số 1, Đường Trần Duy Hưng",
  "isDefault": true
}
```
- **Ghi chú**: Nếu `isDefault = true`, tất cả địa chỉ khác của tài khoản sẽ tự động bỏ trạng thái mặc định trước khi tạo bản ghi mới.

### 4. Cập nhật địa chỉ
- **Method**: `PUT /api/users/{accountId}/address/{addressId}`
- **Body**: Chỉ gửi các trường cần cập nhật.
```json
{
  "phone": "0912345678",
  "detail": "Tòa nhà ABC, tầng 5",
  "isDefault": true
}
```
- **Ghi chú**: Có thể cập nhật thông tin hoặc đặt lại địa chỉ mặc định. Việc đặt mặc định sẽ tự động bỏ mặc định ở các địa chỉ khác.

### 5. Xóa địa chỉ
- **Method**: `DELETE /api/users/{accountId}/address/{addressId}`
- **Description**: Xóa địa chỉ thuộc tài khoản. Nếu địa chỉ không tồn tại hoặc không thuộc tài khoản sẽ trả về 404.

## Phản hồi mẫu

```json
{
  "id": "66f5b8df2d9f312345678901",
  "accountId": "66f5a4c02d9f312345678900",
  "fullName": "Nguyễn Văn A",
  "phone": "0987654321",
  "province": "Hà Nội",
  "ward": "Cầu Giấy",
  "detail": "Số 1, Đường Trần Duy Hưng",
  "isDefault": true
}
```

## Lỗi thường gặp

| Mã | Mô tả |
| --- | --- |
| `404` | Địa chỉ không tồn tại hoặc không thuộc tài khoản yêu cầu |
| `400` | Thiếu/bất hợp lệ các trường bắt buộc (theo validation class-validator) |

## Gợi ý triển khai client

1. Gọi `GET /api/users/{accountId}/address` để hiển thị danh sách.
2. Cho phép người dùng chọn địa chỉ mặc định thông qua API PUT và đặt `isDefault = true`.
3. Sau khi xóa địa chỉ mặc định, nên yêu cầu người dùng đặt lại một địa chỉ mặc định khác nếu cần.
