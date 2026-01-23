import logoFooter from "../../assets/icons/logo-footer.svg"
import logoBct from "../../assets/icons/logo-verify.png"

import logoMomo from "../../assets/icons/logo-momo.svg"
import logoZalopay from "../../assets/icons/logo-zalopay.svg"
import logoCod from "../../assets/icons/logo-cod.svg"

const Footer = () => {
    return (
        <footer className="bg-green-700 py-8 text-white px-3 md:px-5 lg:px-0">
            <div className="container mx-auto flex flex-col gap-5 md:flex-row md:gap-0">
                <div className="flex-3 space-y-5">
                    <div>
                        <img src={logoFooter} alt="" className="w-30 h-30" />
                    </div>
                    <div className="space-y-2">
                        <div className="text-white text-md space-x-1 font-light">
                            <i className="fa-regular fa-building"></i>
                            <span>CÔNG TY TNHH SX & TM SỐNG XANH BỀN VỮNG VIỆT NAM</span>
                        </div>
                        <div className="text-white text-md space-x-1 font-light">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>Địa chỉ ĐKKD: 12/5/11, KP6, ĐHT8, Phường Đông Hưng Thuận, TP. HCM</span>
                        </div>
                        <div className="text-white text-md space-x-1 font-light">
                            <i className="fa-solid fa-location-dot"></i>
                            <span>Địa chỉ giao hàng: 95/10 Lê Hồng Phong, Phú Lợi, Thủ Dầu Một, BD</span>
                        </div>
                        <div className="text-white text-md space-x-1 font-light">
                            <i className="fa-solid fa-star"></i>
                            <span>MST: 0319164330</span>
                        </div>
                        <div className="text-white text-md space-x-1 font-light">
                            <i className="fa-solid fa-star"></i>
                            <span>Ngày cấp: 19/09/2025</span>
                        </div>
                        <div className="text-white text-md space-x-1 font-light">
                            <i className="fa-solid fa-star"></i>
                            <span>Nơi cấp: Phòng Đăng ký kinh doanh - Sở Tài Chính TP. Hồ Chí Minh</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-xl">KẾT NỐI VỚI CHÚNG TÔI</h1>
                        <div className="pt-3">
                            <ul className="flex gap-2">
                                <li className="w-8 h-8 bg-white flex justify-center items-center rounded-full">
                                    <i className="fa-brands fa-facebook-f text-green-700"></i>
                                </li>
                                <li className="w-8 h-8 bg-white flex justify-center items-center rounded-full">
                                    <i className="fa-brands fa-youtube text-green-700"></i>
                                </li>
                                <li className="w-8 h-8 bg-white flex justify-center items-center rounded-full">
                                    <i className="fa-brands fa-tiktok text-green-700"></i>
                                </li>
                                <li className="w-8 h-8 bg-white flex justify-center items-center rounded-full">
                                    <i className="fa-brands fa-whatsapp text-green-700"></i>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex-2">
                    <h1 className="text-xl font-bold">MENU</h1>
                    <ul className="text-lg font-medium">
                        <li>
                            Về chúng tôi
                        </li>
                        <li>
                            Tin tức
                        </li>
                        <li>
                            Liên hệ
                        </li>
                        <li>
                            Chính sách đổi hàng
                        </li>
                        <li>
                            Hướng dẫn mua hàng
                        </li>
                        <li>
                            Hướng dẫn thanh toán
                        </li>
                    </ul>
                </div>

                <div className="flex-2 space-y-5">
                    <div>
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4867.826000411579!2d105.0185808!3d10.5112957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109f70021ecc8c1%3A0x95933aa8999bcd17!2zWOG7qSBz4bufIHRi4bqnbiB0acOqbg!5e1!3m2!1svi!2s!4v1768767255638!5m2!1svi!2s" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                            className="w-full"
                        ></iframe>
                    </div>
                    <div>
                        <img src={logoBct} alt="" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">PHƯƠNG THỨC THANH TOÁN</h1>
                        <ul className="flex gap-5 pt-3">
                            <li>
                                <img src={logoMomo} alt="" className="w-12 aspect-square" />
                            </li>
                            <li>
                                <img src={logoZalopay} alt="" className="w-12 aspect-square" />
                            </li>
                            <li>
                                <img src={logoCod} alt="" className="w-12 aspect-square" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;