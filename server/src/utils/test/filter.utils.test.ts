// import { DotPath, FilterKey, WhereParamKey } from "../filter.utils";

// // Simulate Prisma's XOR and relation types
// type XOR<T, U> = T extends object
//     ? U extends object
//         ? (T & { [K in Exclude<keyof U, keyof T>]?: never }) | (U & { [K in Exclude<keyof T, keyof U>]?: never })
//         : U
//     : T;

// type ProfileRelationFilter = {
//     is?: {
//         bio?: string;
//         age?: number;
//     } | null;
// };

// type ProfileNullableRelationFilter = {
//     isNot?: {
//         bio?: string;
//         age?: number;
//     } | null;
// };

// type UserWhereInput = {
//     id?: number;
//     email?: string;
//     name?: string | null;
//     // This is how Prisma actually types relations with XOR
//     profile?: XOR<ProfileRelationFilter, ProfileNullableRelationFilter> | null;
//     AND?: UserWhereInput[];
//     OR?: UserWhereInput[];
//     NOT?: UserWhereInput[];
// };

// type test2 = {
//     hello: string;
//     b?: {
//         c: number;
//         d: {
//             e: boolean;
//         };
//     };
// }

// // type UserFilters = FilterKey<UserWhereInput>;
// // // Should give: "id" | "email" | "name" | "profile" | "profile.bio" | "profile.age" |
// // //              "id_in" | "email_contains" | "profile.age_gte" | ... | "order" | "page"

// // type whereKey = DotPath<UserWhereInput>;
// // const a: whereKey = "p";
