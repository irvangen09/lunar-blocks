import { __ } from '@wordpress/i18n';
import ItemRowEdit from '../../shared/item-row-edit';

export default function Edit( props ) {
	return (
		<ItemRowEdit
			{ ...props }
			blockClass="lunar-infobox-item"
			iconHelp={ __(
				'Dashicons class name. Leave empty if this field does not need an icon.',
				'lunar-blocks'
			) }
		/>
	);
}
