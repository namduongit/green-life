
const CertificatePage = () => {
    return (
        <div className="container mx-auto py-10 space-y-20">
            <div className="flex flex-col gap-5">
                <div className="lg:w-[70%] lg:mx-auto">
                    <div className="flex items-center justify-center">
                        <h4 className="px-5 text-2xl lg:text-4xl font-bold text-[rgb(51,102,51)]">
                            KẾT QUẢ KIỂM NGHIỆM AN TOÀN SỨC KHỎE – ỐNG HÚT CỎ BÀNG GREEN-LIFE
                        </h4>
                    </div>
                    <div className="px-5 mt-5">
                        <div>
                            <p>
                                Sản phẩm ống hút cỏ bàng GREEN-LIFE đã được kiểm nghiệm an toàn 
                                theo Quyết định số 46/2007/QĐ-BYT của Bộ Y tế Việt Nam – quy định về giới hạn ô nhiễm 
                                kim loại nặng trong thực phẩm và vật liệu tiếp xúc với thực phẩm.
                            </p>
                        </div>
                        <div className="mt-5">
                            <p>
                                Kết quả kiểm nghiệm cho thấy <span className="text-[#008000]">các chỉ tiêu 
                                như Chì (Pb), Cadimi (Cd), Antimon (Sb) và Asen (As) đều</span> <span className="text-[#ff6600]">đạt mức “KPH” (Không phát hiện)</span>, nghĩa là không chứa 
                                kim loại nặng vượt quá ngưỡng cho phép theo quy định hiện hành.
                            </p>
                        </div>
                        <div className="mt-5">
                            <p>
                                Theo Quyết định 46/2007/QĐ-BYT, giới hạn an toàn cho các kim 
                                loại nặng này là ≤ 0.05 mg/kg. Việc không phát hiện các chất 
                                độc hại chứng minh rằng ống hút cỏ bàng hoàn toàn an toàn khi 
                                tiếp xúc với thực phẩm và đồ uống, kể cả trong điều kiện ngâm 
                                lâu trong nước hoặc các dung dịch có tính acid nhẹ (như nước trái cây, cà phê, sinh tố…).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:w-[70%] lg:mx-auto">
                    <div className="mx-5">
                        <h4 className="text-2xl lg:text-4xl font-bold text-[rgb(51,102,51)]">
                            ✅ Cam kết an toàn và thân thiện với môi trường
                        </h4>
                    </div>
                    <div className="px-5 mt-5">
                        <div className="mt-5">
                            <p>Kết quả này là minh chứng rõ ràng cho cam kết của GREEN-LIFE trong việc:</p>
                        </div>
                    </div>
                    <div className="px-5 mt-5">
                        <ul className="px-5 list-disc space-y-2">
                            <li className="text-justify">Cung cấp sản phẩm thân thiện với môi trường, không hóa chất độc hại;</li>
                            <li className="text-justify">Đảm bảo tiêu chuẩn vệ sinh an toàn thực phẩm theo quy định của Bộ Y tế;</li>
                            <li className="text-justify">Hướng đến lối sống xanh, an toàn cho sức khỏe con người và hệ sinh thái.</li>
                        </ul>
                    </div>
                    <div className="px-5 mt-5">
                        <div className="mt-5">
                            <p>
                                Ống hút cỏ bàng GREEN-LIFE không chỉ là giải pháp thay thế 
                                ống hút nhựa bền vững, mà còn là sản phẩm được chứng nhận 
                                an toàn – phù hợp sử dụng trong nhà hàng, quán cà phê, khách sạn, và gia đình.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificatePage;