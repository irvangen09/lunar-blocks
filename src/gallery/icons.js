const GALLERY_PATHS = [
	'M4 4h6v6H4z',
	'M14 4h6v6h-6z',
	'M4 14h6v6H4z',
	'M14 14h6v6h-6z',
];

const ITEM_PATHS = [ 'M4 5h16v14H4z', 'M4 16l5-5 4 4 2-2 5 5', 'M15.5 9h.01' ];

const CLOSE_PATHS = [ 'M6 6l12 12', 'M18 6L6 18' ];

function Icon( { className, paths } ) {
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

export function GalleryIcon( { className } ) {
	return <Icon className={ className } paths={ GALLERY_PATHS } />;
}

export function GalleryItemIcon( { className } ) {
	return <Icon className={ className } paths={ ITEM_PATHS } />;
}

export function CloseIcon( { className } ) {
	return <Icon className={ className } paths={ CLOSE_PATHS } />;
}
