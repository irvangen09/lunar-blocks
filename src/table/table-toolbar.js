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
	text: __( 'Text', 'lunar-blocks' ),
	number: __( 'Number', 'lunar-blocks' ),
	image: __( 'Image', 'lunar-blocks' ),
};

const COLUMN_ALIGN_LABELS = {
	left: __( 'Align column left', 'lunar-blocks' ),
	center: __( 'Align column center', 'lunar-blocks' ),
	right: __( 'Align column right', 'lunar-blocks' ),
};

// A menu entry that runs its action and then closes the menu.
function Action( { disabled, isDestructive, onAction, onClose, children } ) {
	return (
		<MenuItem
			disabled={ disabled }
			isDestructive={ isDestructive }
			onClick={ () => {
				onAction();
				onClose();
			} }
		>
			{ children }
		</MenuItem>
	);
}

function RowMenu( {
	focusedCell,
	rows,
	onInsertRowBefore,
	onInsertRowAfter,
	onDeleteRow,
	onToggleDivider,
} ) {
	const hasFocusedRow =
		null !== focusedCell.rowIndex && -1 !== focusedCell.rowIndex;
	const focusedRowIsDivider =
		hasFocusedRow && !! rows[ focusedCell.rowIndex ]?.isDivider;

	return (
		<DropdownMenu
			text={ __( 'Row', 'lunar-blocks' ) }
			label={ __( 'Row actions', 'lunar-blocks' ) }
		>
			{ ( { onClose } ) => (
				<>
					<MenuGroup>
						<Action
							disabled={ ! hasFocusedRow }
							onAction={ onInsertRowBefore }
							onClose={ onClose }
						>
							{ __( 'Insert row before', 'lunar-blocks' ) }
						</Action>
						<Action
							disabled={ ! hasFocusedRow }
							onAction={ onInsertRowAfter }
							onClose={ onClose }
						>
							{ __( 'Insert row after', 'lunar-blocks' ) }
						</Action>
						<Action
							disabled={ ! hasFocusedRow }
							isDestructive
							onAction={ onDeleteRow }
							onClose={ onClose }
						>
							{ __( 'Delete this row', 'lunar-blocks' ) }
						</Action>
					</MenuGroup>
					<MenuGroup label={ __( 'Divider', 'lunar-blocks' ) }>
						<Action
							disabled={ ! hasFocusedRow }
							onAction={ onToggleDivider }
							onClose={ onClose }
						>
							{ focusedRowIsDivider
								? __( 'Unset as divider', 'lunar-blocks' )
								: __(
										'Make this row a divider',
										'lunar-blocks'
									) }
						</Action>
					</MenuGroup>
				</>
			) }
		</DropdownMenu>
	);
}

function ColumnMenu( {
	preset,
	focusedCell,
	onInsertColumnBefore,
	onInsertColumnAfter,
	onDeleteColumn,
	onSetColumnType,
	onSetColumnAlign,
} ) {
	const disabled = null === focusedCell.colIndex;

	return (
		<DropdownMenu
			text={ __( 'Column', 'lunar-blocks' ) }
			label={ __( 'Column actions', 'lunar-blocks' ) }
		>
			{ ( { onClose } ) => (
				<>
					<MenuGroup>
						<Action
							disabled={ disabled }
							onAction={ onInsertColumnBefore }
							onClose={ onClose }
						>
							{ __( 'Insert column before', 'lunar-blocks' ) }
						</Action>
						<Action
							disabled={ disabled }
							onAction={ onInsertColumnAfter }
							onClose={ onClose }
						>
							{ __( 'Insert column after', 'lunar-blocks' ) }
						</Action>
						<Action
							disabled={ disabled }
							isDestructive
							onAction={ onDeleteColumn }
							onClose={ onClose }
						>
							{ __( 'Delete this column', 'lunar-blocks' ) }
						</Action>
					</MenuGroup>
					<MenuGroup
						label={ __( 'Change column type', 'lunar-blocks' ) }
					>
						{ Object.keys( COLUMN_TYPE_LABELS ).map( ( type ) => (
							<Action
								key={ type }
								disabled={ disabled }
								onAction={ () => onSetColumnType( type ) }
								onClose={ onClose }
							>
								{ COLUMN_TYPE_LABELS[ type ] }
							</Action>
						) ) }
					</MenuGroup>
					{ supportsAlignment( preset ) && (
						<MenuGroup
							label={ __(
								'Change column alignment',
								'lunar-blocks'
							) }
						>
							{ Object.keys( COLUMN_ALIGN_LABELS ).map(
								( align ) => (
									<Action
										key={ align }
										disabled={ disabled }
										onAction={ () =>
											onSetColumnAlign( align )
										}
										onClose={ onClose }
									>
										{ COLUMN_ALIGN_LABELS[ align ] }
									</Action>
								)
							) }
							<Action
								disabled={ disabled }
								onAction={ () => onSetColumnAlign( undefined ) }
								onClose={ onClose }
							>
								{ __( 'Reset alignment', 'lunar-blocks' ) }
							</Action>
						</MenuGroup>
					) }
				</>
			) }
		</DropdownMenu>
	);
}

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
	return (
		<BlockControls>
			<ToolbarGroup>
				<RowMenu
					focusedCell={ focusedCell }
					rows={ rows }
					onInsertRowBefore={ onInsertRowBefore }
					onInsertRowAfter={ onInsertRowAfter }
					onDeleteRow={ onDeleteRow }
					onToggleDivider={ onToggleDivider }
				/>
				<ColumnMenu
					preset={ preset }
					focusedCell={ focusedCell }
					onInsertColumnBefore={ onInsertColumnBefore }
					onInsertColumnAfter={ onInsertColumnAfter }
					onDeleteColumn={ onDeleteColumn }
					onSetColumnType={ onSetColumnType }
					onSetColumnAlign={ onSetColumnAlign }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}
