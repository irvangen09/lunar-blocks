import { registerBlockType } from '@wordpress/blocks';

import stepsMetadata from './block.json';
import StepsEdit from './edit';
import stepsSave from './save';

import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';

import './style.scss';
import './editor.scss';

registerBlockType( stepsMetadata.name, {
	...stepsMetadata,
	icon: 'editor-ol',
	edit: StepsEdit,
	save: stepsSave,
} );

registerBlockType( itemMetadata.name, {
	...itemMetadata,
	icon: 'editor-ol',
	edit: ItemEdit,
	save: itemSave,
} );