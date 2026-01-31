export class VNPayConstants {
    public static terminalId = process.env.VNPAY_TERMINAL_ID || '';
    public static secretKey = process.env.VNPAY_SECRET_KEY || '';
    public static vnpUrl = process.env.VNPAY_VNP_URL || '';
    public static returnUrl = process.env.VNPAY_RETURN_URL || '';
}
