import SvgIcon from '../shared/svg-icon';

const PATHS = [
	'M4 5h16v14H4z',
	'M10 5v14',
	'M7 12h.01',
	'M13 10h4',
	'M13 14h4',
];

export function InfoboxIcon( { className } ) {
	return <SvgIcon className={ className } paths={ PATHS } />;
}
