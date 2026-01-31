type StatsProps = {
    icon: React.ReactNode,
    title: string,
    des: string,
    iconBg?: string,
    iconColor?: string
}

const Stats = ({ icon, title, des, iconBg = "bg-gradient-to-br from-blue-100 to-blue-200", iconColor = "text-blue-600" }: StatsProps) => {
    return (
        <div className="flex items-center gap-4 bg-white border border-gray-300 px-4 py-4 rounded-lg">
            <div className={`${iconBg} w-12 h-12 rounded-full flex justify-center items-center ${iconColor} shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {des}
                </p>
            </div>
        </div>
    )
}

export default Stats;