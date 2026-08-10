import { registerBlockType } from '@wordpress/blocks';

import galleryMetadata from './block.json';
import GalleryEdit from './edit';
import gallerySave from './save';

import itemMetadata from './gallery-item/block.json';
import ItemEdit from './gallery-item/edit';
import itemSave from './gallery-item/save';

import './style.scss';
import './editor.scss';

registerBlockType( galleryMetadata.name, {
	icon: 'format-gallery',
	edit: GalleryEdit,
	save: gallerySave,
} );

registerBlockType( itemMetadata.name, {
	icon: 'format-image',
	edit: ItemEdit,
	save: itemSave,
} );