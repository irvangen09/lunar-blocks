const PATHS = [
	'M4 5h16v14H4z',
	'M10 5v14',
	'M7 12h.01',
	'M13 10h4',
	'M13 14h4',
];

export function InfoboxIcon( { className } ) {
	return (
		<svg
			className={ className }
			viewBox="0 0 24 24"
			fill="none"
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
