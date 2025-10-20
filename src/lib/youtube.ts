import ytdl from 'ytdl-core';

export function extractId(input:string): string | null {
  if(/^[\w-]{11}$/.test(input)) return input;
  
  const m = input.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
  return m ? (m[1] || m[2]) : null;
}

export async function videoInfo(id:string) {
  const info = await ytdl.getInfo(id, { 
    requestOptions: { 
      timeout: Number(process.env.YTDL_TIMEOUT_MS || 12000) 
    } 
  });
  
  const vd = info.videoDetails; 
  const micro = (info as any).player_response?.microformat?.playerMicroformatRenderer;
  
  return {
    id: vd.videoId,
    url: `https://www.youtube.com/watch?v=${vd.videoId}`,
    title: vd.title,
    description: vd.description || '',
    author: vd.author?.name || '',
    channelId: vd.channelId || vd.author?.id || '',
    thumbnails: vd.thumbnails || [],
    uploadDate: micro?.uploadDate || null,
    lengthSeconds: Number(vd.lengthSeconds || 0),
    viewCount: Number(vd.viewCount || 0),
    keywords: vd.keywords || [],
    availableCountries: micro?.availableCountries || null,
    isLive: vd.isLiveContent || false,
  };
}