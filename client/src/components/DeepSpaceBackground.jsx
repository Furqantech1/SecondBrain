const DeepSpaceBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#05050A]">
            {/* Main Blue Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-600/20 rounded-full blur-[120px] opacity-40 animate-pulse duration-[10s]"></div>

            {/* Secondary Purple/Pink Glow */}
            <div className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[100px] opacity-30 animate-pulse delay-1000 duration-[15s]"></div>

            {/* Accent Red/Orange Glow (Bottom) */}
            <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-orange-500/10 rounded-full blur-[100px] opacity-30"></div>

            {/* Grid Overlay for texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
    );
};

export default DeepSpaceBackground;
