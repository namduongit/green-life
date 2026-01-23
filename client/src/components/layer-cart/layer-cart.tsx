const LayerCart = () => {
    const pathname = window.location.pathname;
    const pathUrl = pathname.split("/") as string[];

    return (
        <div className="bg-black text-white flex flex-col items-center py-8 lg:py-12 gap-3">
            <span className="flex gap-2 text-xl lg:text-3xl font-semibold">
                <p className={`${pathUrl[pathUrl.length - 1] === "cart" && "border-b-2"}`}>GIỎ HÀNG</p>
                <p>-</p>
                <p className={`${pathUrl[pathUrl.length - 1] === "payment" && "border-b-2"}`}>THANH TOÁN</p>
                <p>-</p>
                <p className={`${pathUrl[pathUrl.length - 1] === "other._." && "border-b-2"}`}>HOÀN THÀNH</p>
            </span>
        </div>
    )
}

export default LayerCart;