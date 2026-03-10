export class SepayConstants {
    public static Endpoint = process.env.SEPAY_ENDPOINT || '';
    public static MerchantId = process.env.SEPAY_MERCHANT_ID || '';
    public static SecretKey = process.env.SEPAY_SECRET_KEY || '';
    public static IpnUrl = process.env.SEPAY_IPN_URL || '';
    public static ApiKey = process.env.SEPAY_API_KEY || '';
}