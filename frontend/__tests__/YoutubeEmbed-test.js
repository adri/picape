import { takeYoutubeLink } from '../components/Recipe/YoutubeEmbed';

// The four shapes are the ones production recipes actually carry: five of them
// hold a link, and one of those was written on a phone, so the host is not
// always www.
describe('takeYoutubeLink', () => {
  it.each([
    ['https://www.youtube.com/watch?v=sX1eGd9BNY4', 'sX1eGd9BNY4'],
    ['https://m.youtube.com/watch?v=fEGoNZgB1OY', 'fEGoNZgB1OY'],
    ['https://youtu.be/E3J4ErwBL9w', 'E3J4ErwBL9w'],
    ['https://www.youtube.com/shorts/gRPNFC1z2Kk', 'gRPNFC1z2Kk'],
  ])('reads the video id out of %s', (url, videoId) => {
    expect(takeYoutubeLink(url).videoId).toEqual(videoId);
  });

  it('keeps the id when the link carries a start time', () => {
    expect(takeYoutubeLink('https://youtu.be/u7Hd6ZzKgBM?t=42').videoId).toEqual('u7Hd6ZzKgBM');
  });

  it('leaves a description without a link alone', () => {
    const steps = 'Kook de rijst.\n\nBak de kip.';

    expect(takeYoutubeLink(steps)).toEqual({ videoId: null, description: steps });
  });

  it('leaves a link to something else alone', () => {
    const steps = 'Zie https://www.ah.nl/allerhande/recept/R-R123 voor de rest.';

    expect(takeYoutubeLink(steps)).toEqual({ videoId: null, description: steps });
  });

  it('takes the link out of the prose it was written in', () => {
    const steps = 'Kijk eerst https://youtu.be/u7Hd6ZzKgBM\n\nKook de rijst.';

    expect(takeYoutubeLink(steps).description).toEqual('Kijk eerst \n\nKook de rijst.');
  });
});
