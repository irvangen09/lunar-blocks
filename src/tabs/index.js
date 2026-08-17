import { registerBlockType } from '@wordpress/blocks';

import tabsMetadata from './block.json';
import TabsEdit from './edit';
import tabsSave from './save';

import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';

import './style.scss';
import './editor.scss';

registerBlockType( tabsMetadata.name, {
	icon: 'grid-view',
	edit: TabsEdit,
	save: tabsSave,
} );

registerBlockType( itemMetadata.name, {
	icon: 'grid-view',
	edit: ItemEdit,
	save: itemSave,
} );
