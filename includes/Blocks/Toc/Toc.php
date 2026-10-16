<?php

namespace MoonBlocks\Blocks\Toc;

use WP_Block_Type_Registry;

/**
 * Wires up the TOC block: ids on headings, and cache upkeep. Nothing is hooked
 * when the block is switched off in Settings.
 */
class Toc {

	public const BLOCK_NAME = 'moon-blocks/toc';

	/**
	 * Fewer headings than this and the TOC shows nothing.
	 */
	public const MIN_ENTRIES = 2;

	public function register(): void {
		// After BlockRegistry has registered the enabled blocks (init, priority 10).
		add_action( 'init', array( $this, 'boot' ), 20 );
	}

	public function boot(): void {
		if ( ! WP_Block_Type_Registry::get_instance()->is_registered( self::BLOCK_NAME ) ) {
			return;
		}

		$collector = new HeadingCollector();

		( new HeadingAnchorInjector( $collector ) )->register();

		add_action( 'save_post', array( $collector, 'clear' ) );
		add_action( 'deleted_post', array( $collector, 'clear' ) );
	}
}
