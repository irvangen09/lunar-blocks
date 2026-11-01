import { __ } from '@wordpress/i18n';

// Called at render time so translations are loaded.
export function getHeadingOptions() {
	return [
		{
			value: 'none',
			label: __( 'No heading (plain text)', 'lunar-blocks' ),
		},
		{ value: 'h2', label: 'H2' },
		{ value: 'h3', label: 'H3' },
		{ value: 'h4', label: 'H4' },
		{ value: 'h5', label: 'H5' },
		{ value: 'h6', label: 'H6' },
	];
}

// The tag a title is written in. With no heading level, the title uses the
export function getTitleTagName( headingLevel, plainTagName ) {
	return 'none' === headingLevel ? plainTagName : headingLevel;
}
