<?php
// $Id: virtualcutter.pages.inc 267 2011-12-01 16:37:37Z thijs $

/**
 * @file
 * Page callbacks and theme functions for those pages.
 */

/**
 * Page callback function for displaying the Virtual cutter.
 */
function virtualcutter_presentation_page($presentation) {
  $output = '';

  if (!empty($presentation->title)) {
    drupal_set_title($presentation->title);
  }

  if (isset($presentation->videosources[0]) && !empty($presentation->videosources[0]->transcodings)) {
    $output = theme('virtualcutter', array('presentation' => $presentation));
  }
  else {
    drupal_set_message(t('The requested video is not (yet) transcoded to a usable format.'), 'warning');
    return ' ';
  }

  return $output;
}

/**
 * Helper function for preprocessing the first token replacements that need to
 * be done by the module.
 */
function _virtualcutter_token_replacements($string, $presentation) {
  $replacements = array(
    '{%asset_id%}' => (isset($presentation->asset_id) ? $presentation->asset_id : ''),
    '{%asset_title%}' => (isset($presentation->title) ? $presentation->title : ''),
  );

  return strtr($string, $replacements);
}

/**
 * Theme function for rendering the video cutter interface.
 */
function theme_virtualcutter($variables) {
  $fideo = weblectures_mm_presentation_to_fideo($variables['presentation']);
  $video = (isset($fideo['primary']) ? $fideo['primary'] : (isset($fideo[0]) ? $fideo[0] : FALSE));
  if (!$video) {
    return '';
  }

  $path = drupal_get_path('module', 'virtualcutter') . '/assets';
  drupal_add_js($path . '/virtualcutter.all.js', array(
    'every_page' => FALSE,
  ));
  drupal_add_css($path . '/virtualcutter.all.css', array(
    'every_page' => FALSE,
  ));

  $video_attributes = array('class' => array('video-js'), 'width' => '100%', 'preload' => 'auto');
  $settings = array(
    'vc_basepath' => base_path() . $path,
    'vc_share_url' => _virtualcutter_token_replacements(variable_get('virtualcutter_playback_url', ''), $variables['presentation']),
    'vc_share_embed' => _virtualcutter_token_replacements(variable_get('virtualcutter_embed_code', VIRTUALCUTTER_DEFAULT_EMBED), $variables['presentation']),
    'vc_duration' => (!empty($video['#duration']) ? $video['#duration'] : FALSE),
  );

  // Check if width and height is set, so we can provide a default ratio.
  if (isset($video['#attributes']['width'], $video['#attributes']['height'])) {
    $settings['vc_ratio'] = $video['#attributes']['height'] / $video['#attributes']['width'];
  }

  // Add the settings to the Drupal.settings in Javascript.
  drupal_add_js($settings, 'setting');

  $sources = array();
  $flash_sources = array();
  foreach (element_children($video) as $key) {
    if (isset($video[$key]['#type']) && $video[$key]['#type'] == 'source') {
      if (empty($video[$key]['#file']) && !empty($video[$key]['#src'])) {
        $video[$key]['#file'] = $video[$key]['#src'];
      }
      $type = isset($video[$key]['#mimetype']) ? check_plain($video[$key]['#mimetype']) : '';
      if (preg_match('#video/(x\-)?(mp4|m4v)#i', $type) || preg_match('#\.(flv|mp4)$#i', $video[$key]['#file'])) {
        $flash_sources[] = $video[$key]['#file'];
      }
      if (!empty($video[$key]['#codecs'])) {
        $type .= '; codecs="' . check_plain($video[$key]['#codecs']) . '"';
      }
      $sources[] = '<source type=\'' . $type . '\' src="' . check_url($video[$key]['#file']) . '" />';
    }
  }

  $output = '';
  $output .= '<div id="virtualcutter" class="virtualcutter">';
  $output .= '<div class="player">';

  // Set the poster attribute, if there's a poster available.
  if (!empty($video['#poster'])) {
    $video_attributes['poster'] = $video['#poster'];
  }

  // Grab the first matching Flash-playable source.
  if (count($flash_sources) > 0) {
    $video_attributes['data-fallback'] = $flash_sources[0];
  }

  $output .= '<video' . drupal_attributes($video_attributes) . '>';
  $output .= implode("\n", $sources);

  if (!empty($video['#poster'])) {
    $output .= theme('image', array('path' => $video['#poster'], 'alt' => t('Poster image')));
  }
  $output .= '<p>' . t('Your browser is unable to play any of the available video formats.') . '</p>';
  $output .= '</video>';

  $output .= '</div>';
  $output .= '<div class="vc-controls"> </div>';

  // @todo Clean this up a bit.
  $output .= '
  <div class="vc-extras">

    <!-- Timing elements -->
    <div class="markers box">
      <h2>' . t('Select a clip') . '</h2>
      <div class="box_content">
        <div class="start_mark">
          <button class="btn-mark-start" type="button" title="' . check_plain(t('Click this button to set the start mark at the current play time.')) . '"><span>' . t('Mark start') . '</span></button>
          <input type="text" class="txt-mark txt-start-mark" value="00:00:00" maxlength="11" />
          <button class="play-from-here" type="button" title="' . check_plain(t('Click this button to play the clip from start to end mark.')) . '"><span>' . t('Preview clip') . '</span></button>
        </div>

        <div class="end_mark">
          <button class="btn-mark-end" type="button" title="' . check_plain(t('Click this button to set the end mark at the current play time.')) . '"><span>' . t('Mark end') . '</span></button>
          <input type="text" class="txt-mark txt-end-mark" value="" maxlength="11" />
        </div>
      </div>
    </div>

    <!-- Sharing elements -->
    <div class="links box">
      <h2>' . t('Share your clip') . '</h2>
      <div class="box_content">
        <div class="vc-item" title="' . check_plain(t('Copy this web-address (URL) for linking to the clip from a presentation or e-mail message.')) . '">
          <label for="vc-share-url">' . t('Share URL') . ':</label>
          <input type="text" id="vc-share-url" value="" readonly="readonly" class="txt-share-url" id="share-url" />
        </div>

        <div class="vc-item" title="' . check_plain(t('Copy this HTML code for embedding the clip inside another website. Note that not all websites allow embedding using iframe code.')) . '">
          <label for="vc-share-embed">'. t('Embed code') . ':</label>
          <input type="text" id="vc-share-embed" value="" readonly="readonly" class="txt-share-embed" id="share-iframe" />
        </div>
      </div>
    </div>
  </div>
  ';

  $output .= '</div>';

  return $output;
}
