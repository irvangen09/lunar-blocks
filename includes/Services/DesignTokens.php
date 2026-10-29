<?php

namespace LunarBlocks\Services;

use LunarBlocks\Settings\SettingsRegistry;

class DesignTokens {

	private const HANDLE = 'lunar-blocks-tokens';

	private SettingsRegistry $settings;

	public function __construct( SettingsRegistry $settings ) {
		$this->settings = $settings;
	}

	public function register(): void {
		add_action( 'init', array( $this, 'register_style' ) );
	}

	// Block stylesheets depend on this handle, so it is registered but never enqueued here.
	public function register_style(): void {
		wp_register_style( self::HANDLE, LUNAR_BLOCKS_URL . 'assets/css/tokens.css', array(), LUNAR_BLOCKS_VERSION );

		// The file is small, so WordPress prints it inline instead of as a separate request.
		wp_style_add_data( self::HANDLE, 'path', LUNAR_BLOCKS_DIR . 'assets/css/tokens.css' );

		$css = $this->build_override_css();

		if ( '' !== $css ) {
			wp_add_inline_style( self::HANDLE, $css );
		}
	}

	private function build_override_css(): string {
		$declarations = '';

		foreach ( $this->settings->get_color_overrides() as $name => $value ) {
			// The D modifier stops "$" from matching before a trailing newline.
			if ( 1 === preg_match( '/^[a-z-]+$/D', $name ) && 1 === preg_match( '/^#(?:[0-9a-fA-F]{3}){1,2}$/D', $value ) ) {
				$declarations .= '--lunar-color-' . $name . ':' . $value . ';';
			}
		}

		return '' === $declarations ? '' : ':root{' . $declarations . '}';
	}
}
