import { useToastContext } from "../../contexts/toast-message/toast-message"

type TableCol = {
    string?: {
        content: string,
        className?: string
    }

    reactNode?: {
        content: React.ReactNode,
        isClipboard?: {
            contentCoppy: string
        }
    },

    icon?: {
        position: "start" | "end",
        icon?: React.ReactNode,
        content?: string
    }
}

type TableRow = TableCol[];

type TableHeader = string[] | TableCol[];
type TableBody = TableRow[];

type TableProps = {
    tableHead: TableHeader,
    tableBody: TableBody[]
}

const Table = (prop: TableProps) => {
    const { showToast } = useToastContext();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast("Success", "Sao chép UID thành công !");
    }

    return (
        <div className="rounded">
            <div className="flex px-2 py-1 text-sm font-semibold bg-gray-50 border border-gray-300 rounded-t-md">
                {prop.tableHead.map((col, index) => (
                    <div key={index} className="flex-1">
                        {typeof (col) === "string" ? (
                            <span>
                                {col}
                            </span>
                        ) : (
                            col.string ? (
                                <span className={col.string.className}>{col.string.content}</span>
                            ) :
                                col.reactNode ? (
                                    col.reactNode.isClipboard && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleCopy(col.reactNode?.isClipboard?.contentCoppy!)}
                                                className="ring ring-gray-300 w-5 h-5 flex items-center justify-center rounded text-sm p-3 cursor-pointer hover:bg-gray-100"
                                            >
                                                <i className="fa-regular fa-clipboard"></i>
                                            </button>
                                            <span>{col.reactNode.content}</span>
                                        </div>
                                    )
                                ) :
                                    col.icon ? (
                                        <div>
                                            {col.icon?.position === "start" && (
                                                col.icon.icon
                                            )}

                                            {col.icon?.content && (
                                                <span>
                                                    {col.icon?.content}
                                                </span>
                                            )}

                                            {col.icon?.position === "end" && (
                                                col.icon.icon
                                            )}
                                        </div>
                                    ) : (
                                        <div>Non content</div>
                                    )
                        )}
                    </div>
                ))}
            </div>

            <div className="text-sm">
                {prop.tableBody.map((row, idx) => (
                    <div key={idx} className="flex px-2 py-2 border-s border-e border-b border-gray-300">
                        {row.map((col, idx) => (
                            <div key={idx} className="flex-1">Heheh</div>
                        ))}
                    </div>
                ))}

                {/* <div className="flex px-2 py-2 border-s border-e border-b border-gray-300 ovwr">
                    <div className="flex flex-1 gap-2">
                        <button
                            onClick={() => handleCopy("64b8f2c9e4a1b23d4f9a7c12")}
                            className="ring ring-gray-300 w-5 h-5 flex items-center justify-center rounded text-sm p-3 cursor-pointer hover:bg-gray-100"
                        >
                            <i className="fa-regular fa-clipboard"></i>
                        </button>
                        <span>64b8f2c9e4a1b23d4f9a7c12</span>
                    </div>
                    <div className="flex-1">nguyennamduong205@gmail.com</div>
                    <div className="flex-1">Admin</div>
                    <div className="flex-1">Hoạt động</div>
                    <div className="flex-1">20/01/2026</div>
                    <div className="flex-1">Actions</div>
                </div> */}
            </div>

            <div className="h-1 bg-gray-50 border-b border-s border-e rounded-b-md border-gray-300"></div>
        </div>
    )
}

export default Table;