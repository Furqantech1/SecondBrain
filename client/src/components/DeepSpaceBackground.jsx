const DeepSpaceBackground = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: '#06060b' }}>
            {/* Grid overlay — matching landing page */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
                    backgroundSize: '70px 70px',
                }}
            />

            {/* Glow Orb — Top-left cyan */}
            <div
                className="absolute rounded-full blur-[120px]"
                style={{
                    top: '-150px',
                    left: '15%',
                    width: 550,
                    height: 550,
                    background: 'radial-gradient(circle, rgba(0,224,255,0.12) 0%, transparent 70%)',
                }}
            />

            {/* Glow Orb — Right purple */}
            <div
                className="absolute rounded-full blur-[120px]"
                style={{
                    top: '300px',
                    right: '-80px',
                    width: 450,
                    height: 450,
                    background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)',
                }}
            />

            {/* Glow Orb — Bottom-left */}
            <div
                className="absolute rounded-full blur-[120px]"
                style={{
                    bottom: '100px',
                    left: '-40px',
                    width: 350,
                    height: 350,
                    background: 'radial-gradient(circle, rgba(0,224,255,0.08) 0%, transparent 70%)',
                }}
            />
        </div>
    );
};

export default DeepSpaceBackground;
