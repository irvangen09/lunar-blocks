const PATHS = [
	'M4 4h16',
	'M4 9h4',
	'M11 9h9',
	'M4 14h4',
	'M11 14h9',
	'M4 19.5l1.5 1.5L8 18',
	'M11 19.5h9',
];

export function InfoListIcon( { className } ) {
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
