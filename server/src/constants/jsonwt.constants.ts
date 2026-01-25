export class JsonWtConstants {
    public static secret = process.env.SECRECT;
    public static expiresIn = Number(process.env.EXPIRES_IN) || 120 ;
}