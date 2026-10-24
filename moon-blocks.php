<?php
/**
 * Plugin Name:       Moon Blocks
 * Plugin URI:        https://github.com/irvangen09/moon-blocks
 * Description:       Lightweight Gutenberg blocks for documentation, wiki, and knowledge base websites.
 * Version:           1.0.0
 * Requires at least: 6.9
 * Requires PHP:      8.0
 * Author:            Irvan Noerfazri
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       moon-blocks
 * Domain Path:       /languages
 */

defined( 'ABSPATH' ) || exit;

// A pre-release such as 6.9-RC1 sorts below 6.9, so only the release part is compared.
$moon_blocks_wp_version = (string) strtok( get_bloginfo( 'version' ), '-' );

// Checked before any class is loaded: the classes use syntax that older PHP cannot parse.
if ( version_compare( PHP_VERSION, '8.0', '<' ) || version_compare( $moon_blocks_wp_version, '6.9', '<' ) ) {
	add_action(
		'admin_notices',
		function () {
			if ( current_user_can( 'activate_plugins' ) ) {
				printf(
					'<div class="notice notice-error"><p>%s</p></div>',
					esc_html__( 'Moon Blocks requires PHP 8.0 or later and WordPress 6.9 or later.', 'moon-blocks' )
				);
			}
		}
	);
	return;
}

define( 'MOON_BLOCKS_VERSION', '1.0.0' );
define( 'MOON_BLOCKS_DIR', plugin_dir_path( __FILE__ ) );
define( 'MOON_BLOCKS_URL', plugin_dir_url( __FILE__ ) );

require_once MOON_BLOCKS_DIR . 'includes/Core/Autoloader.php';

( new \MoonBlocks\Core\Autoloader( 'MoonBlocks\\', MOON_BLOCKS_DIR . 'includes/' ) )->register();

add_action(
	'plugins_loaded',
	function () {
		( new \MoonBlocks\Core\Plugin() )->run();
	}
);
