// Outline icon shared by every block. The editor stylesheet fills SVGs with
// currentColor, so the fill is reset inline.
export default function SvgIcon( { className, paths } ) {
	return (
		<svg
			className={ className }
			viewBox="0 0 24 24"
			fill="none"
			style={ { fill: 'none' } }
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			{ paths.map( ( d ) => (
				<path key={ d } d={ d } />
			) ) }
		</svg>
	);
}
