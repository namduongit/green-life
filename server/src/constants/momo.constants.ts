export class MomoConstants {
    public static Enpoint = process.env.MOMO_ENDPOINT || '';
    public static AccessKey = process.env.MOMO_ACCESS_KEY || '';
    public static PartnerCode = process.env.MOMO_PARTNET_CODE || '';
    public static SecretKey = process.env.MOMO_SECRET_KEY || '';
    public static RedirectUrl = process.env.MOMO_REDIRECT_URL || '';
    public static IpnUrl = process.env.MOMO_IPN_URL || '';
}
