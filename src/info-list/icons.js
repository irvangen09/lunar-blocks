import SvgIcon from '../shared/svg-icon';

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
	return <SvgIcon className={ className } paths={ PATHS } />;
}
