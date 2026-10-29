import { wrapCellValues } from './frontend/cell-value';
import { createElement } from './frontend/dom';
import { initChecklist } from './frontend/checklist';
import { initFilter } from './frontend/filter';
import { initScrollRegion } from './frontend/scroll-region';
import { initSort } from './frontend/sort';

const BLOCK = '.lunar-table';

// Without this file the table still renders fully and stays readable;
// it only adds sort, search and the recipe checklist.

function initBlock( blockEl ) {
	const tableEl = blockEl.querySelector(
		'.lunar-table__table, .lunar-table__cards, .lunar-table__recipes'
	);

	if ( ! tableEl ) {
		return;
	}

	const controlsEl = createElement( 'div', 'lunar-table__controls' );
	const isTable = tableEl.classList.contains( 'lunar-table__table' );

	if ( isTable && 'preset-1' === blockEl.dataset.preset ) {
		wrapCellValues( tableEl );
	}

	if ( 'true' === blockEl.dataset.sort ) {
		initSort( blockEl, tableEl, controlsEl );
	}

	if ( 'true' === blockEl.dataset.filter ) {
		initFilter( tableEl, controlsEl );
	}

	if ( controlsEl.hasChildNodes() ) {
		blockEl.insertBefore( controlsEl, tableEl );
	}

	if ( tableEl.classList.contains( 'lunar-table__recipes' ) ) {
		initChecklist( tableEl );
	}

	initScrollRegion( blockEl );
}

function init() {
	document.querySelectorAll( BLOCK ).forEach( initBlock );
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
