import SvgIcon from '../shared/svg-icon';

const PATHS = [
	'M4 6h2',
	'M9 6h11',
	'M4 12h2',
	'M9 12h11',
	'M4 18h2',
	'M9 18h11',
];

export function TocIcon( { className } ) {
	return <SvgIcon className={ className } paths={ PATHS } />;
}
