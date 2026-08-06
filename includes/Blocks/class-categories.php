<?php
/**
 * Registers the "Lunar Blocks" category in the block inserter so every
 * block shipped by this plugin (Callout, Infobox, Accordion, etc.) is
 * grouped together instead of mixing into the default WordPress categories.
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Categories
 */
class Categories {

	/**
	 * Block category slug, referenced by "category" in every block.json.
	 *
	 * @var string
	 */
	private const SLUG = 'lunar-blocks';

	/**
	 * Registers WordPress hooks.
	 */
	public function init(): void {
		add_filter( 'block_categories_all', array( $this, 'register_category' ) );
	}

	/**
	 * Prepends the Lunar Blocks category to the existing list.
	 *
	 * @param array $categories Existing block categories.
	 * @return array Categories including Lunar Blocks.
	 */
	public function register_category( array $categories ): array {
		return array_merge(
			array(
				array(
					'slug'  => self::SLUG,
					'title' => __( 'Lunar Blocks', 'lunar-blocks' ),
					'icon'  => null,
				),
			),
			$categories
		);
	}
}