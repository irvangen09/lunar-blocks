import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import deprecated from './deprecated';
import Edit from './edit';
import { TableIcon } from './icons';
import save from './save';
import './style.scss';
import './editor.scss';

registerBlockType( metadata.name, {
	icon: <TableIcon />,
	edit: Edit,
	save,
	deprecated,
} );
