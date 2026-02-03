import { useToastContext } from "../../contexts/toast-message/toast-message"

export type TableCol = {
    string?: {
        content: string,
        className?: string
    }
    reactNode?: React.ReactNode,
    clipboard?: string
} | string;

/** Row in table body has many columns */
export type TableRow = TableCol[];

/** In table header has many columns */
export type TableHeader = TableCol[] | string[];
/** In table body has many rows */
export type TableBody = TableRow[];

export type TableProps = {
    tableHead: TableHeader,
    tableBody: TableBody
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
                {prop.tableHead.map((col, idx) => (
                    <div key={idx} className="flex-1">    
                        {typeof (col) === "string" ? (
                            <span>
                                {col}
                            </span>
                        ) : (
                            <div>
                                {/* Do later */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-sm">
                {prop.tableBody.map((row, idx) => (
                    <div key={idx} className="flex px-2 py-2 border-s border-e border-b border-gray-300">
                        {row.map((col, idx) => (
                            <div key={idx} className="flex-1">
                                {typeof (col) === "string" ? (
                                    <span>
                                        {col}
                                    </span>
                                ) : (
                                    <div>
                                        {col.string ? (
                                            col.clipboard ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleCopy(col.clipboard!)}
                                                        className="ring ring-gray-300 w-5 h-5 flex items-center justify-center rounded text-sm p-3 cursor-pointer hover:bg-gray-100"
                                                    >
                                                        <i className="fa-regular fa-clipboard"></i>
                                                    </button>
                                                    <span className={col.string.className}>{col.string.content}</span>
                                                </div>
                                            ) : (
                                                <span className={col.string.className}>{col.string.content}</span>
                                            )
                                        ) : col.reactNode ? (
                                                col.reactNode
                                        ) : (
                                            <></>
                                        )}
                                    </div>
                                )}
                            </div>
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