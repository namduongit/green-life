export class SepayConstants {
    public static Enpoint = process.env.SEPAY_ENDPOINT || '';
    public static SecretKey = process.env.SEPAY_SECRET_KEY || '';
    public static ReturnUrl = process.env.SEPAY_RETURN_URL || '';
    public static IpnUrl = process.env.SEPAY_IPN_URL || '';
}