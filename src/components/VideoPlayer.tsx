import { memo } from "react";

interface Props {
  url: string;
  title?: string;
}

export const VideoPlayer = memo(({ url, title }: Props) => {
  if (!url || url.trim() === "") return null;

  // Detect YouTube
  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
        />
      </div>
    );
  }

  // Detect Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return (
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title={title || "Video"}
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video file (mp4 etc)
  return (
    <video controls className="w-full rounded-lg bg-black">
      <source src={url} />
      Your browser does not support video playback.
    </video>
  );
});

VideoPlayer.displayName = "VideoPlayer";
