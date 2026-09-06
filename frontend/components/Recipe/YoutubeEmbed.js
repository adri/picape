import { ImageBackground } from 'expo-image';
import * as React from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { CONTENT_MAX_WIDTH } from '../../constants/Layout';
import { Gutter, Radius, Spacing } from '../../constants/Spacing';
import { CircleIcon } from '../Icon';

// A YouTube link the way a recipe writes it: the desktop and the mobile watch
// page, a share link, and a short. The video id is the same eleven characters
// in every one of them.
const YOUTUBE_URL =
  /https?:\/\/(?:(?:www\.|m\.)?youtube\.com\/(?:watch\?\S*?v=|shorts\/)|youtu\.be\/)([\w-]{11})\S*/;

// A recipe has no field for its video, so the link sits in the prose that the
// screen splits into steps. Lift it out rather than leave it there: once the
// video has a player of its own, the link has nothing left to do, and a bare
// URL was never a step you tick off.
export function takeYoutubeLink(description) {
  const text = description || '';
  const match = text.match(YOUTUBE_URL);

  if (!match) return { videoId: null, description: text };

  return { videoId: match[1], description: text.replace(match[0], '') };
}

// The thumbnail with a play button on it, and the player only once you ask for
// one. An iframe would pull YouTube's whole player and its cookies into every
// recipe you open, so the embed stays a picture until it is worth more.
export function YoutubeEmbed({ videoId }) {
  const colors = useTheme();
  const { width } = useWindowDimensions();
  const [playing, setPlaying] = React.useState(false);

  // A video is 16:9, and the frame is measured off the content column rather
  // than given an `aspectRatio`: react-native-web emits the CSS property, but
  // the scroll view's flex column leaves the box taller than the ratio asks
  // for, and the thumbnail then keeps the black bars YouTube bakes into it
  // instead of having them cropped away.
  const height = Math.round(((Math.min(width, CONTENT_MAX_WIDTH) - Gutter * 2) * 9) / 16);

  // The player is an iframe, which the web has and the iOS target this app
  // declares does not. That target ships nowhere, so there is nothing here to
  // fall back to.
  if (Platform.OS !== 'web') return null;

  return (
    <View
      style={{
        marginHorizontal: Gutter,
        marginBottom: Spacing.lg,
        height,
        borderRadius: Radius.md,
        overflow: 'hidden',
        backgroundColor: colors.cardBackground,
      }}>
      {playing ? (
        <iframe
          title="YouTube"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          style={{ width: '100%', height: '100%', border: 0 }}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <ImageBackground
          source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
          contentFit="cover"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <CircleIcon
            name="play"
            selected
            accessibilityLabel="Video afspelen"
            onPress={(e) => {
              e.preventDefault();
              setPlaying(true);
            }}
          />
        </ImageBackground>
      )}
    </View>
  );
}
