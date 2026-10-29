import { __ } from '@wordpress/i18n';
import { Button, TextControl } from '@wordpress/components';

export default function NewTableForm( {
	columnCount,
	rowCount,
	onColumnCount,
	onRowCount,
	onCreate,
} ) {
	return (
		<div className="lunar-table-editor__empty">
			<p>{ __( 'Create a new table.', 'lunar-blocks' ) }</p>
			<div className="lunar-table-editor__empty-fields">
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Number of columns', 'lunar-blocks' ) }
					type="number"
					min="1"
					value={ columnCount }
					onChange={ onColumnCount }
				/>
				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Number of rows', 'lunar-blocks' ) }
					type="number"
					min="1"
					value={ rowCount }
					onChange={ onRowCount }
				/>
			</div>
			<Button
				__next40pxDefaultSize
				variant="primary"
				onClick={ onCreate }
			>
				{ __( 'Create Table', 'lunar-blocks' ) }
			</Button>
		</div>
	);
}
