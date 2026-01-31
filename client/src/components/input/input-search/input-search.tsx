type InputSearchProps = {
    searchInput: string,
    setSearchInput: (v: string) => void,
    opts?: {
        title?: string,
        // Default width 80 - 320px
        width?: string
    }
}

const InputSearch = (prop: InputSearchProps) => {
    return (

        <div>
            {prop.opts?.title && (
                <div className="text-sm text-gray-500">
                    <h1>{prop.opts.title}</h1>
                </div>
            )}
            <div className={`ring-1 rounded py-1 ps-2 ring-gray-300 flex items-center ${prop.opts?.width}`}>
                <div className="flex items-center flex-1">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
                    <input type="text" placeholder="Search ..." className="ps-2 w-full none-input text-sm py-1"
                        value={prop.searchInput} onChange={(event) => prop.setSearchInput(event.target.value)}
                    />
                </div>
                <div className={`${prop.searchInput === "" && "hidden"} pe-3`}>
                    <button className="text-gray-400"
                        onClick={() => prop.setSearchInput("")}
                    >x</button>
                </div>
            </div>
        </div>
    )
}

export default InputSearch;