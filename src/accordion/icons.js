import SvgIcon from '../shared/svg-icon';

const PATHS = [
	'M4 6h9',
	'M16.5 5l2 2 2-2',
	'M4 12h9',
	'M16.5 11l2 2 2-2',
	'M4 18h9',
	'M16.5 17l2 2 2-2',
];

export function AccordionIcon( { className } ) {
	return <SvgIcon className={ className } paths={ PATHS } />;
}
