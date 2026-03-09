export const Role = {
    User: "User",
    Admin: "Admin",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Unit = {
    Gram: "Gram",
    Kilogram: "Kilogram",
    Other: "Other",
} as const;

export type Unit = (typeof Unit)[keyof typeof Unit];

export const OrderStatus = {
    Pending: "Pending",
    Confirm: "Confirm",
    InTransit: "InTransit",
    Done: "Done",
    Cancled: "Cancled",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderPaymentStatus = {
    UnPaid: "UnPaid",
    Paid: "Paid",
} as const;

export type OrderPaymentStatus =
    (typeof OrderPaymentStatus)[keyof typeof OrderPaymentStatus];

export const PaymentType = {
    Momo: "Momo",
    VNPay: "VNPay",
    SeaPay: "SeaPay",
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const CommonStatus = {
    Active: "Active",
    UnActive: "UnActive",
    Other: "Other",
} as const;

export type CommonStatus = (typeof CommonStatus)[keyof typeof CommonStatus];
