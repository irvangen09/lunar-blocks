<?php
/**
 * Plugin Name:       Lunar Blocks
 * Plugin URI:        https://github.com/irvangen09/lunar-blocks
 * Description:       Standalone Gutenberg block collection for documentation-style content. Works on any WordPress site, with optional enhancements when Lunar Wiki is active.
 * Version:           1.4.0
 * Requires at least: 6.5
 * Requires PHP:      8.0
 * Author:            Irvan Noerfazri
 * Author URI:        https://github.com/irvangen09
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       lunar-blocks
 *
 * @package Lunar\Blocks
 */

namespace Lunar\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'LUNAR_BLOCKS_VERSION', '1.4.0' );
define( 'LUNAR_BLOCKS_PLUGIN_FILE', __FILE__ );
define( 'LUNAR_BLOCKS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LUNAR_BLOCKS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Bails out gracefully on unsupported PHP versions instead of fataling.
 *
 * @return bool True if the environment is supported.
 */
function environment_is_supported(): bool {
	if ( version_compare( PHP_VERSION, '8.0', '<' ) ) {
		add_action(
			'admin_notices',
			function () {
				printf(
					'<div class="notice notice-error"><p>%s</p></div>',
					esc_html__( 'Lunar Blocks requires PHP 8.0 or higher and could not be loaded.', 'lunar-blocks' )
				);
			}
		);
		return false;
	}
	return true;
}

if ( ! environment_is_supported() ) {
	return;
}

/**
 * Root-level autoloader for the Lunar\ namespace tree.
 *
 * No Composer dependency for a codebase this size.
 * Maps Lunar\Segment\Class_Name to includes/Segment/class-class-name.php,
 * following WordPress file naming conventions.
 *
 * @param string $class_name Fully qualified class name.
 */
function autoload( string $class_name ): void {
	if ( ! str_starts_with( $class_name, 'Lunar\\' ) ) {
		return;
	}

	$relative  = substr( $class_name, strlen( 'Lunar\\' ) );
	$parts     = explode( '\\', $relative );
	$file_name = 'class-' . strtolower( str_replace( '_', '-', array_pop( $parts ) ) ) . '.php';
	$path      = LUNAR_BLOCKS_PLUGIN_DIR . 'includes/' . implode( '/', $parts ) . '/' . $file_name;

	if ( file_exists( $path ) ) {
		require_once $path;
	}
}
spl_autoload_register( __NAMESPACE__ . '\\autoload' );

/**
 * Boots all Lunar Blocks components, in dependency order: the block
 * category must exist before blocks register into it, and the block
 * registry must exist before Settings can read/write its state.
 */
function bootstrap(): void {
	$categories = new Categories();
	$categories->init();

	$registry = new Registry( LUNAR_BLOCKS_PLUGIN_DIR . 'build' );
	$registry->init();

	$settings = new Settings( $registry );
	$settings->init();

	$formats = new Formats( LUNAR_BLOCKS_PLUGIN_DIR . 'build', LUNAR_BLOCKS_PLUGIN_URL . 'build' );
	$formats->init();

	$heading_injector = new Heading_Injector();
	$heading_injector->init();

	$infobox_sync = new Infobox_Sync();
	$infobox_sync->init();
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\\bootstrap' );
