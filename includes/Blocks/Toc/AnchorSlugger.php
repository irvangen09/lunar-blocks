<?php

namespace MoonBlocks\Blocks\Toc;

/**
 * Turns heading text into unique, wiki-style ids ("Panduan_Story_of_Seasons").
 *
 * Case is kept, apostrophes are dropped and every other run of characters that
 * is not a letter, mark or number becomes one underscore. sanitize_title() is
 * not used on purpose: it percent-encodes non-Latin letters, and the Accordion
 * and Tabs scripts look the hash up with decodeURIComponent() + getElementById().
 */
class AnchorSlugger {

	private const FALLBACK = 'Section';

	/**
	 * Ids already taken, lower-cased, so "Tips" and "tips" never collide.
	 *
	 * @var array<string, true>
	 */
	private array $used = array();

	/**
	 * Marks an id as taken, so generated ids do not collide with it. Used for
	 * anchors that authors typed by hand.
	 *
	 * @param string $id Existing id.
	 */
	public function reserve( string $id ): void {
		if ( '' !== $id ) {
			$this->used[ self::fold( $id ) ] = true;
		}
	}

	/**
	 * Lowercases an id for comparison. Hosts without mbstring fall back to ASCII.
	 *
	 * @param string $id Element id.
	 */
	private static function fold( string $id ): string {
		return function_exists( 'mb_strtolower' ) ? mb_strtolower( $id, 'UTF-8' ) : strtolower( $id );
	}

	/**
	 * Returns an id for the given text that is unique within this slugger, and
	 * marks it as taken.
	 *
	 * @param string $text Plain heading text.
	 */
	public function make( string $text ): string {
		$base = self::slug( $text );
		$id   = $base;
		$n    = 2;

		while ( isset( $this->used[ self::fold( $id ) ] ) ) {
			$id = $base . '_' . $n;
			++$n;
		}

		$this->reserve( $id );

		return $id;
	}

	/**
	 * The id for a text before any collision handling.
	 *
	 * @param string $text Plain heading text.
	 */
	public static function slug( string $text ): string {
		// Straight and typographic apostrophes disappear: "Farmer's" becomes "Farmers".
		$text = str_replace( array( "'", "\u{2019}", "\u{2018}", "\u{02BC}" ), '', $text );
		$slug = preg_replace( '/[^\p{L}\p{M}\p{N}]+/u', '_', $text );

		// preg_replace() returns null on invalid UTF-8.
		if ( ! is_string( $slug ) ) {
			return self::FALLBACK;
		}

		$slug = trim( $slug, '_' );

		return '' === $slug ? self::FALLBACK : $slug;
	}

	/**
	 * The visible text of a piece of heading markup: tags removed, entities
	 * decoded, whitespace collapsed. Shared by the collector and the injector so
	 * both see identical text.
	 *
	 * @param string $html Heading markup or rich text.
	 */
	public static function plain_text( string $html ): string {
		$text = html_entity_decode( wp_strip_all_tags( $html ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$text = preg_replace( '/\s+/u', ' ', $text );

		return is_string( $text ) ? trim( $text ) : '';
	}
}
