interface ButtonFormInterface {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => Promise<void>;
    inLoading?: {
        isLoading: boolean,
        textLoading?: string
    }
}

const ButtonForm = ({ children, className, onClick, inLoading }: ButtonFormInterface) => {
    return (
        <button
            className={`${className} flex justify-center items-center`}
            onClick={onClick}
        >
            {/* Loading element */}
            {inLoading?.isLoading ? (
                <div className="flex gap-1 items-center">
                    <div className="animate-loading flex justify-center items-center">
                        <i className="fa-solid fa-spinner"></i>
                    </div>
                    {inLoading && (
                        <span>{inLoading.textLoading}</span>
                    )}
                </div>
            ) : (
                children
            )}
        </button>
    )
}

export default ButtonForm;