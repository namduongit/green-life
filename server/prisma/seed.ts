/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { faker } from '@faker-js/faker';
import { PrismaClient } from './generated/client';
// load the .env file
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

const SEED_CONFIG = {
    categoryCount: 8,
    tagCount: 12,
    productCount: 180,
    accountCount: 120,
    orderCount: 1200,
    maxDaysBack: 180,
};

const CATEGORY_NAMES = [
    'Food Packaging & Utensils',
    'Eco-friendly Utensils',
    'Biological Cleaners',
    'Compostable Cups',
    'Paper Bags',
    'Biodegradable Straws',
    'Lunch Box Containers',
    'Kitchen Essentials',
    'Household Green Care',
    'Sustainable Office Supplies',
];

const TAG_NAMES = [
    'Hot',
    'New',
    'Sale',
    'Best Seller',
    'Eco Choice',
    'Premium',
    'Family Pack',
    'Wholesale',
    'Limited',
    'Trending',
    'Budget',
    'Top Rated',
    'Organic',
    'Reusable',
];

function randomPastDate(maxDaysBack: number) {
    const now = Date.now();
    const maxMs = maxDaysBack * 24 * 60 * 60 * 1000;
    const offset = faker.number.int({ min: 0, max: maxMs });
    return new Date(now - offset);
}

function plusRandomHours(date: Date, maxHours = 96) {
    return new Date(date.getTime() + faker.number.int({ min: 1, max: maxHours }) * 60 * 60 * 1000);
}

function pickOrderStatus() {
    const n = faker.number.int({ min: 1, max: 100 });
    if (n <= 18) return 'Pending' as const;
    if (n <= 38) return 'Confirmed' as const;
    if (n <= 56) return 'InTransit' as const;
    if (n <= 84) return 'Received' as const;
    return 'Cancelled' as const;
}

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
    console.time('seed-runtime');

    // CLEAN DB (optional)
    const existingOrders = await prisma.orders.findMany({
        select: { id: true },
    });

    await prisma.cartItems.deleteMany();
    await prisma.carts.deleteMany();
    await prisma.hotProducts.deleteMany();

    for (const order of existingOrders) {
        await prisma.checkoutHistory.deleteMany({
            where: { orderId: order.id },
        });
    }

    for (const order of existingOrders) {
        await prisma.orderItems.deleteMany({
            where: { orderId: order.id },
        });
    }

    for (const order of existingOrders) {
        await prisma.orders.delete({
            where: { id: order.id },
        });
    }

    await prisma.tagProducts.deleteMany();
    await prisma.properties.deleteMany();
    await prisma.products.deleteMany();
    await prisma.tags.deleteMany();
    await prisma.categories.deleteMany();
    await prisma.addresses.deleteMany();
    await prisma.accounts.deleteMany();

    console.log('⏳ Seeding categories...');
    await prisma.categories.createMany({
        data: CATEGORY_NAMES.slice(0, SEED_CONFIG.categoryCount).map((name) => ({
            name: name,
            slug: toSlug(name),
            status: 'Active',
        })),
    });
    const categories = await prisma.categories.findMany();

    console.log('⏳ Seeding tags...');
    await prisma.tags.createMany({
        data: TAG_NAMES.slice(0, SEED_CONFIG.tagCount).map((name) => ({ name, status: 'Active' })),
    });
    const tags = await prisma.tags.findMany();

    console.log('⏳ Seeding products...');
    const productsWithPrice = await Promise.all(
        Array.from({ length: SEED_CONFIG.productCount }).map(async () => {
            const category = faker.helpers.arrayElement(categories);
            const createdAt = randomPastDate(SEED_CONFIG.maxDaysBack);
            const price = faker.number.int({ min: 12000, max: 650000 });

            const product = await prisma.products.create({
                data: {
                    currentStock: faker.number.int({ min: 0, max: 300 }),
                    categoryId: category.id,
                    isDelete: faker.datatype.boolean(0.12),
                    property: {
                        create: {
                            urlImage: faker.image.url({ height: 400, width: 400 }),
                            name: faker.commerce.productName(),
                            description: faker.commerce.productDescription(),
                            weight: faker.number.int({ min: 100, max: 3500 }).toString(),
                            unit: faker.helpers.arrayElement(['Gram', 'Kilogram'] as const),
                            length: faker.number.int({ min: 6, max: 40 }),
                            width: faker.number.int({ min: 6, max: 35 }),
                            height: faker.number.int({ min: 6, max: 32 }),
                            price,
                            createdAt,
                            updatedAt: plusRandomHours(createdAt),
                        },
                    },
                    status: faker.datatype.boolean(0.84) ? 'Active' : 'UnActive',
                },
            });

            return { product, basePrice: price };
        }),
    );
    const products = productsWithPrice.map((item) => item.product);

    console.log('⏳ Seeding tag-product links...');
    for (const product of products) {
        const pickedTags = faker.helpers.arrayElements(
            tags,
            faker.number.int({ min: 1, max: Math.min(4, tags.length) }),
        );

        for (const tag of pickedTags) {
            await prisma.tagProducts.create({
                data: {
                    tagId: tag.id,
                    productId: product.id,
                },
            });
        }
    }

    console.log('⏳ Seeding accounts...');
    await prisma.accounts.createMany({
        data: Array.from({ length: SEED_CONFIG.accountCount }).map((_, index) => ({
            email: faker.internet.email({ firstName: `user${index}` }).toLowerCase(),
            password: '123456',
            role: index === 0 ? 'Admin' : 'User',
            isLock: faker.datatype.boolean(0.08),
        })),
    });
    const accounts = await prisma.accounts.findMany();

    console.log('⏳ Seeding addresses...');
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

        if (faker.datatype.boolean(0.35)) {
            await prisma.addresses.create({
                data: {
                    accountId: account.id,
                    fullName: faker.person.fullName(),
                    phone: `0${faker.string.numeric(9)}`,
                    province: faker.location.state(),
                    ward: faker.location.city(),
                    detail: faker.location.streetAddress(),
                    isDefault: false,
                },
            });
        }
    }

    console.log('⏳ Seeding orders + order items + checkout history...');
    const orderStatuses = ['Pending', 'Confirmed', 'InTransit', 'Received', 'Cancelled'] as const;
    const paymentMethods = ['Cod', 'Momo', 'SePay'] as const;

    for (let i = 0; i < SEED_CONFIG.orderCount; i++) {
        const account = faker.helpers.arrayElement(accounts);
        const orderItemsCount = faker.number.int({ min: 1, max: 6 });
        const selectedProducts = faker.helpers.arrayElements(productsWithPrice, orderItemsCount);

        const itemPayload = selectedProducts.map((product) => {
            const quantity = faker.number.int({ min: 1, max: 8 });
            const multiplier = faker.number.float({ min: 0.85, max: 1.25, fractionDigits: 2 });
            const price = Math.max(1000, Math.round(product.basePrice * multiplier));
            const amount = quantity * price;
            return {
                productId: product.product.id,
                quantity,
                price,
                amount,
            };
        });

        const totalQuantity = itemPayload.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = itemPayload.reduce((sum, item) => sum + item.amount, 0);
        const status = pickOrderStatus();
        const paymentMethod = faker.helpers.arrayElement(paymentMethods);
        const paymentStatus = status === 'Received' ? 'Paid' : faker.helpers.arrayElement(['UnPaid', 'Paid'] as const);
        const createdAt = randomPastDate(SEED_CONFIG.maxDaysBack);

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
                createdAt,
                updatedAt: plusRandomHours(createdAt),
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

    console.log('⏳ Seeding hot products...');
    const hotCandidates = faker.helpers.arrayElements(products, Math.min(30, products.length));

    for (const product of hotCandidates) {
        await prisma.hotProducts.create({
            data: {
                productId: product.id,
                soldQuantity: faker.number.int({ min: 20, max: 800 }),
            },
        });
    }

    console.log('✅ Database seeded successfully');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Tags: ${tags.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Accounts: ${accounts.length}`);
    console.log(`   - Orders: ${SEED_CONFIG.orderCount}`);
    console.timeEnd('seed-runtime');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
