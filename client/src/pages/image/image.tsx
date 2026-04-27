import { useEffect, useRef } from "react";

const images = [
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/zzz.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/11_15_11zon.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/14_18_11zon.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/aqass.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/iii-scaled.webp?resize=1200%2C800&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/9_13_11zon.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/12_3_11zon-1.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/19_4_11zon.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/13_17_11zon.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/cay-co-bang_6_11zon-2.webp?w=1200&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2021/09/GREEN-LIFE-COVER-FB_11zon.webp?fit=1277%2C473&ssl=1",
    "https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/iStock-871565384_11zon-1-scaled.webp?resize=1200%2C800&ssl=1",
];

const LazyImage = ({ src, alt }: { src: string; alt: string }) => {
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("opacity-100", "translate-y-0");
                    el.classList.remove("opacity-0", "translate-y-4");
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="overflow-hidden rounded-lg shadow-md bg-gray-100">
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                loading="lazy"
                className="w-full h-64 object-cover transition-all duration-700 ease-out opacity-0 translate-y-4"
            />
        </div>
    );
};

const ImagePage = () => {
    return (
        <div className="container mx-auto py-10 px-5 lg:w-[70%]">
            <div className="flex items-center justify-center mb-8">
                <h4 className="text-3xl lg:text-4xl font-bold text-[rgb(51,102,51)] text-center">
                    Thư Viện <span className="text-[#66cc00]">Hình Ảnh</span>
                </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((src, index) => (
                    <LazyImage
                        key={index}
                        src={src}
                        alt={`greenlife-gallery-${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImagePage;