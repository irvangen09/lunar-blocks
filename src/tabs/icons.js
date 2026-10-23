import SvgIcon from '../shared/svg-icon';

const PATHS = [ 'M4 19V9h16v10z', 'M4 9V6h6v3', 'M13 9V7h4v2' ];

export function TabsIcon( { className } ) {
	return <SvgIcon className={ className } paths={ PATHS } />;
}
