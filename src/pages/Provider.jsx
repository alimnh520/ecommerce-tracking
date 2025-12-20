export default function Provider({children}) {
    return (
        <div
            className={`flex min-h-screen w-full items-center justify-center font-sans`}
        >
            {children}
        </div>
    )
}