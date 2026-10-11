import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import { InfoboxIcon } from './icons';
import save from './save';
import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';
import './style.scss';
import './editor.scss';

registerBlockType( metadata.name, {
	icon: <InfoboxIcon />,
	edit: Edit,
	save,
} );

registerBlockType( itemMetadata.name, {
	icon: <InfoboxIcon />,
	edit: ItemEdit,
	save: itemSave,
} );
