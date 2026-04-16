import Image from 'next/image';
import { Youtube } from '../icons';

export type VideoItem = {
  id: string | number;
  youtubeId: string;
  title: string;
  thumbnail: { url: string; alt?: string } | null;
};

type Props = { videos: VideoItem[] };

function thumbnailSrc(v: VideoItem): string {
  if (v.thumbnail?.url) return v.thumbnail.url;
  return `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
}

function VideoLink({ video, isHero }: { video: VideoItem; isHero: boolean }) {
  const src = thumbnailSrc(video);
  return (
    <a
      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
      target="_blank"
      rel="nofollow noreferrer"
      className={isHero ? 'video-item hero' : 'video-item'}
      aria-label={video.title}
    >
      <Image
        src={src}
        alt={video.thumbnail?.alt ?? video.title}
        width={isHero ? 800 : 400}
        height={isHero ? 450 : 225}
        sizes={isHero ? '(max-width:767px) 100vw, 67vw' : '(max-width:767px) 100vw, 33vw'}
        unoptimized={!video.thumbnail?.url}
      />
      <span className="video-play-badge" aria-hidden="true">
        <Youtube size={48} />
      </span>
      <span className="video-caption">{video.title}</span>
    </a>
  );
}

export function VideoShowcase({ videos }: Props) {
  if (!videos || videos.length === 0) return null;
  const hero = videos[0];
  const side = videos.slice(1, 3);
  if (!hero) return null;
  return (
    <div id="content-row-videos" className="nh-row py-30 mb-30 block-video-showcase">
      <div className="container">
        <h2 className="section-title-center">VIDEO CÔNG TRÌNH THI CÔNG</h2>
        <div className="video-grid" data-count={videos.length}>
          <VideoLink video={hero} isHero />
          {side.map((v) => (
            <VideoLink key={v.id} video={v} isHero={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
