interface HuggingFaceIconProps {
    size?: number;
    className?: string;
}

/**
 * Monochrome Hugging Face mark. Draws with `currentColor` so it inherits text
 * color and tints on hover exactly like the lucide-react icons it sits beside.
 */
const HuggingFaceIcon = ({ size = 24, className }: HuggingFaceIconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        {/* head */}
        <circle cx="12" cy="11" r="7.5" />
        {/* eyes */}
        <circle cx="9" cy="10" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="15" cy="10" r="0.6" fill="currentColor" stroke="none" />
        {/* smile */}
        <path d="M8.5 13.2c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2" />
        {/* hands */}
        <path d="M4.6 12.4c-1.3.2-2.1 1-2.1 1.9 0 .6.6 1 1.2.8l2.2-.8" />
        <path d="M19.4 12.4c1.3.2 2.1 1 2.1 1.9 0 .6-.6 1-1.2.8l-2.2-.8" />
    </svg>
);

export default HuggingFaceIcon;
