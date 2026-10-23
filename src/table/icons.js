import SvgIcon from '../shared/svg-icon';

const PATHS = [
	'M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
	'M3 10h18',
	'M3 15h18',
	'M10 10v10',
];

export function TableIcon( { className } ) {
	return <SvgIcon className={ className } paths={ PATHS } />;
}
