import { useEffect, useMemo, useState } from "react";
import Banner1 from "../../assets/home/banner.png";
import Banner2 from "../../assets/home/banner2.png";
import Banner3 from "../../assets/home/banner3.png";
import CardProduct from "../../components/card-product/card-product";
import { useExecute } from "../../hooks/execute";
import { getAllProducts, type ProductRep } from "../../services/product";
import Icon1 from "../../assets/home/icon1.svg";
import Icon2 from "../../assets/home/icon2.svg";
import Icon3 from "../../assets/home/icon3.svg";
import Icon4 from "../../assets/home/icon4.svg";
import Icon5 from "../../assets/home/icon5.svg";
import Icon6 from "../../assets/home/icon6.svg";

const HomePage = () => {
    const [products, setProducts] = useState<ProductRep[]>([]);
    const [hotProducts, setHotProducts] = useState<ProductRep[]>([]);
    const [currentHotSlide, setCurrentHotSlide] = useState(0);
    const { query } = useExecute();

    const hotProductSlides = useMemo(() => {
        const itemsPerSlide = 4;
        const slides: ProductRep[][] = [];

        for (let index = 0; index < hotProducts.length; index += itemsPerSlide) {
            slides.push(hotProducts.slice(index, index + itemsPerSlide));
        }

        return slides;
    }, [hotProducts]);

    const canSlideHotProducts = hotProductSlides.length > 1;
    const safeCurrentHotSlide = Math.min(
        currentHotSlide,
        Math.max(hotProductSlides.length - 1, 0),
    );

    useEffect(() => {
        const loadProducts = async () => {
            const result = await query(
                getAllProducts({ page: 1, pageSize: 8 }),
            );

            if (result?.data) {
                const pageData = result.data as any;
                const items = pageData.data ?? pageData;
                setProducts(items);
            }

            const hotResult = await query<ProductRep[]>(
                getAllProducts(1, 8, true),
            );

            if (hotResult?.data) {
                setHotProducts(hotResult.data);
            }
        };

        loadProducts();
    }, [query]);

    const moveHotSlide = (direction: "next" | "prev") => {
        if (!canSlideHotProducts) {
            return;
        }

        if (direction === "next") {
            setCurrentHotSlide(prev => (prev + 1) % hotProductSlides.length);
            return;
        }

        setCurrentHotSlide(
            prev => (prev - 1 + hotProductSlides.length) % hotProductSlides.length,
        );
    };

    useEffect(() => {
        if (!canSlideHotProducts) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCurrentHotSlide(prev => (prev + 1) % hotProductSlides.length);
        }, 4000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [canSlideHotProducts, hotProductSlides.length]);

    return (
        <div className="container mx-auto py-10 space-y-20">
            <div className="flex flex-col gap-5">
                <div>
                    <div className="flex items-center justify-center">
                        <h4 className="text-3xl lg:text-5xl font-bold text-[rgb(51,102,51)]">
                        Có thể bạn <span className="text-[#66cc00]">chưa biết?</span>
                        </h4>
                    </div>
                    <div className="flex items-center justify-center mt-3">
                        <img
                            src="https://green-life.com.vn/wp-content/uploads/2025/07/svg-trai-dat-14.svg"
                            alt="earth-banner"
                            className="w-50"
                        />
                    </div>
                </div>

                <div className="mt-8 lg:flex lg:items-center lg:gap-5">
                    <div>
                        <img
                            src={Banner1}
                            alt="banner-1"
                        />
                    </div>
                    <div className="mt-8 lg:mt-0">
                        <h5 className="text-center lg:text-left text-lg lg:text-xl font-bold text-[rgb(51,102,51)] mb-2 lg:pl-5">Về hiện trạng đất tại Đồng bằng sông Cửu Long</h5>
                        <ul className="list-disc px-6 flex flex-col gap-3">
                            <li><span className="text-[#008000]">Đồng bằng sông Cửu Long (ĐBSCL)</span> với tổng diện tích khoảng 4 triệu hecta, trong đó diện tích <span className="text-[#008000]">đất phèn chiếm khoảng 1,6 triệu hecta</span>, phân bố chủ yếu ở <span className="text-[#008000]">Tứ giác Long Xuyên, Đồng Tháp Mười,</span> bán đảo <span className="text-[#008000]">Cà Mau</span> và <span className="text-[#008000]">trũng sông Hậu</span>.</li>
                            <li>Ở điều kiện đất có <span className="text-[#008000]">pH ≤ 5,5</span>, độc tính của Al (nhôm) là yếu tố gây ngộ độc chính cho cây trồng, làm hạn chế sản lượng, thay đổi các quá trình sinh lý, sinh hóa và giảm năng suất.</li>
                            <li><span className="text-[#008000]">Cỏ bàng (Lepironia articulata)</span>, là một loài thực vật phù hợp cho các hệ sinh thái đất ngập nước phèn chua, có giá trị sinh khối rất lớn và thu nhập từ cỏ bàng cao hơn so với trồng lúa trên cùng một đơn vị diện tích đất <span className="text-[#008000]">(*)</span>.</li>
                            <li>Hoạt động sinh kế liên quan đến cây cỏ bàng như làm đồ dùng thủ công mỹ nghệ, <span className="text-[#008000]">ống hút cỏ bàng</span> đang được quan tâm và phát triển.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="lg:flex lg:items-center lg:gap-5">
                <div>
                    <div>
                        <div className="flex flex-col items-center justify-center gap-5">
                            <h4 className="text-3xl lg:text-5xl font-bold text-[rgb(51,102,51)]">
                            Tại sao nên sử dụng
                            </h4>
                            <h4 className="text-3xl lg:text-5xl font-bold text-[#66cc00] ml-2">
                                Ống Hút Cỏ Bàng?
                            </h4>
                        </div>
                        <div className="flex items-center justify-center mt-3 lg:hidden">
                            <img
                                src="https://green-life.com.vn/wp-content/uploads/2025/07/svg-trai-dat-14.svg"
                                alt="earth-banner"
                                className="w-50"
                            />
                        </div>
                    </div>

                    <div className="px-5 mt-8 lg:w-160">
                            <img
                                src={Banner2}
                                alt="banner-2"
                            />
                    </div>
                </div>

                <div className="mt-8 flex flex-col">
                    
                    <div className="px-5 mt-8 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-40 md:w-20">
                                <img src={Icon1} />
                            </div>
                            <div>
                                <div className="text-[rgb(51,102,51)] font-bold text-lg">Giảm thiểu rác thải nhựa</div>
                                <div>
                                    <p>Mỗi ống hút cỏ được dùng, đồng nghĩa với việc bớt đi một ống hút nhựa ra môi trường</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-35 md:w-20">
                                <img src={Icon2} />
                            </div>
                            <div>
                                <div className="text-[rgb(51,102,51)] font-bold text-lg">Thân thiện với môi trường</div>
                                <div>
                                    <p>Vì là cỏ (thực vật) nên ống hút phân hủy sinh học 100% trong tự nhiên.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-40 md:w-20">
                                <img src={Icon3} />
                            </div>
                            <div>
                                <div className="text-[rgb(51,102,51)] font-bold text-lg">Không hóa chất</div>
                                <div>
                                    <p>Thuộc họ cây Lác (Cói), Cỏ Bàng phát triển tốt và nhanh ngoài tự nhiên, ít sâu bệnh.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-40 md:w-20">
                                <img src={Icon4} />
                            </div>
                            <div>
                                <div className="text-[rgb(51,102,51)] font-bold text-lg">Sinh kế bền vững</div>
                                <div>
                                    <p>Tạo thu nhập ổn định, bền vững cho người nông dân Đồng bằng Sông Cửu Long</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-40 md:w-20">
                                <img src={Icon5} />
                            </div>
                            <div>
                                <div className="text-[rgb(51,102,51)] font-bold text-lg">Sinh kế bền vững</div>
                                <div>
                                    <p>Tạo thu nhập ổn định, bền vững cho người nông dân Đồng bằng Sông Cửu Long</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-40 md:w-20">
                                <img src={Icon6} />
                            </div>
                            <div>
                                <div className="text-[rgb(51,102,51)] font-bold text-lg">Kinh tế tuần hoàn</div>
                                <div>
                                    <p>Phát triển tốt trên đất phèn (ít canh tác lúa), chống xói mòn, bảo tồn hệ sinh thái.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="">
                <div>
                    <div className="flex items-center justify-center">
                        <h4 className="text-3xl lg:text-5xl font-bold text-[rgb(51,102,51)]">
                        Sản phẩm của <span className="text-[#66cc00]">GREENLIFE</span>
                        </h4>
                    </div>
                    <div className="flex items-center justify-center mt-3">
                        <img
                            src="https://green-life.com.vn/wp-content/uploads/2025/07/svg-trai-dat-14.svg"
                            alt="earth-banner"
                            className="w-50"
                        />
                    </div>
                </div>

                {products.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map(product => (
                            <CardProduct
                                key={product.id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
                
            </div>

            <div className="lg:flex lg:gap-5">
                <div>
                    <img src={Banner3} alt="Banner 3" />
                </div>
                <div className="mt-6">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-3xl lg:text-5xl font-bold text-[rgb(51,102,51)]">
                        Thành phần của
                        </h4>
                        <h4 className="text-3xl lg:text-5xl font-bold text-[#66cc00]">
                            Ống Hút Cỏ Bàng
                        </h4>
                        <ul className="list-disc px-6 flex flex-col gap-4 mt-5">
                            <li>Ống hút cỏ bàng được sản xuất từ thân cây cỏ bàng tự nhiên (Lepironia articulata). Thành phần chính gồm cellulose – chất xơ cấu tạo nên thành tế bào thực vật</li>
                            <li>Tất cả đều có nguồn gốc tự nhiên, được xử lý, sấy khô và vệ sinh theo quy trình kiểm soát vi sinh, đảm bảo an toàn khi tiếp xúc trực tiếp với thực phẩm và đồ uống.</li>
                        </ul>

                        <div className="mt-5 lg:grid lg:grid-cols-2 lg:gap-5">
                            <div>
                                <h4 className="text-xl font-bold text-[rgb(51,102,51)] pb-2 border-b border-gray-200">THÀNH PHẦN:</h4>
                                <p className="pt-2">Cỏ Bàng tự nhiên, sấy khô</p>
                            </div>
                            <div className="mt-5 lg:mt-0">
                                <h4 className="text-xl font-bold text-[rgb(51,102,51)] pb-2 border-b border-gray-200">QUY CÁCH ĐÓNG GÓI:</h4>
                                <p className="pt-2">Hộp 50, 100 và 200 ống</p>
                            </div>
                            <div className="mt-5">
                                <h4 className="text-xl font-bold text-[rgb(51,102,51)] pb-2 border-b border-gray-200">HẠN SỬ DỤNG:</h4>
                                <p className="pt-2">18 tháng</p>
                            </div>
                            <div className="mt-5">
                                <h4 className="text-xl font-bold text-[rgb(51,102,51)] pb-2 border-b border-gray-200">CHIỀU DÀI ỐNG:</h4>
                                <p className="pt-2">15cm và 20cm</p>
                            </div>
                        </div>

                        <div className="flex gap-5 mt-5">
                            <button className="bg-[#FC0] rounded-2xl px-4 py-2 cursor-pointer">MUA NGAY</button>
                            <button className="bg-[#246923] text-white rounded-2xl px-4 py-2 cursor-pointer">TÌM HIỂU VỀ CỎ BÀNG</button>
                        </div>
                    </div>
                </div>
            </div>
            {hotProductSlides.length > 0 && (
                <div>
                    <div className="flex items-center justify-center">
                        <h4 className="text-3xl lg:text-5xl font-bold text-[rgb(51,102,51)]">
                            Sản phẩm <span className="text-[#66cc00]">bán chạy</span>
                        </h4>
                    </div>
                    <div className="flex items-center justify-center mt-3">
                        <img
                            src="https://green-life.com.vn/wp-content/uploads/2025/07/svg-trai-dat-14.svg"
                            alt="earth-banner"
                            className="w-50"
                        />
                    </div>

                    <div className="mt-8 relative pb-1">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${safeCurrentHotSlide * 100}%)` }}
                            >
                                {hotProductSlides.map((slide, slideIndex) => (
                                    <div
                                        key={`hot-slide-${slideIndex}`}
                                        className="w-full shrink-0"
                                    >
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {slide.map(product => (
                                                <CardProduct
                                                    key={product.id}
                                                    product={product}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* {canSlideHotProducts && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Xem sản phẩm bán chạy trước"
                                    onClick={() => moveHotSlide("prev")}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:-translate-x-5 w-10 h-10 rounded-full bg-white/90 text-[rgb(51,102,51)] shadow-md cursor-pointer"
                                >
                                    &#8249;
                                </button>
                                <button
                                    type="button"
                                    aria-label="Xem sản phẩm bán chạy tiếp theo"
                                    onClick={() => moveHotSlide("next")}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 lg:translate-x-5 w-10 h-10 rounded-full bg-white/90 text-[rgb(51,102,51)] shadow-md cursor-pointer"
                                >
                                    &#8250;
                                </button>
                            </>
                        )} */}
                    </div>

                    {canSlideHotProducts && (
                        <div className="flex items-center justify-center gap-2 mt-5">
                            {hotProductSlides.map((_, dotIndex) => (
                                <button
                                    key={`hot-dot-${dotIndex}`}
                                    type="button"
                                    aria-label={`Đi tới slide ${dotIndex + 1}`}
                                    onClick={() => setCurrentHotSlide(dotIndex)}
                                    className={`h-2.5 rounded-full cursor-pointer transition-all ${
                                        dotIndex === safeCurrentHotSlide
                                            ? "w-8 bg-[rgb(51,102,51)]"
                                            : "w-2.5 bg-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            
        </div>
    )
}

export default HomePage;