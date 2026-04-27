

const AboutPage = () => {
    return (
        <div className="container mx-auto py-10 space-y-20">
            <div className="flex flex-col gap-5">
                <div className="lg:w-[70%] lg:mx-auto">
                    <div className="flex items-center justify-center">
                        <h4 className="text-3xl lg:text-5xl font-bold text-[rgb(51,102,51)]">
                            Về Chúng Tôi <span className="text-[#66cc00]">GREENLIFE</span>
                        </h4>
                    </div>
                    <div className="mt-3 px-5 text-center">
                        GREEN gắn liền với LIFE, ví như hành tinh phải gắn liền với cuộc sống hàng ngày
                    </div>
                    <div className="px-5 mt-5 flex items-center justify-center">
                        <img
                            src="https://i0.wp.com/green-life.com.vn/wp-content/uploads/2021/09/GREEN-LIFE-COVER-FB_11zon.webp?fit=1277%2C473&ssl=1"
                            alt="banner-1"
                        />                      
                    </div>
                    <div className="px-5 mt-5">
                        <div>
                            <p>Tại <span className="font-bold text-[rgb(51,102,51)]">Green Life</span>, chúng tôi hướng tới việc trở thành một doanh nghiệp uy tín trong và ngoài nước về các sản phẩm hàng tiêu dùng nhanh thân thiện với môi trường có nguồn gốc từ Việt Nam.</p>
                        </div>
                        <div className="mt-5">
                            <p>
                                Chúng tôi cam kết thúc đẩy một lối sống xanh, sản phẩm của chúng tôi hướng đến việc 
                                hạn chế tối thiểu phát thải carbon vào môi trường, nhằm mang lại sức khỏe 
                                và sự an toàn cho con người và xã hội.
                            </p>
                        </div>
                    </div>
                    <div className="px-5 mt-5 flex items-center justify-center">
                        <img
                            src="https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/07/5_11zon-scaled.webp?fit=2560%2C514&ssl=1"
                            alt="banner-2"
                        />                      
                    </div>
                </div>

                <div className="lg:w-[70%] lg:mx-auto">
                    <div className="mx-5 flex items-center justify-center">
                        <h4 className="text-3xl lg:text-5xl text-center font-bold text-[rgb(51,102,51)]">
                            Từ hành động nhỏ đến một <span className="text-[#66cc00]">ước mơ to</span>
                        </h4>
                    </div>
                    <div className="px-5 mt-5">
                        <div>
                            <p>Tại <span className="font-bold text-[rgb(51,102,51)]">Green Life</span>, chúng tôi mong muốn đưa giá trị nông sản Việt Nam ra thế giới bằng các sản phẩm bảo vệ môi trường, giảm phác thải nhựa và <span className="text-[#336633]"><strong>"Vì một Việt Nam xanh!"</strong></span></p>
                        </div>
                    </div>
                    <div className="px-5 mt-5 flex items-center justify-center">
                        <img
                            src="https://i0.wp.com/green-life.com.vn/wp-content/uploads/2025/08/DSC00749_7_11zon-2-scaled.webp?fit=2560%2C1707&ssl=1"
                            alt="banner-3"
                        />                      
                    </div>
                </div>

                <div className="lg:w-[70%] lg:mx-auto bg-[#363] mx-5 flex flex-col items-center justify-center">
                    <div className="py-6 text-white text-3xl lg:text-5xl font-bold text-center">
                        Thông điệp của <br className="lg:hidden"></br><span className="text-[#ffcc00]">GREENLIFE</span>
                    </div>

                    <div className="px-5">
                        <p className="text-center text-white">
                            Tại <span className="text-[#ffcc00]">GREENLIFE</span>, chúng tôi cam kết mang đến những sản phẩm 
                            thân thiện với môi trường có nguồn gốc từ thiên nhiên và hạn chế tối đa sự can thiệp của con người nhằm 
                            cắt giảm tối đa phác thải carbon ra tự nhiên. Mỗi sản phẩm của <span className="text-[#ffcc00]">GREENLIFE </span> 
                            không chỉ an toàn cho sức khỏe mà còn góp phần bảo vệ Trái Đất cho các thế hệ tương lai. Hãy cùng chúng tôi lan tỏa lối sống xanh và bền vững!
                        </p>
                    </div>

                    <div className="py-5 px-5 grid grid-cols-2 lg:grid-cols-4 gap-10 place-items-center">
                        <div>
                            <img
                                src="https://green-life.com.vn/wp-content/uploads/2025/08/eco-product-16.svg"
                                alt="greenlife-message-1"
                                className="w-32 h-32"
                            />
                        </div>
                        <div>
                            <img
                                src="https://green-life.com.vn/wp-content/uploads/2025/08/bat-tay-18.svg"
                                alt="greenlife-message-2"
                                className="w-32 h-32"
                            />
                        </div>
                        <div>
                            <img
                                src="https://green-life.com.vn/wp-content/uploads/2025/08/gio-hang-17.svg"
                                alt="greenlife-message-3"
                                className="w-32 h-32"
                            />
                        </div>
                        <div>
                            <img
                                src="https://green-life.com.vn/wp-content/uploads/2025/08/la-cay-vong-tron-19.svg"
                                alt="greenlife-message-4"
                                className="w-32 h-32"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutPage