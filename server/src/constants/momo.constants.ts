export class MomoConstants {
    public static momoEnpoint = process.env.MOMO_ENDPOINT || "";
    public static momoAccessKey = process.env.MOMO_ACCESS_KEY || "";
    public static momoPartnerCode = process.env.MOMO_PARTNET_CODE || "";
    public static momoSecretKey = process.env.MOMO_SECRET_KEY || "";
    public static momoReturnUrl = process.env.MOMO_RETURN_URL || "";
    public static momoIpnUrl = process.env.MOMO_IPN_URL || "";
}