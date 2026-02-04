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
    await prisma.payments.deleteMany();
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
        })),
    });
    const categories = await prisma.categories.findMany();

    // TAGS
    await prisma.tags.createMany({
        data: ['Hot', 'New', 'Sale'].map((name) => ({ name })),
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

    console.log('✅ Database seeded');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
