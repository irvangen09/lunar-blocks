const PATHS = [
	'M4 6h2',
	'M9 6h11',
	'M4 12h2',
	'M9 12h11',
	'M4 18h2',
	'M9 18h11',
];

export function TocIcon( { className } ) {
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
			{ PATHS.map( ( d ) => (
				<path key={ d } d={ d } />
			) ) }
		</svg>
	);
}
