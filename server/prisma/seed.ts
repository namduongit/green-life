/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { faker } from '@faker-js/faker';
import { PrismaClient } from './generated/client';
// load the .env file
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

function toSlug(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

async function main() {
    // CLEAN DB (optional)
    await prisma.cartItems.deleteMany();
    await prisma.carts.deleteMany();
    await prisma.orderItems.deleteMany();
    await prisma.orders.deleteMany();
    // await prisma.payments.deleteMany();
    await prisma.tagProducts.deleteMany();
    await prisma.properties.deleteMany();
    await prisma.products.deleteMany();
    await prisma.tags.deleteMany();
    await prisma.categories.deleteMany();
    await prisma.addresses.deleteMany();
    await prisma.accounts.deleteMany();

    // CATEGORIES:
    // ống hút, túi giấy, hộp giấy, cốc giấy, cốc bã mía, nước dửa chén
    // bao bì & dụng cụ đựng thực phẩm:
    // - túi giấy, hộp giấy, cốc giấy, cốc bã mía, ống hút
    // dụng cụ thân thiện với môi trường:
    // - ống hút
    // chất tẩy rửa sinh học:
    // - nước dửa chén
    //
    await prisma.categories.createMany({
        data: [
            // Bao bì & dụng cụ đựng thực phẩm map to english: Food Packaging & Utensils
            'Food Packaging & Utensils',
            'Eco-friendly Utensils',
            'Biological Cleaners',
        ].map((name) => ({
            name: name,
            slug: toSlug(name),
            status: 'Active',
        })),
    });
    const categories = await prisma.categories.findMany();

    // TAGS
    await prisma.tags.createMany({
        data: ['Hot', 'New', 'Sale'].map((name) => ({ name, status: 'Active' })),
    });
    const tags = await prisma.tags.findMany();

    // PRODUCTS
    const products = await Promise.all(
        Array.from({ length: 10 }).map(() => {
            const category = faker.helpers.arrayElement(categories);
            return prisma.products.create({
                data: {
                    currentStock: faker.number.int({ min: 0, max: 100 }),
                    categoryId: category.id,
                    property: {
                        create: {
                            urlImage: faker.image.url({ height: 400, width: 400 }),
                            name: faker.commerce.productName(),
                            description: faker.commerce.productDescription(),
                            weight: faker.number.int({ min: 100, max: 1000 }).toString(),
                            unit: 'Gram',
                            length: 10,
                            width: 10,
                            height: 10,
                            price: parseFloat(faker.commerce.price({ min: 1, max: 1000 }) || '0'),
                        },
                    },
                    status: 'Active',
                },
            });
        }),
    );

    // TAG ↔ PRODUCT
    for (const product of products) {
        const tag = faker.helpers.arrayElement(tags);
        await prisma.tagProducts.create({
            data: {
                tagId: tag.id,
                productId: product.id,
            },
        });
    }

    // ACCOUNTS
    await prisma.accounts.createMany({
        data: Array.from({ length: 8 }).map((_, index) => ({
            email: faker.internet.email({ firstName: `user${index}` }).toLowerCase(),
            password: '123456',
            role: index === 0 ? 'Admin' : 'User',
            isLock: false,
        })),
    });
    const accounts = await prisma.accounts.findMany();

    // ADDRESSES
    for (const account of accounts) {
        await prisma.addresses.create({
            data: {
                accountId: account.id,
                fullName: faker.person.fullName(),
                phone: `0${faker.string.numeric(9)}`,
                province: faker.location.state(),
                ward: faker.location.city(),
                detail: faker.location.streetAddress(),
                isDefault: true,
            },
        });
    }

    // ORDERS + ORDER ITEMS + CHECKOUT HISTORY
    const orderStatuses = ['Pending', 'Confirmed', 'InTransit', 'Received', 'Cancelled'] as const;
    const paymentMethods = ['Cod', 'Momo', 'SePay'] as const;

    for (let i = 0; i < 30; i++) {
        const account = faker.helpers.arrayElement(accounts);
        const orderItemsCount = faker.number.int({ min: 1, max: 4 });
        const selectedProducts = faker.helpers.arrayElements(products, orderItemsCount);

        const itemPayload = selectedProducts.map((product) => {
            const quantity = faker.number.int({ min: 1, max: 5 });
            const price = faker.number.int({ min: 10000, max: 300000 });
            const amount = quantity * price;
            return {
                productId: product.id,
                quantity,
                price,
                amount,
            };
        });

        const totalQuantity = itemPayload.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = itemPayload.reduce((sum, item) => sum + item.amount, 0);
        const status = faker.helpers.arrayElement(orderStatuses);
        const paymentMethod = faker.helpers.arrayElement(paymentMethods);
        const paymentStatus = status === 'Received' ? 'Paid' : faker.helpers.arrayElement(['UnPaid', 'Paid'] as const);

        const order = await prisma.orders.create({
            data: {
                accountId: account.id,
                recipientName: faker.person.fullName(),
                recipientPhone: `0${faker.string.numeric(9)}`,
                recipientProvince: faker.location.state(),
                recipientWard: faker.location.city(),
                recipientDetail: faker.location.streetAddress(),
                paymentMethod,
                status,
                paymentStatus,
                totalAmount,
                totalQuantity,
                orderItems: {
                    create: itemPayload,
                },
            },
        });

        if (paymentStatus === 'Paid') {
            await prisma.checkoutHistory.create({
                data: {
                    orderId: order.id,
                    accountId: account.id,
                    paymentType: paymentMethod,
                    amount: totalAmount,
                    requestId: faker.string.uuid(),
                },
            });
        }
    }

    console.log('✅ Database seeded');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
