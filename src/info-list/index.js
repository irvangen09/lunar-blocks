import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import { InfoListIcon } from './icons';
import save from './save';
import itemMetadata from './item/block.json';
import ItemEdit from './item/edit';
import itemSave from './item/save';
import requirementsMetadata from './requirements/block.json';
import RequirementsEdit from './requirements/edit';
import requirementsSave from './requirements/save';
import requirementMetadata from './requirements/requirement/block.json';
import RequirementEdit from './requirements/requirement/edit';
import requirementSave from './requirements/requirement/save';
import './style.scss';
import './editor.scss';

registerBlockType( metadata.name, {
	icon: <InfoListIcon />,
	edit: Edit,
	save,
} );

registerBlockType( itemMetadata.name, {
	icon: <InfoListIcon />,
	edit: ItemEdit,
	save: itemSave,
} );

registerBlockType( requirementsMetadata.name, {
	icon: <InfoListIcon />,
	edit: RequirementsEdit,
	save: requirementsSave,
} );

registerBlockType( requirementMetadata.name, {
	icon: <InfoListIcon />,
	edit: RequirementEdit,
	save: requirementSave,
} );
