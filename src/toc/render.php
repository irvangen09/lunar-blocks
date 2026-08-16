<?php
/**
 * Render template for the dynamic TOC block. $attributes, $content,
 * and $block are supplied automatically by WordPress via the "render"
 * field in block.json.
 *
 * @package Lunar\Blocks
 */

use Lunar\Blocks\TOC_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:disable WordPress.WP.GlobalVariablesOverride.Prohibited, WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
// This file is included inside WP_Block::render(), a method's local
// scope — not the literal global scope these two sniffs guard against
// for traditional theme template files, which WordPress executes at
// true global scope. The variables below never collide with anything
// outside this include.
$post_id = get_the_ID();

if ( ! $post_id ) {
	return '';
}

$builder  = new TOC_Builder();
$headings = $builder->get_headings( $post_id );

// Fail gracefully — no headings found, don't render an empty box.
if ( empty( $headings ) ) {
	return '';
}

$tree      = $builder->build_tree( $headings );
$list_html = $builder->render_tree( $tree );

$title = ! empty( $attributes['title'] ) ? $attributes['title'] : __( 'Table of Contents', 'lunar-blocks' );

$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => 'lunar-toc' ) );
// phpcs:enable
?>
<details <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput -- already escaped by get_block_wrapper_attributes(). ?>>
	<summary class="lunar-toc__summary">
		<span class="lunar-toc__icon" aria-hidden="true">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<line x1="4" y1="6" x2="20" y2="6"></line>
				<line x1="4" y1="12" x2="20" y2="12"></line>
				<line x1="4" y1="18" x2="14" y2="18"></line>
			</svg>
		</span>
		<span class="lunar-toc__title"><?php echo esc_html( $title ); ?></span>
	</summary>
	<nav class="lunar-toc__nav" aria-label="<?php echo esc_attr( $title ); ?>">
		<?php echo $list_html; // phpcs:ignore WordPress.Security.EscapeOutput -- already escaped per element in render_tree(). ?>
	</nav>
</details>