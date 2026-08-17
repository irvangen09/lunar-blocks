import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	registerFormatType,
	applyFormat,
	removeFormat,
} from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { Popover, MenuGroup, MenuItem } from '@wordpress/components';

import './style.scss';

const FORMAT_NAME = 'lunar-blocks/version-tag';

const VARIANTS = [
	{ value: 'added', label: __( 'Added', 'lunar-blocks' ) },
	{ value: 'changed', label: __( 'Changed', 'lunar-blocks' ) },
	{ value: 'removed', label: __( 'Removed', 'lunar-blocks' ) },
];

// `isActive` is supplied automatically by the Format API for every
// registered format's edit function — no need to compute it manually.
function VersionTagEdit( { value, onChange, isActive } ) {
	const [ isOpen, setIsOpen ] = useState( false );

	function applyVariant( variant ) {
		onChange(
			applyFormat( value, {
				type: FORMAT_NAME,
				attributes: { 'data-variant': variant },
			} )
		);
		setIsOpen( false );
	}

	function removeTag() {
		onChange( removeFormat( value, FORMAT_NAME ) );
		setIsOpen( false );
	}

	return (
		<>
			<RichTextToolbarButton
				icon="tag"
				title={ __( 'Version/Patch Tag', 'lunar-blocks' ) }
				onClick={ () => setIsOpen( ! isOpen ) }
				isActive={ isActive }
			/>
			{ isOpen && (
				<Popover
					onClose={ () => setIsOpen( false ) }
					placement="bottom-start"
				>
					<MenuGroup label={ __( 'Choose Type', 'lunar-blocks' ) }>
						{ VARIANTS.map( ( { value: variant, label } ) => (
							<MenuItem
								key={ variant }
								onClick={ () => applyVariant( variant ) }
							>
								{ label }
							</MenuItem>
						) ) }
						{ isActive && (
							<MenuItem onClick={ removeTag } isDestructive>
								{ __( 'Remove Tag', 'lunar-blocks' ) }
							</MenuItem>
						) }
					</MenuGroup>
				</Popover>
			) }
		</>
	);
}

registerFormatType( FORMAT_NAME, {
	title: __( 'Version/Patch Tag', 'lunar-blocks' ),
	tagName: 'span',
	className: 'lunar-version-tag',
	attributes: {
		variant: 'data-variant',
	},
	edit: VersionTagEdit,
} );
