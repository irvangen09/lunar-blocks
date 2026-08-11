import { registerBlockType } from '@wordpress/blocks';

import timelineMetadata from './block.json';
import TimelineEdit from './edit';
import timelineSave from './save';

import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';

import './style.scss';
import './editor.scss';

registerBlockType( timelineMetadata.name, {
	icon: 'clock',
	edit: TimelineEdit,
	save: timelineSave,
} );

registerBlockType( itemMetadata.name, {
	icon: 'clock',
	edit: ItemEdit,
	save: itemSave,
} );