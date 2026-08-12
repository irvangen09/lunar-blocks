import { registerBlockType } from '@wordpress/blocks';
import boxMetadata from './block.json';
import BoxEdit from './edit';
import boxSave from './save';
import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';
import './style.scss';
import './editor.scss';

registerBlockType( boxMetadata.name, {
	icon: 'id-alt',
	edit: BoxEdit,
	save: boxSave,
} );

registerBlockType( itemMetadata.name, {
	icon: 'id-alt',
	edit: ItemEdit,
	save: itemSave,
} );