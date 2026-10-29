<?php

namespace LunarBlocks\Settings;

use LunarBlocks\Blocks\BlockRegistry;

class SettingsPage {

	private const SLUG   = 'lunar-blocks';
	private const HANDLE = 'lunar-blocks-admin';

	private BlockRegistry $blocks;

	private string $hook_suffix = '';

	public function __construct( BlockRegistry $blocks ) {
		$this->blocks = $blocks;
	}

	public function register(): void {
		add_action( 'admin_menu', array( $this, 'add_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
	}

	public function add_page(): void {
		$this->hook_suffix = (string) add_options_page(
			__( 'Lunar Blocks', 'lunar-blocks' ),
			__( 'Lunar Blocks', 'lunar-blocks' ),
			'manage_options',
			self::SLUG,
			array( $this, 'render' )
		);
	}

	public function render(): void {
		if ( ! is_readable( $this->asset_file() ) ) {
			printf(
				'<div class="notice notice-error"><p>%s</p></div>',
				esc_html__( 'The Lunar Blocks settings interface could not be loaded. Please reinstall the plugin.', 'lunar-blocks' )
			);
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<div id="lunar-blocks-settings"></div>
		</div>
		<?php
	}

	public function enqueue_assets( string $hook ): void {
		if ( $hook !== $this->hook_suffix || ! is_readable( $this->asset_file() ) ) {
			return;
		}

		$asset = include $this->asset_file();

		wp_enqueue_style(
			self::HANDLE,
			LUNAR_BLOCKS_URL . 'build/admin/style-index.css',
			array( 'wp-components' ),
			$asset['version']
		);
		wp_style_add_data( self::HANDLE, 'rtl', 'replace' );

		wp_enqueue_script(
			self::HANDLE,
			LUNAR_BLOCKS_URL . 'build/admin/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
		wp_set_script_translations( self::HANDLE, 'lunar-blocks', LUNAR_BLOCKS_DIR . 'languages' );

		$data = array(
			'option' => SettingsRegistry::OPTION,
			'blocks' => $this->blocks->get_blocks(),
		);

		wp_add_inline_script(
			self::HANDLE,
			'window.lunarBlocksSettings = ' . wp_json_encode( $data, JSON_HEX_TAG | JSON_HEX_AMP ) . ';',
			'before'
		);
	}

	private function asset_file(): string {
		return LUNAR_BLOCKS_DIR . 'build/admin/index.asset.php';
	}
}
