import { registerBlockType } from '@wordpress/blocks';

import accordionMetadata from './block.json';
import AccordionEdit from './edit';
import accordionSave from './save';

import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';

import './style.scss';
import './editor.scss';

registerBlockType( accordionMetadata.name, {
	icon: 'arrow-down-alt2',
	edit: AccordionEdit,
	save: accordionSave,
} );

registerBlockType( itemMetadata.name, {
	icon: 'arrow-down-alt2',
	edit: ItemEdit,
	save: itemSave,
} );
