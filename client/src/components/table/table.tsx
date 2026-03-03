import { useToastContext } from "../../contexts/toast-message/toast-message"

export type TableCol = {
    string?: {
        content: string,
        className?: string
    }
    reactNode?: React.ReactNode,
    clipboard?: string
} | string;

export type TableRow = TableCol[];
export type TableHeader = TableCol[] | string[];
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
                    <div key={idx} className="flex-1 min-w-0 truncate">
                        {typeof col === "string" ? (
                            <span>{col}</span>
                        ) : (
                            <div></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-sm">
                {prop.tableBody.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex px-2 py-2 border-s border-e border-b border-gray-300 min-w-0">
                        {row.map((col, colIdx) => (
                            <div key={colIdx} className="flex-1 min-w-0 truncate">
                                {typeof col === "string" ? (
                                    <span>{col}</span>
                                ) : col && typeof col === "object" ? (
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
                                                    <span className={col.string.className}>
                                                        {col.string.content}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className={col.string.className}>
                                                    {col.string.content}
                                                </span>
                                            )
                                        ) : col.reactNode ? (
                                            col.reactNode
                                        ) : (
                                            <span></span>
                                        )}
                                    </div>
                                ) : (
                                    <span></span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="h-1 bg-gray-50 border-b border-s border-e rounded-b-md border-gray-300"></div>
        </div>
    )
}

export default Table;