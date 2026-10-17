import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import {
	ToolbarGroup,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';

import { supportsAlignment } from './utils';

const COLUMN_TYPE_LABELS = {
	text: __( 'Text', 'moon-blocks' ),
	number: __( 'Number', 'moon-blocks' ),
	image: __( 'Image', 'moon-blocks' ),
};

const COLUMN_ALIGN_LABELS = {
	left: __( 'Align column left', 'moon-blocks' ),
	center: __( 'Align column center', 'moon-blocks' ),
	right: __( 'Align column right', 'moon-blocks' ),
};

export default function TableToolbar( {
	preset,
	focusedCell,
	rows,
	onInsertRowBefore,
	onInsertRowAfter,
	onDeleteRow,
	onToggleDivider,
	onInsertColumnBefore,
	onInsertColumnAfter,
	onDeleteColumn,
	onSetColumnType,
	onSetColumnAlign,
} ) {
	const hasFocusedRow =
		null !== focusedCell.rowIndex && -1 !== focusedCell.rowIndex;
	const hasFocusedColumn = null !== focusedCell.colIndex;
	const focusedRowIsDivider =
		hasFocusedRow && !! rows[ focusedCell.rowIndex ]?.isDivider;

	return (
		<BlockControls>
			<ToolbarGroup>
				<DropdownMenu
					text={ __( 'Row', 'moon-blocks' ) }
					label={ __( 'Row actions', 'moon-blocks' ) }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<MenuItem
									disabled={ ! hasFocusedRow }
									onClick={ () => {
										onInsertRowBefore();
										onClose();
									} }
								>
									{ __( 'Insert row before', 'moon-blocks' ) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedRow }
									onClick={ () => {
										onInsertRowAfter();
										onClose();
									} }
								>
									{ __( 'Insert row after', 'moon-blocks' ) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedRow }
									isDestructive
									onClick={ () => {
										onDeleteRow();
										onClose();
									} }
								>
									{ __( 'Delete this row', 'moon-blocks' ) }
								</MenuItem>
							</MenuGroup>
							<MenuGroup label={ __( 'Divider', 'moon-blocks' ) }>
								<MenuItem
									disabled={ ! hasFocusedRow }
									onClick={ () => {
										onToggleDivider();
										onClose();
									} }
								>
									{ focusedRowIsDivider
										? __(
												'Unset as divider',
												'moon-blocks'
											)
										: __(
												'Make this row a divider',
												'moon-blocks'
											) }
								</MenuItem>
							</MenuGroup>
						</>
					) }
				</DropdownMenu>

				<DropdownMenu
					text={ __( 'Column', 'moon-blocks' ) }
					label={ __( 'Column actions', 'moon-blocks' ) }
				>
					{ ( { onClose } ) => (
						<>
							<MenuGroup>
								<MenuItem
									disabled={ ! hasFocusedColumn }
									onClick={ () => {
										onInsertColumnBefore();
										onClose();
									} }
								>
									{ __(
										'Insert column before',
										'moon-blocks'
									) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedColumn }
									onClick={ () => {
										onInsertColumnAfter();
										onClose();
									} }
								>
									{ __(
										'Insert column after',
										'moon-blocks'
									) }
								</MenuItem>
								<MenuItem
									disabled={ ! hasFocusedColumn }
									isDestructive
									onClick={ () => {
										onDeleteColumn();
										onClose();
									} }
								>
									{ __(
										'Delete this column',
										'moon-blocks'
									) }
								</MenuItem>
							</MenuGroup>
							<MenuGroup
								label={ __(
									'Change column type',
									'moon-blocks'
								) }
							>
								{ Object.keys( COLUMN_TYPE_LABELS ).map(
									( type ) => (
										<MenuItem
											key={ type }
											disabled={ ! hasFocusedColumn }
											onClick={ () => {
												onSetColumnType( type );
												onClose();
											} }
										>
											{ COLUMN_TYPE_LABELS[ type ] }
										</MenuItem>
									)
								) }
							</MenuGroup>
							{ supportsAlignment( preset ) && (
								<MenuGroup
									label={ __(
										'Change column alignment',
										'moon-blocks'
									) }
								>
									{ Object.keys( COLUMN_ALIGN_LABELS ).map(
										( align ) => (
											<MenuItem
												key={ align }
												disabled={ ! hasFocusedColumn }
												onClick={ () => {
													onSetColumnAlign( align );
													onClose();
												} }
											>
												{ COLUMN_ALIGN_LABELS[ align ] }
											</MenuItem>
										)
									) }
									<MenuItem
										disabled={ ! hasFocusedColumn }
										onClick={ () => {
											onSetColumnAlign( undefined );
											onClose();
										} }
									>
										{ __(
											'Reset alignment',
											'moon-blocks'
										) }
									</MenuItem>
								</MenuGroup>
							) }
						</>
					) }
				</DropdownMenu>
			</ToolbarGroup>
		</BlockControls>
	);
}
